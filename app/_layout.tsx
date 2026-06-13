import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DevMenu } from '../components/DevMenu';
import { NetworkToast } from '../components/NetworkToast';
import { AuthProvider } from '../contexts/AuthContext';
import { PlantProvider } from '../contexts/PlantContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function RootStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <PlantProvider>
            <RootStack />
            <NetworkToast />
            {__DEV__ && <DevMenu />}
          </PlantProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
