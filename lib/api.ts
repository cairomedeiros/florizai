import AsyncStorage from '@react-native-async-storage/async-storage';

// EXPO_PUBLIC_API_URL overrides for device/prod. Default is the LAN IP so a
// physical phone reaches the dev server (localhost on the phone = the phone).
export const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.7:8000';

// Storage paths come back as bucket keys (user/file). The /storage route signs
// them (private bucket) and redirects, so <Image> can load directly.
export const imageUrl = (path?: string | null) =>
  !path ? undefined : path.startsWith('http') ? path : `${BASE}/storage/${path.replace(/^\/+/, '')}`;
const TOKEN_KEY = '@florizai:access_token';

// ---- types (from FRONTEND.md) ----
export type UserSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export type Chat = {
  id: string;
  plant_id: string;
  user_id: string;
  summary: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  image_path: string | null;
  created_at: string;
};

export type AskResponse = {
  answer: string;
  sources: string[];
  confidence: number;
};

export type PlantPicture = {
  id: string;
  image_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
};

export type Plant = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  watering_interval_days: number | null;
  file_path: string | null;
  pictures: PlantPicture[];
};

export type WateringEvent = {
  id: string;
  plant_id: string;
  watered_at: string;
  created_at: string;
};

// React Native multipart file shape.
export type ImageFile = { uri: string; name: string; type: string };

const fileField = (image: ImageFile) => {
  const form = new FormData();
  // RN typing: FormData accepts the {uri,name,type} object at runtime.
  form.append('image', image as unknown as Blob);
  return form;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---- token ----
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => AsyncStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

// ponytail: AbortController + setTimeout, not AbortSignal.timeout() — Hermes
// doesn't ship the latter reliably. 30s covers slow RAG/Groq calls.
const TIMEOUT_MS = 30_000;

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; form?: FormData; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, form, auth = true } = opts;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData — the runtime adds the boundary.
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(0, 'A resposta demorou demais. Tente de novo.');
    }
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique sua internet.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    // FastAPI 422 returns detail as an array of {msg,...}; flatten to a string
    // so it doesn't render as "[object Object]".
    const d = detail?.detail;
    const msg =
      typeof d === 'string' ? d
      : Array.isArray(d) ? d.map((e) => e?.msg ?? String(e)).join(', ')
      : `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return res.json();
}

// ---- auth ----
export async function signUp(name: string, email: string, password: string) {
  const session = await request<UserSession>('/user/sign_up', {
    method: 'POST',
    auth: false,
    body: { name, email, password, disabled: false },
  });
  await setToken(session.access_token);
  return session;
}

export async function login(email: string, password: string) {
  const session = await request<UserSession>('/user/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  await setToken(session.access_token);
  return session;
}

// ---- chat ----
export const createChat = (plant_id: string) =>
  request<Chat>('/chat/create', { method: 'POST', body: { plant_id } });

export const getChat = (chatId: string) => request<Chat>(`/chat/get/${chatId}`);

export const deleteChat = (chatId: string) =>
  request<{ message: string }>(`/chat/delete/${chatId}`, { method: 'DELETE' });

// ---- messages ----
export function sendMessage(chatId: string, opts: { content?: string; image?: ImageFile }) {
  const form = new FormData();
  form.append('chat_id', chatId);
  if (opts.content) form.append('content', opts.content);
  // RN typing: FormData accepts the {uri,name,type} object at runtime.
  if (opts.image) form.append('image', opts.image as unknown as Blob);
  return request<Message>('/message/create', { method: 'POST', form });
}

// Returns [] instead of throwing on an empty chat (API gives 404 there).
export async function listMessages(chatId: string): Promise<Message[]> {
  try {
    const msgs = await request<Message[]>(`/message/list/${chatId}`);
    return msgs.reverse(); // API is desc; flip to chronological.
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  }
}

export const deleteMessage = (chatId: string, messageId: string) =>
  request<{ message: string }>(`/message/delete/${chatId}/${messageId}`, { method: 'DELETE' });

// ---- standalone RAG ----
export const ask = (question: string) =>
  request<AskResponse>('/ai/ask', { method: 'POST', body: { question } });

// ---- plants ----
export const listPlants = () => request<Plant[]>('/plant/plants');
export const getPlant = (id: string) => request<Plant>(`/plant/plants/${id}`);
export const createPlant = (name: string, description?: string) =>
  request<Plant>('/plant/plants', { method: 'POST', body: { name, description: description || null } });
// Note: backend route is literally "/plantplants/{id}" (missing slash) — matched on purpose.
export const updatePlant = (id: string, name: string, description?: string) =>
  request<Plant>(`/plantplants/${id}`, { method: 'PATCH', body: { name, description: description || null } });
export const deletePlant = (id: string) =>
  request<{ message: string }>(`/plant/plants/${id}`, { method: 'DELETE' });

// ---- plant pictures ----
export const listPlantPictures = (plantId: string) =>
  request<PlantPicture[]>(`/plant_pictures/list/${plantId}`);
export const addPlantPicture = (plantId: string, image: ImageFile) =>
  request<PlantPicture>(`/plant_pictures/create?plant_id=${plantId}`, { method: 'POST', form: fileField(image) });
export const deletePlantPictures = (plantId: string) =>
  request<{ message: string }>(`/plant_pictures/delete/${plantId}`, { method: 'DELETE' });

// ---- watering events & reminders ----
export const listWateringEvents = (plantId: string) =>
  request<WateringEvent[]>(`/watering_events/list/${plantId}`);
export const addWateringEvent = (plantId: string, wateredAt: string = new Date().toISOString()) =>
  request<WateringEvent>('/watering_events/create', { method: 'POST', body: { plant_id: plantId, watered_at: wateredAt } });
export const deleteWateringEvents = (plantId: string) =>
  request<{ message: string }>(`/watering_events/delete/${plantId}`, { method: 'DELETE' });
export const setReminder = (plantId: string, frequency: string) =>
  request<unknown>(`/watering_events/reminders/${plantId}`, { method: 'POST', body: { frequency } });
export const deleteReminder = (plantId: string) =>
  request<{ message: string }>(`/watering_events/reminders/${plantId}`, { method: 'DELETE' });
