import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, displayFont } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

type RowProps = {
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  onPress: () => void;
};

function SettingsRow({ icon, label, value, danger, onPress }: RowProps) {
  const { colors } = useTheme();
  const color = danger ? colors.error : colors.text;
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: 'row', alignItems: 'center', gap: 14,
          paddingVertical: 14, paddingHorizontal: 16,
          backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      <View style={{
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: danger ? `${colors.error}18` : colors.primarySoft,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon as any} size={19} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color }}>{label}</Text>
      {value ? (
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>{value}</Text>
      ) : null}
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 6 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 68 }} />;
}

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const themeLabel = theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático';

  const cycleTheme = async () => {
    await Haptics.selectionAsync();
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut();
          router.replace('/login');
        }
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    avatar: {
      width: 68, height: 68, borderRadius: 34,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 26, fontFamily: displayFont, color: colors.onPrimary },
    profileCard: {
      backgroundColor: colors.surface, borderRadius: 22,
      borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
      padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28,
      shadowColor: '#1B2A21', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    profileName: { fontSize: 20, fontFamily: displayFont, color: colors.text },
    profileEmail: { fontSize: 14, color: colors.textSecondary, marginTop: 3 },
    content: { paddingHorizontal: 20, paddingTop: 8 },
    version: { textAlign: 'center', fontSize: 12, color: colors.textSecondary, marginTop: 8, marginBottom: 8 },
  });

  const initials = (user?.name ?? 'U').slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Configurações" />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name ?? 'Usuário'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
        </View>

        <Section title="Aparência">
          <SettingsRow
            icon="color-palette-outline"
            label="Tema"
            value={themeLabel}
            onPress={cycleTheme}
          />
        </Section>

        <Section title="Notificações">
          <SettingsRow
            icon="notifications-outline"
            label="Lembretes de rega"
            onPress={() => Alert.alert('Em breve', 'Configurações de notificação chegam em breve.')}
          />
        </Section>

        <Section title="Conta">
          <SettingsRow
            icon="person-outline"
            label="Editar perfil"
            onPress={() => Alert.alert('Em breve', 'Edição de perfil chega em breve.')}
          />
          <Divider />
          <SettingsRow
            icon="lock-closed-outline"
            label="Alterar senha"
            onPress={() => Alert.alert('Em breve', 'Alteração de senha chega em breve.')}
          />
        </Section>

        <Section title="Suporte">
          <SettingsRow
            icon="help-circle-outline"
            label="Ajuda"
            onPress={() => Alert.alert('Ajuda', 'Entre em contato pelo app em breve.')}
          />
          <Divider />
          <SettingsRow
            icon="star-outline"
            label="Avaliar o app"
            onPress={() => Alert.alert('Obrigado!', 'Redirecionando para a loja em breve.')}
          />
        </Section>

        <Section title="Sessão">
          <SettingsRow icon="log-out-outline" label="Sair da conta" danger onPress={handleSignOut} />
        </Section>

        <Text style={styles.version}>Floriz v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
