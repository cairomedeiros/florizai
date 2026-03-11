import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type Photo = {
  id: string;
  date: Date;
  note: string;
  // TODO: Add actual image URI when implementing camera functionality
};

export default function PhotoTimelineScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      date: new Date('2026-03-05'),
      note: 'Primeira foto! Acabei de ganhar essa plantinha 🌱',
    },
    {
      id: '2',
      date: new Date('2026-03-08'),
      note: 'Notei um novo broto crescendo! 😍',
    },
    {
      id: '3',
      date: new Date('2026-03-11'),
      note: 'Está crescendo muito rápido!',
    },
  ]);

  const handleAddPhoto = () => {
    // TODO: Implement camera/gallery picker
    console.log('Add photo');
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
      year: 'numeric'
    });
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonText: {
      fontSize: 20,
      color: colors.text,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold',
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
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    timeline: {
      position: 'relative',
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 32,
    },
    timelineLine: {
      width: 2,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    timelineDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      position: 'absolute',
      left: 8,
      top: 8,
      borderWidth: 3,
      borderColor: colors.background,
    },
    photoCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoPlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoPlaceholderIcon: {
      fontSize: 48,
      marginBottom: 8,
    },
    photoPlaceholderText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    photoDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      fontWeight: '600',
    },
    photoNote: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    statsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  const getDaysTracking = () => {
    if (photos.length === 0) return 0;
    const firstPhoto = photos[photos.length - 1];
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstPhoto.date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📸 Timeline de Evolução</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyText}>
              Comece a documentar o crescimento da sua planta! Tire fotos ao longo do tempo e veja sua evolução.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddPhoto}>
              <Text style={styles.emptyButtonText}>Adicionar Primeira Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Progresso</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{photos.length}</Text>
                  <Text style={styles.statLabel}>Fotos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getDaysTracking()}</Text>
                  <Text style={styles.statLabel}>Dias acompanhando</Text>
                </View>
              </View>
            </View>

            <View style={styles.timeline}>
              {photos.map((photo, index) => (
                <View key={photo.id}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                    <View style={styles.photoCard}>
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderIcon}>🌱</Text>
                        <Text style={styles.photoPlaceholderText}>
                          Foto será exibida aqui
                        </Text>
                      </View>
                      <Text style={styles.photoDate}>{formatDate(photo.date)}</Text>
                      <Text style={styles.photoNote}>{photo.note}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
