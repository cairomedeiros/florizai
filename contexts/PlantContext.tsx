import Constants, { ExecutionEnvironment } from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';

// ponytail: notifications no-op on web AND in Expo Go (SDK 53+ removed
// expo-notifications there — needs a dev build). Even a static import triggers
// push-token auto-registration (and an ERROR log in Expo Go), so the module is
// only require()d when it can actually run.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const canNotify = Platform.OS !== 'web' && !isExpoGo;
const Notifications: typeof import('expo-notifications') | null = canNotify
  ? require('expo-notifications')
  : null;

// Fallback cadence when the backend hasn't inferred one yet (LLM sets
// watering_interval_days from name+description, then refines via the photo).
const WATERING_INTERVAL_DAYS = 7;

export type Plant = {
  id: string;
  name: string;
  description?: string;
  imageUri?: string;
  thumbnailUri?: string; // lighter image for card grids; falls back to imageUri
  nextWatering: Date;
  wateringIntervalDays: number; // LLM-suggested cadence (falls back to 7)
  createdAt: Date;
  wateringHistory: string[]; // ISO date strings (YYYY-MM-DD)
};

interface PlantContextType {
  plants: Plant[];
  isLoading: boolean;
  addPlant: (data: { name: string; description?: string; imageUri?: string; nextWatering: Date }) => Promise<void>;
  updatePlant: (id: string, data: { name?: string; description?: string; imageUri?: string }) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  markWatered: (id: string) => Promise<void>;
  refreshPlants: () => Promise<void>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function scheduleWateringNotification(plant: Plant) {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(plant.id).catch(() => {});

  const trigger = new Date(plant.nextWatering);
  trigger.setHours(8, 0, 0, 0);
  if (trigger <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: plant.id,
    content: {
      title: 'Hora de regar!',
      body: `${plant.name} precisa de água hoje.`,
      data: { plantId: plant.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// api.Plant + its watering events -> the shape the screens consume.
function toPlant(p: api.Plant, events: api.WateringEvent[]): Plant {
  const history = events.map((e) => e.watered_at.split('T')[0]).sort();
  const last = history.length ? new Date(history[history.length - 1]) : new Date(p.created_at);
  const interval = p.watering_interval_days ?? WATERING_INTERVAL_DAYS;
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    imageUri: api.imageUrl(p.file_path ?? p.pictures[0]?.image_path),
    thumbnailUri: api.imageUrl(p.pictures[0]?.thumbnail_path ?? p.file_path ?? p.pictures[0]?.image_path),
    nextWatering: addDays(last, interval),
    wateringIntervalDays: interval,
    createdAt: new Date(p.created_at),
    wateringHistory: history,
  };
}

function fileFromUri(uri: string): api.ImageFile {
  const name = uri.split('/').pop() || 'photo.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  return { uri, name, type: ext === 'png' ? 'image/png' : 'image/jpeg' };
}

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlants = useCallback(async () => {
    try {
      const raw = await api.listPlants();
      // ponytail: N+1 — one watering-events fetch per plant. Fine for a small
      // garden; add a batch endpoint if a user ever has dozens of plants.
      const loaded = await Promise.all(
        raw.map(async (p) => toPlant(p, await api.listWateringEvents(p.id).catch(() => [])))
      );
      setPlants(loaded);
    } catch (e) {
      console.error('Failed to load plants', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fetch once logged in — otherwise we hit /plant/plants with no token (401).
  // Clear the garden on logout so the next user doesn't see stale plants.
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      setPlants([]);
      setIsLoading(false);
      return;
    }
    loadPlants();
    Notifications?.requestPermissionsAsync();
  }, [user, loadPlants]);

  const addPlant = async (data: { name: string; description?: string; imageUri?: string; nextWatering: Date }) => {
    const created = await api.createPlant(data.name, data.description);
    if (data.imageUri) {
      await api.addPlantPicture(created.id, fileFromUri(data.imageUri)).catch((e) =>
        console.error('Failed to upload plant picture', e)
      );
    }
    await loadPlants();
    const plant = toPlant(created, []);
    await scheduleWateringNotification(plant);
  };

  const updatePlant = async (id: string, data: { name?: string; description?: string; imageUri?: string }) => {
    const current = plants.find((p) => p.id === id);
    await api.updatePlant(id, data.name ?? current?.name ?? '', data.description ?? current?.description);
    if (data.imageUri) {
      await api.addPlantPicture(id, fileFromUri(data.imageUri)).catch((e) =>
        console.error('Failed to upload plant picture', e)
      );
    }
    await loadPlants();
  };

  const deletePlant = async (id: string) => {
    if (Notifications) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await api.deletePlant(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
  };

  const markWatered = async (id: string) => {
    await api.addWateringEvent(id);
    const today = new Date().toISOString().split('T')[0];
    const updated = plants.map((p) =>
      p.id === id
        ? { ...p, nextWatering: addDays(new Date(), p.wateringIntervalDays), wateringHistory: [...p.wateringHistory, today] }
        : p
    );
    setPlants(updated);
    const plant = updated.find((p) => p.id === id);
    if (plant) await scheduleWateringNotification(plant);
  };

  return (
    <PlantContext.Provider
      value={{ plants, isLoading, addPlant, updatePlant, deletePlant, markWatered, refreshPlants: loadPlants }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error('usePlants must be used within PlantProvider');
  return ctx;
}
