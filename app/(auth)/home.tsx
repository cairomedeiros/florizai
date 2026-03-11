import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

type Plant = {
  id: string;
  name: string;
  species: string;
  location: string;
  nextWatering: Date;
  imageUrl?: string;
};

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { colors, isDark, setTheme } = useTheme();
  const router = useRouter();

  // TODO: Replace with real data from database
  const [plants, setPlants] = useState<Plant[]>([]);
  const [username] = useState('Usuário'); // TODO: Get from auth context

  const plantsToWaterToday = plants.filter(plant => {
    const today = new Date();
    const nextWater = new Date(plant.nextWatering);
    return (
      nextWater.getDate() === today.getDate() &&
      nextWater.getMonth() === today.getMonth() &&
      nextWater.getFullYear() === today.getFullYear()
    );
  }).length;

  const handleAddPlant = () => {
    router.push('/(auth)/onboarding' as any);
  };

  const handlePlantPress = (plantId: string) => {
    router.push(`/(auth)/plant-chat?id=${plantId}` as any);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const formatNextWatering = (date: Date) => {
    const today = new Date();
    const nextWater = new Date(date);
    const diffTime = nextWater.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Regar hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return 'Atrasada!';
    return `Em ${diffDays} dias`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    themeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingBottom: 80,
    },
    emptyIcon: {
      fontSize: 80,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    emptyCTA: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 24,
    },
    emptyCTAText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    plantGrid: {
      paddingTop: 16,
      paddingBottom: 100,
    },
    plantCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    plantImage: {
      width: '100%',
      height: 120,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    plantEmoji: {
      fontSize: 48,
    },
    plantName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    plantWatering: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    plantWateringText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });

  const renderPlantCard = ({ item, index }: { item: Plant; index: number }) => (
    <Pressable
      style={[styles.plantCard, { marginRight: index % 2 === 0 ? 6 : 0, marginLeft: index % 2 === 1 ? 6 : 0 }]}
      onPress={() => handlePlantPress(item.id)}
    >
      <View style={styles.plantImage}>
        <Text style={styles.plantEmoji}>🌿</Text>
      </View>
      <Text style={styles.plantName}>{item.name}</Text>
      <View style={styles.plantWatering}>
        <Ionicons name="water" size={14} color={colors.textSecondary} />
        <Text style={styles.plantWateringText}>{formatNextWatering(item.nextWatering)}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá, {username} 👋</Text>
            <Text style={styles.headerSubtitle}>Cuide bem das suas plantinhas</Text>
          </View>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>🌱</Text>
          <Text style={styles.statNumber}>{plants.length}</Text>
          <Text style={styles.statLabel}>plantas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>💧</Text>
          <Text style={styles.statNumber}>{plantsToWaterToday}</Text>
          <Text style={styles.statLabel}>p/ regar hoje</Text>
        </View>
      </View>

      {/* Content */}
      {plants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🪴</Text>
          <Text style={styles.emptyTitle}>Seu jardim está vazio</Text>
          <Text style={styles.emptySubtitle}>
            Adicione sua primeira planta e comece a cuidar dela!
          </Text>
          <Pressable style={styles.emptyCTA} onPress={handleAddPlant}>
            <Ionicons name="add" size={24} color="#ffffff" />
            <Text style={styles.emptyCTAText}>Adicionar primeira planta</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.plantGrid}
          columnWrapperStyle={{ gap: 0 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      {plants.length > 0 && (
        <Pressable style={styles.fab} onPress={handleAddPlant}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      )}
    </View>
  );
}
