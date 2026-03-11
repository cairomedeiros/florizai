import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="plant-chat" />
      <Stack.Screen name="watering-calendar" />
      <Stack.Screen name="photo-timeline" />
    </Stack>
  );
}
