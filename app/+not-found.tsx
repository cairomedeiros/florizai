import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 12,
    },
    code: {
      fontSize: 52,
      fontWeight: '700',
      color: colors.primary,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 320,
      lineHeight: 22,
      marginBottom: 8,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Página não encontrada</Text>
      <Text style={styles.message}>
        Não encontramos o conteúdo que você tentou acessar.
      </Text>

      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>Voltar ao início</Text>
      </Pressable>
    </View>
  );
}
