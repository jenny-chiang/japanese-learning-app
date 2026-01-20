// 主題類型
export type ThemeMode = 'light' | 'dark' | 'system';

// 淺色主題 - 極簡風格
const lightTheme = {
  // 主色調 - 單一強調色
  primary: '#2C3E50',
  primaryDark: '#1A252F',
  primaryLight: '#F5F7FA',

  // 成功/正確
  success: '#4CAF50',
  successLight: '#E8F5E9',
  successDark: '#2E7D32',

  // 警告/提示
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  warningDark: '#E65100',

  // 錯誤
  error: '#F44336',
  errorLight: '#FFEBEE',

  // 文字顏色 - 純黑白灰
  textPrimary: '#000000',
  textSecondary: '#757575',
  textTertiary: '#BDBDBD',
  textOnPrimary: '#FFFFFF',

  // 背景顏色 - 純白
  background: '#FFFFFF',
  backgroundWhite: '#FFFFFF',
  cardBackground: '#FFFFFF',

  // 邊框顏色
  border: '#E0E0E0',
  borderDark: '#BDBDBD',

  // 其他
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.04)',
} as const;

// 深色主題 - 極簡風格
const darkTheme = {
  // 主色調
  primary: '#5DADE2',
  primaryDark: '#3498DB',
  primaryLight: '#1E293B',

  // 成功/正確
  success: '#66BB6A',
  successLight: '#1B5E20',
  successDark: '#2E7D32',

  // 警告/提示
  warning: '#FFA726',
  warningLight: '#E65100',
  warningDark: '#FF9800',

  // 錯誤
  error: '#EF5350',
  errorLight: '#B71C1C',

  // 文字顏色
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#757575',
  textOnPrimary: '#000000',

  // 背景顏色
  background: '#121212',
  backgroundWhite: '#1E1E1E',
  cardBackground: '#1E1E1E',

  // 邊框顏色
  border: '#2C2C2C',
  borderDark: '#424242',

  // 其他
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.3)',
} as const;

// 預設使用淺色主題
export let Colors = { ...lightTheme };

// 更新主題函數
export const updateTheme = (isDark: boolean) => {
  const newTheme = isDark ? darkTheme : lightTheme;
  Object.assign(Colors, newTheme);
};

// 取得主題函數
export const getTheme = (isDark: boolean) => {
  return isDark ? darkTheme : lightTheme;
};

// 類型導出
export type ColorKey = keyof typeof lightTheme;
