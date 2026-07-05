import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, displayFont } from '../components/ui';
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
      fontSize: 72,
      fontFamily: displayFont,
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
  });

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Página não encontrada</Text>
      <Text style={styles.message}>
        Não encontramos o conteúdo que você tentou acessar.
      </Text>
      <PrimaryButton
        label="Voltar ao início"
        onPress={() => router.replace('/')}
        style={{ paddingHorizontal: 24 }}
      />
    </View>
  );
}
