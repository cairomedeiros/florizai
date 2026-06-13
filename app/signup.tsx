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
  TextInput,
  View,
} from 'react-native';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

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

    // TODO: Implement Supabase sign up
    router.replace('/(auth)/home');
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
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.error,
    },
    inputWrapper: {
      position: 'relative',
    },
    inputWithIcon: {
      paddingRight: 52,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    strengthRow: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 8,
      alignItems: 'center',
    },
    strengthBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    strengthBarActive: {
      backgroundColor: strengthColor[passwordStrength],
    },
    strengthLabel: {
      fontSize: 12,
      color: strengthColor[passwordStrength],
      marginLeft: 4,
      minWidth: 38,
    },
    mismatchText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 6,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
    signupButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 24,
    },
    signupButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSecondary,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    socialButtons: {
      gap: 12,
      marginBottom: 32,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    socialButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    loginLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    terms: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 18,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: '500',
    },
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
              <Skeleton width={220} height={40} borderRadius={12} />
              <Skeleton width={160} height={18} style={{ marginTop: 8 }} />
            </View>

            <View style={styles.inputContainer}>
              <Skeleton width={70} height={16} style={{ marginBottom: 8 }} />
              <Skeleton height={54} borderRadius={12} />
            </View>

            <View style={styles.inputContainer}>
              <Skeleton width={70} height={16} style={{ marginBottom: 8 }} />
              <Skeleton height={54} borderRadius={12} />
            </View>

            <View style={styles.inputContainer}>
              <Skeleton width={110} height={16} style={{ marginBottom: 8 }} />
              <Skeleton height={54} borderRadius={12} />
            </View>

            <Skeleton width="90%" height={36} style={{ marginBottom: 16, alignSelf: 'center' }} />
            <Skeleton height={54} borderRadius={12} style={{ marginBottom: 24 }} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Skeleton width={130} height={14} style={{ marginHorizontal: 16 }} />
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Skeleton height={54} borderRadius={12} />
              <Skeleton height={54} borderRadius={12} />
            </View>

            <View style={styles.loginContainer}>
              <Skeleton width={120} height={14} />
              <Skeleton width={45} height={14} style={{ marginLeft: 8 }} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>FlorizAI</Text>
              <Text style={styles.subtitle}>Crie sua conta</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    !passwordsMatch && styles.inputError,
                  ]}
                  placeholder="Digite a senha novamente"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
              {!passwordsMatch && (
                <Text style={styles.mismatchText}>As senhas não coincidem.</Text>
              )}
            </View>

            <Text style={styles.terms}>
              Ao criar uma conta, você concorda com nossos{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupButtonText}>Criar Conta</Text>
            </Pressable>

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
