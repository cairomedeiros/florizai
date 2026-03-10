import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { colors, isDark, theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    router.replace('/login');
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    cardText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    themeSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    button: {
      backgroundColor: colors.error,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Development Mode - Auth Disabled
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ FlorizAI</Text>
          <Text style={styles.cardText}>
            Your app is ready! This is a simple authentication setup with dark mode support.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Authentication</Text>
          <Text style={styles.cardText}>
            Authentication is currently disabled for development. You can navigate freely
            between screens without logging in.
          </Text>
        </View>

        <View style={styles.themeSection}>
          <Text style={styles.themeText}>
            🌙 Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={handleThemeToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Features</Text>
          <Text style={styles.cardText}>
            • Global state management with Context API{'\n'}
            • Protected routes with Expo Router{'\n'}
            • Dark mode support{'\n'}
            • Persistent authentication{'\n'}
            • Ready for Supabase integration
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
