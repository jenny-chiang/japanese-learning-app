// 主題類型
export type ThemeMode = 'light' | 'dark' | 'system';

// 淺色主題
const lightTheme = {
  // 主色調
  primary: '#6366F1',
  primaryDark: '#4338CA',
  primaryLight: '#EEF2FF',

  // 成功/正確
  success: '#10B981',
  successLight: '#ECFDF5',
  successDark: '#065F46',

  // 警告/提示
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  warningDark: '#92400E',

  // 錯誤
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // 文字顏色
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // 背景顏色
  background: '#F9FAFB',
  backgroundWhite: '#FFFFFF',
  cardBackground: '#FFFFFF',

  // 邊框顏色
  border: '#E5E7EB',

  // 其他
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

// 深色主題
const darkTheme = {
  // 主色調
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#4338CA',

  // 成功/正確
  success: '#34D399',
  successLight: '#064E3B',
  successDark: '#065F46',

  // 警告/提示
  warning: '#FBBF24',
  warningLight: '#92400E',
  warningDark: '#FCD34D',

  // 錯誤
  error: '#F87171',
  errorLight: '#7F1D1D',

  // 文字顏色
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  // 背景顏色
  background: '#0F172A',
  backgroundWhite: '#1E293B',
  cardBackground: '#1E293B',

  // 邊框顏色
  border: '#334155',

  // 其他
  white: '#F9FAFB',
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
