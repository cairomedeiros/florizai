import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="plant-setup" />
      <Stack.Screen name="plant-chat" />
      <Stack.Screen name="watering-calendar" />
      <Stack.Screen name="photo-timeline" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
