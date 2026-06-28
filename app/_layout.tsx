import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DevMenu } from '../components/DevMenu';
import { NetworkToast } from '../components/NetworkToast';
import { AuthProvider } from '../contexts/AuthContext';
import { PlantProvider } from '../contexts/PlantContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function RootStack() {
  const { colors } = useTheme();

  // Browser autofill repaints inputs with its own (light) background, breaking
  // the dark theme. Mask it with an inset box-shadow in the theme's surface color.
  // ponytail: web-only, no-op elsewhere — RN native inputs have no autofill chrome.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'autofill-fix';
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent =
      `input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{` +
      `-webkit-box-shadow:0 0 0 1000px ${colors.surface} inset!important;` +
      `-webkit-text-fill-color:${colors.text}!important;caret-color:${colors.text};}`;
  }, [colors.surface, colors.text]);

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
