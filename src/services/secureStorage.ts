import * as SecureStore from 'expo-secure-store';

const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * 安全儲存服務 - 使用設備的 Keychain/Keystore
 */
export const SecureStorage = {
  /**
   * 安全儲存 Gemini API Key
   */
  async saveGeminiApiKey(apiKey: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(GEMINI_API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
      console.error('儲存 API Key 失敗:', error);
      throw new Error('無法安全儲存 API Key');
    }
  },

  /**
   * 讀取 Gemini API Key
   */
  async getGeminiApiKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(GEMINI_API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('讀取 API Key 失敗:', error);
      return null;
    }
  },

  /**
   * 刪除 Gemini API Key
   */
  async deleteGeminiApiKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(GEMINI_API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('刪除 API Key 失敗:', error);
      throw new Error('無法刪除 API Key');
    }
  },

  /**
   * 檢查是否已儲存 API Key
   */
  async hasGeminiApiKey(): Promise<boolean> {
    try {
      const apiKey = await SecureStore.getItemAsync(GEMINI_API_KEY_STORAGE_KEY);
      return apiKey !== null && apiKey !== '';
    } catch (error) {
      console.error('檢查 API Key 失敗:', error);
      return false;
    }
  },
};
