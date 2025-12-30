import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { updateTheme, getTheme } from '../constants/colors';

type ThemeContextType = {
  isDark: boolean;
  colors: ReturnType<typeof getTheme>;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: getTheme(false),
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { settings } = useAppStore();

  // 判斷當前是否使用深色模式
  const isDark = settings.themeMode === 'system'
    ? systemColorScheme === 'dark'
    : settings.themeMode === 'dark';

  // 套用主題
  useEffect(() => {
    updateTheme(isDark);
  }, [isDark]);

  const colors = getTheme(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
