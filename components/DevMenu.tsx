import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SCREENS = [
  { label: 'Login', route: '/login', icon: 'log-in-outline' },
  { label: 'Cadastro', route: '/signup', icon: 'person-add-outline' },
  { label: 'Home', route: '/(auth)/home', icon: 'home-outline' },
  { label: 'Adicionar Planta', route: '/(auth)/plant-setup', icon: 'leaf-outline' },
  { label: 'Chat da Planta', route: '/(auth)/plant-chat', icon: 'chatbubble-outline' },
  { label: 'Calendário de Rega', route: '/(auth)/watering-calendar', icon: 'calendar-outline' },
  { label: 'Linha do Tempo', route: '/(auth)/photo-timeline', icon: 'images-outline' },
  { label: 'Configurações', route: '/(auth)/settings', icon: 'settings-outline' },
] as const;

export function DevMenu() {
  const { colors } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navigate = (route: string) => {
    setOpen(false);
    router.push(route as any);
  };

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 96,
      left: 16,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FF6B35',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 10,
      zIndex: 9999,
    },
    fabLabel: {
      position: 'absolute',
      bottom: 96,
      left: 66,
      backgroundColor: '#FF6B35',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      zIndex: 9999,
    },
    fabLabelText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 40,
      maxHeight: '70%',
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FF6B35',
    },
    sheetSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    screenList: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    screenItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 4,
    },
    screenItemPressed: {
      backgroundColor: colors.background,
    },
    screenIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    screenLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    screenRoute: {
      fontSize: 11,
      color: colors.textSecondary,
    },
  });

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name="code-slash" size={20} color="#fff" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>DEV MENU</Text>
                  <Text style={styles.sheetSubtitle}>Navegação rápida entre telas</Text>
                </View>
                <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
                  <Ionicons name="close" size={18} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.screenList}>
                {SCREENS.map((screen) => (
                  <Pressable
                    key={screen.route}
                    style={({ pressed }) => [
                      styles.screenItem,
                      pressed && styles.screenItemPressed,
                    ]}
                    onPress={() => navigate(screen.route)}
                  >
                    <View style={styles.screenIcon}>
                      <Ionicons name={screen.icon as any} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.screenLabel}>{screen.label}</Text>
                    <Text style={styles.screenRoute}>{screen.route}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
