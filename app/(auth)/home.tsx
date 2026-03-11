import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

type Plant = {
  id: string;
  name: string;
  species: string;
  location: string;
  wateringFrequency: string;
  lastWatered?: Date;
  photoCount: number;
};

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { colors, isDark, setTheme } = useTheme();
  const router = useRouter();

  // TODO: Replace with real data from database
  const [plants, setPlants] = useState<Plant[]>([]);

  const handleAddPlant = () => {
    router.push('/(auth)/onboarding' as any);
  };

  const handlePlantChat = (plantId: string) => {
    router.push(`/(auth)/plant-chat?id=${plantId}` as any);
  };

  const handleWateringCalendar = (plantId: string) => {
    router.push(`/(auth)/watering-calendar?id=${plantId}` as any);
  };

  const handlePhotoTimeline = (plantId: string) => {
    router.push(`/(auth)/photo-timeline?id=${plantId}` as any);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerLeft: {
      flex: 1,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeButtonText: {
      fontSize: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 30,
      fontWeight: '400',
      paddingBottom: 2,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    plantCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    plantHeader: {
      marginBottom: 16,
    },
    plantName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    plantInfo: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    actionText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    actionTextPrimary: {
      color: '#ffffff',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>🌸 Minhas Plantas</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddPlant}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {plants.length} {plants.length === 1 ? 'planta' : 'plantas'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {plants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Você ainda não tem plantas cadastradas. Que tal adicionar sua primeira plantinha?
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary, { flex: 0, paddingHorizontal: 32 }]}
              onPress={handleAddPlant}
            >
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Adicionar Planta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plants.map((plant) => (
            <View key={plant.id} style={styles.plantCard}>
              <View style={styles.plantHeader}>
                <Text style={styles.plantName}>{plant.name}</Text>
                <Text style={styles.plantInfo}>🌱 {plant.species}</Text>
                <Text style={styles.plantInfo}>📍 {plant.location}</Text>
                <Text style={styles.plantInfo}>💧 {plant.wateringFrequency}</Text>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => handlePlantChat(plant.id)}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={[styles.actionText, styles.actionTextPrimary]}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleWateringCalendar(plant.id)}
                >
                  <Text style={styles.actionIcon}>💧</Text>
                  <Text style={styles.actionText}>Rega</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handlePhotoTimeline(plant.id)}
                >
                  <Text style={styles.actionIcon}>📸</Text>
                  <Text style={styles.actionText}>Fotos</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
