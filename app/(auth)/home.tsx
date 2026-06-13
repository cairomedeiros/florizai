import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { Plant, usePlants } from '../../contexts/PlantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnimatedList } from '../../hooks/useAnimatedList';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors, isDark, theme, setTheme } = useTheme();
  const { plants, isLoading, markWatered, deletePlant, refreshPlants } = usePlants();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const username = user?.name ?? 'Usuário';

  const filtered = plants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const plantsToWaterToday = plants.filter((plant) => {
    const today = new Date();
    const next = new Date(plant.nextWatering);
    return (
      next.getDate() === today.getDate() &&
      next.getMonth() === today.getMonth() &&
      next.getFullYear() === today.getFullYear()
    );
  }).length;

  const anims = useAnimatedList(filtered.length);

  const handleAddPlant = () => router.push('/(auth)/plant-setup' as any);
  const handlePlantPress = (id: string) => router.push(`/(auth)/plant-chat?id=${id}` as any);
  const handleSettings = () => router.push('/(auth)/settings' as any);

  const handleMarkWatered = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markWatered(id);
  };

  const handleDelete = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await deletePlant(id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPlants();
    setRefreshing(false);
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };
  const themeIcon = theme === 'light' ? 'moon' : theme === 'dark' ? 'sunny' : 'contrast';

  const formatNextWatering = (date: Date) => {
    const today = new Date();
    const next = new Date(date);
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Regar hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return 'Atrasada';
    return `Em ${diffDays} dias`;
  };

  const getHealthScore = (plant: Plant) => {
    if (plant.wateringHistory.length === 0) return 0;
    const recent = plant.wateringHistory.slice(-4).length;
    return Math.round((recent / 4) * 100);
  };

  const healthColor = (score: number) => {
    if (score >= 75) return colors.success;
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    headerLeft: { flex: 1 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary },
    themeButton: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.background,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    searchRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, paddingHorizontal: 12, gap: 8,
    },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text },
    statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
    statCard: {
      flex: 1, backgroundColor: colors.surface,
      borderRadius: 12, padding: 12,
      alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 4 },
    statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
    emptyContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: 40, paddingBottom: 80 + insets.bottom,
    },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    emptyCTA: {
      backgroundColor: colors.primary, flexDirection: 'row',
      alignItems: 'center', gap: 8,
      paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24,
    },
    emptyCTAText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    plantGrid: {
      paddingTop: 16, paddingHorizontal: 20,
      paddingBottom: 100 + insets.bottom,
    },
    plantCard: {
      backgroundColor: colors.surface, borderRadius: 16,
      padding: 16, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    plantImage: {
      width: '100%', height: 120, borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    plantName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
    plantWatering: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    plantWateringText: { fontSize: 13, color: colors.textSecondary },
    healthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    healthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' },
    healthFill: { height: '100%', borderRadius: 2 },
    healthLabel: { fontSize: 11, color: colors.textSecondary, minWidth: 28, textAlign: 'right' },
    cardActions: { flexDirection: 'row', gap: 8 },
    waterBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, backgroundColor: colors.primary,
      paddingVertical: 8, borderRadius: 10,
    },
    waterBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    deleteBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    fab: {
      position: 'absolute', bottom: 24 + insets.bottom, right: 24,
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
    },
    skeletonGridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  });

  const renderPlantCard = ({ item, index }: { item: Plant; index: number }) => {
    const anim = anims[index] ?? new Animated.Value(1);
    const score = getHealthScore(item);
    return (
      <Animated.View
        style={{
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
          flex: 1,
          marginRight: index % 2 === 0 ? 6 : 0,
          marginLeft: index % 2 === 1 ? 6 : 0,
        }}
      >
        <Pressable style={styles.plantCard} onPress={() => handlePlantPress(item.id)}>
          <View style={styles.plantImage}>
            <Ionicons name="leaf" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.plantName}>{item.name}</Text>
          <View style={styles.plantWatering}>
            <Ionicons name="water" size={14} color={colors.textSecondary} />
            <Text style={styles.plantWateringText}>{formatNextWatering(item.nextWatering)}</Text>
          </View>
          <View style={styles.healthRow}>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: `${score}%`, backgroundColor: healthColor(score) }]} />
            </View>
            <Text style={styles.healthLabel}>{score}%</Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable style={styles.waterBtn} onPress={() => handleMarkWatered(item.id)}>
              <Ionicons name="water" size={14} color="#fff" />
              <Text style={styles.waterBtnText}>Reguei</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Skeleton width={200} height={28} borderRadius={10} />
              <Skeleton width={180} height={16} style={{ marginTop: 8 }} />
            </View>
            <Skeleton width={36} height={36} borderRadius={18} />
          </View>
          <Skeleton height={42} borderRadius={12} />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Skeleton width={24} height={24} borderRadius={6} />
            <Skeleton width={30} height={22} style={{ marginTop: 8 }} />
            <Skeleton width={55} height={12} style={{ marginTop: 6 }} />
          </View>
          <View style={styles.statCard}>
            <Skeleton width={24} height={24} borderRadius={6} />
            <Skeleton width={30} height={22} style={{ marginTop: 8 }} />
            <Skeleton width={70} height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={styles.plantGrid}>
          {[0, 1].map((row) => (
            <View key={row} style={styles.skeletonGridRow}>
              {[0, 1].map((col) => (
                <View key={col} style={[styles.plantCard, { flex: 1, marginBottom: 0 }]}>
                  <Skeleton height={120} borderRadius={12} style={{ marginBottom: 12 }} />
                  <Skeleton width={100} height={16} />
                  <Skeleton width={90} height={13} style={{ marginTop: 8 }} />
                </View>
              ))}
            </View>
          ))}
        </View>
        <Skeleton width={56} height={56} borderRadius={28} style={{ position: 'absolute', bottom: 24, right: 24 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá, {username}</Text>
            <Text style={styles.headerSubtitle}>Cuide bem das suas plantinhas</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={styles.themeButton} onPress={toggleTheme}>
              <Ionicons name={themeIcon as any} size={18} color={colors.text} />
            </Pressable>
            <Pressable style={styles.themeButton} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar plantas..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {plants.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{plants.length}</Text>
            <Text style={styles.statLabel}>plantas</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{plantsToWaterToday}</Text>
            <Text style={styles.statLabel}>p/ regar hoje</Text>
          </View>
        </View>
      )}

      {filtered.length === 0 && search.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Nenhuma planta encontrada</Text>
          <Text style={styles.emptySubtitle}>Tente buscar por outro nome.</Text>
        </View>
      ) : plants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={80} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Seu jardim está vazio</Text>
          <Text style={styles.emptySubtitle}>Adicione sua primeira planta e comece a cuidar dela.</Text>
          <Pressable style={styles.emptyCTA} onPress={handleAddPlant}>
            <Ionicons name="add" size={24} color="#ffffff" />
            <Text style={styles.emptyCTAText}>Adicionar primeira planta</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.plantGrid}
          columnWrapperStyle={{ gap: 0 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <Pressable style={styles.fab} onPress={handleAddPlant}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}
