import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { Chip, IconButton, displayFont } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { Plant, usePlants } from '../../contexts/PlantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnimatedList } from '../../hooks/useAnimatedList';
import { confirmDestructive } from '../../lib/confirm';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const { plants, isLoading, markWatered, deletePlant, refreshPlants } = usePlants();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const username = user?.name ?? 'Usuário';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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
  const handleTimeline = (id: string) => router.push(`/(auth)/photo-timeline?id=${id}` as any);
  const handleCalendar = (id: string) => router.push(`/(auth)/watering-calendar?id=${id}` as any);
  const handleSettings = () => router.push('/(auth)/settings' as any);

  const handleMarkWatered = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markWatered(id);
  };

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    confirmDestructive(
      `Excluir ${name}?`,
      'Isso remove a planta e todos os dados atrelados (fotos, histórico de rega e lembretes). Não dá pra desfazer.',
      'Excluir',
      async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await deletePlant(id);
      }
    );
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

  // Without a real watering logged yet, a countdown would falsely assume the
  // plant was watered on the day it was added — show the cadence as a suggestion.
  const wateringStatus = (plant: Plant): { label: string; color: string; background: string } => {
    if (plant.wateringHistory.length === 0) {
      return {
        label: `A cada ${plant.wateringIntervalDays} dias`,
        color: colors.textSecondary,
        background: colors.surfaceAlt,
      };
    }
    const today = new Date();
    const next = new Date(plant.nextWatering);
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Atrasada', color: colors.accent, background: colors.accentSoft };
    if (diffDays === 0) return { label: 'Regar hoje', color: colors.water, background: colors.waterSoft };
    if (diffDays === 1) return { label: 'Amanhã', color: colors.water, background: colors.waterSoft };
    return { label: `Em ${diffDays} dias`, color: colors.textSecondary, background: colors.surfaceAlt };
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 4,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18,
    },
    headerLeft: { flex: 1, paddingRight: 12 },
    dateLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'capitalize',
      letterSpacing: 0.3,
      marginBottom: 4,
    },
    greeting: { fontSize: 30, fontFamily: displayFont, color: colors.text },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 16,
      gap: 8,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
    waterBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.waterSoft,
      borderRadius: 18,
      padding: 14,
      marginHorizontal: 20,
      marginTop: 16,
    },
    waterBannerIcon: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.water,
      alignItems: 'center', justifyContent: 'center',
    },
    waterBannerText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 19 },
    waterBannerBold: { fontWeight: '700', color: colors.water },
    chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 14 },
    emptyContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: 40, paddingBottom: 80 + insets.bottom,
    },
    emptyArt: {
      width: 108, height: 108, borderRadius: 54,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 26, fontFamily: displayFont, color: colors.text,
      marginBottom: 10, textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 15, color: colors.textSecondary, textAlign: 'center',
      marginBottom: 28, lineHeight: 22,
    },
    emptyCTA: {
      backgroundColor: colors.primary, flexDirection: 'row',
      alignItems: 'center', gap: 8,
      paddingVertical: 14, paddingHorizontal: 28, borderRadius: 999,
    },
    emptyCTAText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
    plantGrid: {
      paddingTop: 18, paddingHorizontal: 20,
      paddingBottom: 110 + insets.bottom,
    },
    plantCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 10,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: '#1B2A21',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    plantCardPressed: { transform: [{ scale: 0.97 }], shadowOpacity: 0.03 },
    plantImage: {
      width: '100%', height: 132, borderRadius: 16,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 10, overflow: 'hidden',
    },
    plantName: {
      fontSize: 16, fontWeight: '700', color: colors.text,
      marginBottom: 6, paddingHorizontal: 4,
    },
    statusWrap: { paddingHorizontal: 4, marginBottom: 10 },
    waterBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, backgroundColor: colors.waterSoft,
      paddingVertical: 9, borderRadius: 12,
    },
    waterBtnText: { color: colors.water, fontSize: 13, fontWeight: '700' },
    cardActions: { flexDirection: 'row', marginTop: 8 },
    ghostBtn: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    fab: {
      position: 'absolute', bottom: 24 + insets.bottom, right: 24,
      width: 58, height: 58, borderRadius: 29,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
    },
    skeletonGridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  });

  const renderPlantCard = ({ item, index }: { item: Plant; index: number }) => {
    const anim = anims[index] ?? new Animated.Value(1);
    const status = wateringStatus(item);
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
        <Pressable
          style={({ pressed }) => [styles.plantCard, pressed && styles.plantCardPressed]}
          onPress={() => handlePlantPress(item.id)}
          onLongPress={() => handleDelete(item.id, item.name)}
          delayLongPress={450}
        >
          {item.thumbnailUri ? (
            <Image source={{ uri: item.thumbnailUri }} style={styles.plantImage} contentFit="cover" />
          ) : (
            <View style={styles.plantImage}>
              <Ionicons name="leaf" size={44} color={colors.primary} />
            </View>
          )}
          <Text style={styles.plantName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.statusWrap}>
            <Chip icon="water" label={status.label} color={status.color} background={status.background} />
          </View>
          <Pressable
            style={({ pressed }) => [styles.waterBtn, pressed && { opacity: 0.7 }]}
            onPress={() => handleMarkWatered(item.id)}
          >
            <Ionicons name="water" size={14} color={colors.water} />
            <Text style={styles.waterBtnText}>Reguei</Text>
          </Pressable>
          <View style={styles.cardActions}>
            <Pressable
              style={({ pressed }) => [styles.ghostBtn, pressed && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => handleTimeline(item.id)}
            >
              <Ionicons name="images-outline" size={17} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ghostBtn, pressed && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => handleCalendar(item.id)}
            >
              <Ionicons name="calendar-outline" size={17} color={colors.textSecondary} />
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
              <Skeleton width={160} height={14} borderRadius={7} />
              <Skeleton width={220} height={32} borderRadius={10} style={{ marginTop: 8 }} />
            </View>
            <Skeleton width={88} height={40} borderRadius={20} />
          </View>
          <Skeleton height={46} borderRadius={23} />
        </View>
        <View style={styles.chipsRow}>
          <Skeleton width={100} height={28} borderRadius={14} />
          <Skeleton width={130} height={28} borderRadius={14} />
        </View>
        <View style={styles.plantGrid}>
          {[0, 1].map((row) => (
            <View key={row} style={styles.skeletonGridRow}>
              {[0, 1].map((col) => (
                <View key={col} style={[styles.plantCard, { flex: 1, marginBottom: 0 }]}>
                  <Skeleton height={132} borderRadius={16} style={{ marginBottom: 10 }} />
                  <Skeleton width={100} height={16} style={{ marginLeft: 4 }} />
                  <Skeleton width={90} height={24} borderRadius={12} style={{ marginTop: 8, marginLeft: 4 }} />
                </View>
              ))}
            </View>
          ))}
        </View>
        <Skeleton width={58} height={58} borderRadius={29} style={{ position: 'absolute', bottom: 24, right: 24 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            <Text style={styles.greeting}>
              {greeting}, {username}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton icon={themeIcon as any} onPress={toggleTheme} size={40} />
            <IconButton icon="settings-outline" onPress={handleSettings} size={40} />
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

      {plantsToWaterToday > 0 && (
        <View style={styles.waterBanner}>
          <View style={styles.waterBannerIcon}>
            <Ionicons name="water" size={19} color="#fff" />
          </View>
          <Text style={styles.waterBannerText}>
            <Text style={styles.waterBannerBold}>
              {plantsToWaterToday} {plantsToWaterToday === 1 ? 'planta precisa' : 'plantas precisam'}
            </Text>{' '}
            de água hoje. Não esquece delas!
          </Text>
        </View>
      )}

      {plants.length > 0 && (
        <View style={styles.chipsRow}>
          <Chip
            icon="leaf"
            label={`${plants.length} ${plants.length === 1 ? 'planta' : 'plantas'}`}
            color={colors.primary}
            background={colors.primarySoft}
          />
          {plantsToWaterToday > 0 && (
            <Chip
              icon="water"
              label={`${plantsToWaterToday} para regar hoje`}
              color={colors.water}
              background={colors.waterSoft}
            />
          )}
        </View>
      )}

      {filtered.length === 0 && search.length > 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyArt}>
            <Ionicons name="search-outline" size={44} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma planta encontrada</Text>
          <Text style={styles.emptySubtitle}>Tente buscar por outro nome.</Text>
        </View>
      ) : plants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyArt}>
            <Ionicons name="leaf-outline" size={52} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Seu jardim está vazio</Text>
          <Text style={styles.emptySubtitle}>
            Adicione sua primeira planta e deixe a Floriz ajudar você a cuidar dela.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyCTA, pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 }]}
            onPress={handleAddPlant}
          >
            <Ionicons name="add" size={22} color={colors.onPrimary} />
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

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.92 }] }]}
        onPress={handleAddPlant}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}
