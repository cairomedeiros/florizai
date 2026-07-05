import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

// Editorial display face for titles — system serif, zero dependencies.
export const displayFont = Platform.select({ ios: 'Georgia', default: 'serif' });

type IconName = keyof typeof Ionicons.glyphMap;

export function IconButton({
  icon,
  onPress,
  color,
  background,
  size = 40,
  style,
}: {
  icon: IconName;
  onPress: () => void;
  color?: string;
  background?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background ?? colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.48} color={color ?? colors.text} />
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 20,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <IconButton icon="arrow-back" onPress={onBack ?? (() => router.back())} />
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: 22,
          fontFamily: displayFont,
          color: colors.text,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? colors.surfaceAlt : colors.primary,
          borderRadius: 18,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: pressed || loading ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : icon ? (
        <Ionicons name={icon} size={19} color={disabled ? colors.textSecondary : colors.onPrimary} />
      ) : null}
      <Text
        style={{
          color: disabled ? colors.textSecondary : colors.onPrimary,
          fontSize: 16,
          fontWeight: '700',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Input({
  label,
  optional,
  error,
  hint,
  password,
  ...inputProps
}: TextInputProps & {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  password?: boolean;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!password);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: focused ? colors.primary : colors.textSecondary,
          marginBottom: 8,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
        {optional ? (
          <Text style={{ fontWeight: '500', textTransform: 'none', letterSpacing: 0 }}>
            {'  '}(opcional)
          </Text>
        ) : null}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          {...inputProps}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={password ? hidden : inputProps.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={[
            {
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: error ? colors.error : focused ? colors.primary : colors.border,
              borderRadius: 16,
              padding: 15,
              fontSize: 16,
              color: colors.text,
            },
            password ? { paddingRight: 52 } : null,
            inputProps.multiline ? { minHeight: 104, textAlignVertical: 'top' } : null,
            inputProps.style,
          ]}
        />
        {password ? (
          <Pressable
            style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
            onPress={() => setHidden(!hidden)}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={{ color: colors.error, fontSize: 12.5, marginTop: 6 }}>{error}</Text>
      ) : hint ? (
        <Text style={{ color: colors.textSecondary, fontSize: 12.5, marginTop: 8, lineHeight: 18 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function Chip({
  icon,
  label,
  color,
  background,
}: {
  icon?: IconName;
  label: string;
  color: string;
  background: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: background,
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 11,
        alignSelf: 'flex-start',
      }}
    >
      {icon ? <Ionicons name={icon} size={13} color={color} /> : null}
      <Text style={{ fontSize: 12.5, fontWeight: '600', color }}>{label}</Text>
    </View>
  );
}
