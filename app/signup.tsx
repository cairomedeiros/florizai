import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { isLoading: isAuthLoading, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = confirmPassword === '' || password === confirmPassword;
  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Fraca', 'Média', 'Forte'];
  const strengthColor = ['', colors.error, colors.warning, colors.success];

  const handleSignUp = async () => {
    setError('');
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/(auth)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao criar conta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    // TODO: Implement Supabase Google OAuth
    console.log('Google sign up');
  };

  const handleAppleSignUp = async () => {
    // TODO: Implement Supabase Apple OAuth
    console.log('Apple sign up');
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 28 },
    header: { alignItems: 'center', marginBottom: 36 },
    logoMark: {
      width: 76, height: 76, borderRadius: 38,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginBottom: 18,
    },
    title: { fontSize: 42, fontFamily: displayFont, color: colors.text, marginBottom: 6 },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
    inputContainer: { marginBottom: 16 },
    strengthRow: { flexDirection: 'row', gap: 4, marginTop: -8, marginBottom: 16, alignItems: 'center' },
    strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
    strengthBarActive: { backgroundColor: strengthColor[passwordStrength] },
    strengthLabel: { fontSize: 12, color: strengthColor[passwordStrength], marginLeft: 4, minWidth: 38 },
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
    loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginText: { color: colors.textSecondary, fontSize: 14 },
    loginLink: { color: colors.primary, fontSize: 14, fontWeight: '700', marginLeft: 6 },
    terms: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
    termsLink: { color: colors.primary, fontWeight: '600' },
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
              <Skeleton width={160} height={18} style={{ marginTop: 8 }} />
            </View>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.inputContainer}>
                <Skeleton width={90} height={14} style={{ marginBottom: 8 }} />
                <Skeleton height={54} borderRadius={16} />
              </View>
            ))}
            <Skeleton width="90%" height={36} style={{ marginBottom: 16, alignSelf: 'center' }} />
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
            <View style={styles.loginContainer}>
              <Skeleton width={120} height={14} />
              <Skeleton width={45} height={14} style={{ marginLeft: 8 }} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.logoMark}>
                <Ionicons name="leaf" size={36} color={colors.primary} />
              </View>
              <Text style={styles.title}>Floriz</Text>
              <Text style={styles.subtitle}>Crie sua conta e comece seu jardim.</Text>
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

            <View>
              <Input
                label="Senha"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChangeText={setPassword}
                password
                autoComplete="password-new"
              />
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        passwordStrength >= level && styles.strengthBarActive,
                      ]}
                    />
                  ))}
                  <Text style={styles.strengthLabel}>{strengthLabel[passwordStrength]}</Text>
                </View>
              )}
            </View>

            <Input
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              password
              autoComplete="password-new"
              error={!passwordsMatch ? 'As senhas não coincidem.' : undefined}
            />

            <Text style={styles.terms}>
              Ao criar uma conta, você concorda com nossos{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              label={submitting ? 'Criando...' : 'Criar Conta'}
              onPress={handleSignUp}
              loading={submitting}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou continue com</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton} onPress={handleGoogleSignUp}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={styles.socialButtonText}>Continuar com Google</Text>
              </Pressable>

              <Pressable style={styles.socialButton} onPress={handleAppleSignUp}>
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={styles.socialButtonText}>Continuar com Apple</Text>
              </Pressable>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.loginLink}>Entrar</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
