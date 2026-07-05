import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { Chip, IconButton, ScreenHeader, displayFont } from '../../components/ui';
import { usePlants } from '../../contexts/PlantContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as api from '../../lib/api';

type Photo = {
  id: string;
  date: Date;
  imageUri?: string;
};

export default function PhotoTimelineScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { plants } = usePlants();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // No id (e.g. DevMenu) -> default to the first plant.
  const plantId = id ?? plants[0]?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const load = useCallback(async () => {
    if (!plantId) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }
    try {
      const pics = await api.listPlantPictures(plantId).catch(() => []);
      setPhotos(
        pics
          .map((p) => ({
            id: p.id,
            date: new Date(p.created_at),
            imageUri: api.imageUrl(p.thumbnail_path ?? p.image_path),
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime())
      );
    } finally {
      setIsLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddPhoto = async () => {
    if (!plantId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    const name = uri.split('/').pop() || 'photo.jpg';
    const type = name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    try {
      await api.addPlantPicture(plantId, { uri, name, type });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await load();
    } catch (e) {
      console.error('Failed to add photo', e);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysTracking = () => {
    if (photos.length === 0) return 0;
    const firstPhoto = photos[photos.length - 1];
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstPhoto.date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: 20 },
    chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 18, marginTop: 4 },
    emptyContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: 40, paddingTop: 60,
    },
    emptyArt: {
      width: 108, height: 108, borderRadius: 54,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 24, fontFamily: displayFont, color: colors.text,
      textAlign: 'center', marginBottom: 10,
    },
    emptyText: {
      fontSize: 15, color: colors.textSecondary, textAlign: 'center',
      marginBottom: 28, lineHeight: 22,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 26, paddingVertical: 13, borderRadius: 999,
    },
    emptyButtonText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
    photoCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 10,
      marginBottom: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: '#1B2A21',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    photo: {
      width: '100%', height: 240, borderRadius: 16,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center',
    },
    photoPlaceholderText: { fontSize: 14, color: colors.textSecondary },
    photoFooter: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 6, paddingTop: 10, paddingBottom: 4,
    },
    photoDate: { fontSize: 13.5, fontWeight: '600', color: colors.textSecondary },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Evolução"
          right={<Skeleton width={40} height={40} borderRadius={20} />}
        />
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <View style={styles.chipsRow}>
            <Skeleton width={80} height={28} borderRadius={14} />
            <Skeleton width={150} height={28} borderRadius={14} />
          </View>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.photoCard}>
              <Skeleton height={240} borderRadius={16} />
              <Skeleton width={110} height={14} style={{ marginTop: 12, marginLeft: 6, marginBottom: 4 }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Evolução"
        right={
          <IconButton
            icon="add"
            onPress={handleAddPhoto}
            background={colors.primary}
            color={colors.onPrimary}
          />
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyArt}>
              <Ionicons name="camera-outline" size={46} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Registre o crescimento</Text>
            <Text style={styles.emptyText}>
              Tire fotos com o tempo e acompanhe a evolução da sua planta.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyButton, pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 }]}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera" size={17} color={colors.onPrimary} />
              <Text style={styles.emptyButtonText}>Adicionar primeira foto</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.chipsRow}>
              <Chip
                icon="images"
                label={`${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}`}
                color={colors.primary}
                background={colors.primarySoft}
              />
              <Chip
                icon="time"
                label={`${getDaysTracking()} dias acompanhando`}
                color={colors.accent}
                background={colors.accentSoft}
              />
            </View>

            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                {photo.imageUri ? (
                  <Image source={{ uri: photo.imageUri }} style={styles.photo} contentFit="cover" />
                ) : (
                  <View style={styles.photo}>
                    <Text style={styles.photoPlaceholderText}>Foto será exibida aqui</Text>
                  </View>
                )}
                <View style={styles.photoFooter}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.photoDate}>{formatDate(photo.date)}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
