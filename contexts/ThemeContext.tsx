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

const lightColors = {
  background: '#FAFFFE',
  surface: '#F0F7F4',
  primary: '#2D7A4A',
  primaryLight: '#4CAF6E',
  secondary: '#7CB342',
  accent: '#81C784',
  text: '#1B3A2F',
  textSecondary: '#5A7A6B',
  border: '#D4E8DC',
  error: '#E57373',
  success: '#66BB6A',
  warning: '#FFB74D',
};

const darkColors = {
  background: '#0F1610',
  surface: '#1A2920',
  primary: '#66BB6A',
  primaryLight: '#81C784',
  secondary: '#A5D6A7',
  accent: '#4CAF50',
  text: '#E8F5E9',
  textSecondary: '#9DB8A8',
  border: '#2C4037',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
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
