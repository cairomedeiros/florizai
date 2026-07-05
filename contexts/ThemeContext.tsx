import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

// "Botanical editorial": warm paper + deep green + terracotta accent + water blue.
const lightColors = {
  background: '#F6F4ED',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEAE0',
  primary: '#22593A',
  primaryLight: '#3E7D57',
  primarySoft: '#E1EBE2',
  secondary: '#7CB342',
  accent: '#C4713F',
  accentSoft: '#F5E5D8',
  water: '#3B7CB8',
  waterSoft: '#E2EEF8',
  text: '#1B2A21',
  textSecondary: '#68766C',
  border: '#E4E0D3',
  error: '#BC4B42',
  success: '#4C8A5F',
  warning: '#D99B2F',
  onPrimary: '#FFFFFF',
};

const darkColors = {
  background: '#0E1310',
  surface: '#161E18',
  surfaceAlt: '#1E2820',
  primary: '#8CCBA1',
  primaryLight: '#A7DCB8',
  primarySoft: '#1D2E23',
  secondary: '#A5D6A7',
  accent: '#E09A6A',
  accentSoft: '#33241A',
  water: '#7FB4E4',
  waterSoft: '#1B2733',
  text: '#EAF1EA',
  textSecondary: '#93A398',
  border: '#263028',
  error: '#E07A72',
  success: '#7FC79A',
  warning: '#E5B45C',
  onPrimary: '#0E1310',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('auto');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isDark = theme === 'auto' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
