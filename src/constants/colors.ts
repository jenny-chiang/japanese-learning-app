// 主題顏色常數
export const Colors = {
  // 主色調
  primary: '#6366F1',      // 主要按鈕、重點元素
  primaryDark: '#4338CA',  // 深色變化
  primaryLight: '#EEF2FF', // 淺色背景

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
  backgroundWhite: '#fff',

  // 邊框顏色
  border: '#E5E7EB',

  // 其他
  white: '#fff',
  black: '#000',
} as const;

// 類型導出
export type ColorKey = keyof typeof Colors;
