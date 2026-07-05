import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Skeleton } from '../components/Skeleton';
import { Input, PrimaryButton, displayFont } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { isLoading: isAuthLoading, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(auth)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: Implement Supabase Google OAuth
    console.log('Google login');
  };

  const handleAppleLogin = async () => {
    // TODO: Implement Supabase Apple OAuth
    console.log('Apple login');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar senha',
      'Insira seu email cadastrado e enviaremos um link de recuperação.',
      [{ text: 'OK' }]
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 28 },
    header: { alignItems: 'center', marginBottom: 40 },
    logoMark: {
      width: 76, height: 76, borderRadius: 38,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginBottom: 18,
    },
    title: {
      fontSize: 42,
      fontFamily: displayFont,
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
    inputContainer: { marginBottom: 16 },
    errorBanner: {
      backgroundColor: `${colors.error}16`,
      borderRadius: 14,
      padding: 12,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    errorText: { color: colors.error, fontSize: 14, flex: 1 },
    forgotPassword: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 24 },
    forgotPasswordText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { color: colors.textSecondary, paddingHorizontal: 16, fontSize: 13 },
    socialButtons: { gap: 12, marginBottom: 32 },
    socialButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1, borderColor: colors.border,
      padding: 15, borderRadius: 16, gap: 12,
    },
    socialButtonText: { color: colors.text, fontSize: 15, fontWeight: '600' },
    signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    signupText: { color: colors.textSecondary, fontSize: 14 },
    signupLink: { color: colors.primary, fontSize: 14, fontWeight: '700', marginLeft: 6 },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isAuthLoading ? (
          <>
            <View style={styles.header}>
              <Skeleton width={76} height={76} borderRadius={38} style={{ marginBottom: 18 }} />
              <Skeleton width={180} height={42} borderRadius={12} />
              <Skeleton width={200} height={18} style={{ marginTop: 8 }} />
            </View>
            <View style={styles.inputContainer}>
              <Skeleton width={70} height={14} style={{ marginBottom: 8 }} />
              <Skeleton height={54} borderRadius={16} />
            </View>
            <View style={styles.inputContainer}>
              <Skeleton width={70} height={14} style={{ marginBottom: 8 }} />
              <Skeleton height={54} borderRadius={16} />
            </View>
            <View style={styles.forgotPassword}>
              <Skeleton width={120} height={16} />
            </View>
            <Skeleton height={54} borderRadius={18} />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Skeleton width={130} height={14} style={{ marginHorizontal: 16 }} />
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.socialButtons}>
              <Skeleton height={52} borderRadius={16} />
              <Skeleton height={52} borderRadius={16} />
            </View>
            <View style={styles.signupContainer}>
              <Skeleton width={130} height={14} />
              <Skeleton width={90} height={14} style={{ marginLeft: 8 }} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.logoMark}>
                <Ionicons name="leaf" size={36} color={colors.primary} />
              </View>
              <Text style={styles.title}>Floriz</Text>
              <Text style={styles.subtitle}>Suas plantas, bem cuidadas.</Text>
            </View>

            <Input
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Senha"
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              password
              autoComplete="password"
            />

            <Pressable style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </Pressable>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              label={submitting ? 'Entrando...' : 'Entrar'}
              onPress={handleLogin}
              loading={submitting}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou continue com</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton} onPress={handleGoogleLogin}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={styles.socialButtonText}>Continuar com Google</Text>
              </Pressable>

              <Pressable style={styles.socialButton} onPress={handleAppleLogin}>
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={styles.socialButtonText}>Continuar com Apple</Text>
              </Pressable>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Não tem uma conta?</Text>
              <Pressable onPress={() => router.push('/signup' as any)}>
                <Text style={styles.signupLink}>Criar conta</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
