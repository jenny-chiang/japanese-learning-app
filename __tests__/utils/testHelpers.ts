/**
 * 測試輔助工具函數
 */

/**
 * 等待一段時間
 */
export const wait = (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 取得今天的日期字串 (YYYY-MM-DD)
 */
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * 取得指定天數前的日期字串
 */
export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * 取得指定天數後的日期字串
 */
export const getDaysAfter = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * 模擬 AsyncStorage 清除所有資料
 */
export const clearAsyncStorage = async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.clear();
};

/**
 * 模擬 Secure Store 清除所有資料
 */
export const clearSecureStore = () => {
  const SecureStore = require('expo-secure-store');
  SecureStore.getItemAsync.mockClear();
  SecureStore.setItemAsync.mockClear();
  SecureStore.deleteItemAsync.mockClear();
};
