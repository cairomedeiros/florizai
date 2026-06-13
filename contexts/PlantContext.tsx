import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Plant = {
  id: string;
  name: string;
  species?: string;
  description?: string;
  location?: string;
  imageUri?: string;
  nextWatering: Date;
  createdAt: Date;
  wateringHistory: string[]; // ISO date strings
};

interface PlantContextType {
  plants: Plant[];
  isLoading: boolean;
  addPlant: (data: Omit<Plant, 'id' | 'createdAt' | 'wateringHistory'>) => Promise<void>;
  updatePlant: (id: string, data: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  markWatered: (id: string) => Promise<void>;
  refreshPlants: () => Promise<void>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

const STORAGE_KEY = '@florizai:plants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function scheduleWateringNotification(plant: Plant) {
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

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlants = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json) as Plant[];
        setPlants(
          parsed.map((p) => ({
            ...p,
            nextWatering: new Date(p.nextWatering),
            createdAt: new Date(p.createdAt),
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load plants', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlants();
    Notifications.requestPermissionsAsync();
  }, [loadPlants]);

  const persist = async (updated: Plant[]) => {
    setPlants(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addPlant = async (data: Omit<Plant, 'id' | 'createdAt' | 'wateringHistory'>) => {
    const plant: Plant = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      wateringHistory: [],
    };
    const updated = [plant, ...plants];
    await persist(updated);
    await scheduleWateringNotification(plant);
  };

  const updatePlant = async (id: string, data: Partial<Plant>) => {
    const updated = plants.map((p) => (p.id === id ? { ...p, ...data } : p));
    await persist(updated);
    const plant = updated.find((p) => p.id === id);
    if (plant) await scheduleWateringNotification(plant);
  };

  const deletePlant = async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await persist(plants.filter((p) => p.id !== id));
  };

  const markWatered = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = plants.map((p) => {
      if (p.id !== id) return p;
      const next = new Date();
      next.setDate(next.getDate() + 7);
      return {
        ...p,
        nextWatering: next,
        wateringHistory: [...p.wateringHistory, today],
      };
    });
    await persist(updated);
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
