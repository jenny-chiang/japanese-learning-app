import { SecureStorage } from '../../src/services/secureStorage';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store');

describe('SecureStorage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGeminiApiKey', () => {
    test('應該能夠儲存 API Key', async () => {
      const mockApiKey = 'test-api-key-12345';
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await SecureStorage.saveGeminiApiKey(mockApiKey);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'gemini_api_key',
        mockApiKey
      );
    });

    test('當儲存失敗時應該拋出錯誤', async () => {
      const mockApiKey = 'test-api-key-12345';
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(SecureStorage.saveGeminiApiKey(mockApiKey)).rejects.toThrow(
        '無法安全儲存 API Key'
      );
    });
  });

  describe('getGeminiApiKey', () => {
    test('應該能夠讀取已儲存的 API Key', async () => {
      const mockApiKey = 'test-api-key-12345';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockApiKey);

      const result = await SecureStorage.getGeminiApiKey();

      expect(result).toBe(mockApiKey);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('gemini_api_key');
    });

    test('當沒有 API Key 時應該返回 null', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await SecureStorage.getGeminiApiKey();

      expect(result).toBeNull();
    });

    test('當讀取失敗時應該返回 null', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Read error')
      );

      const result = await SecureStorage.getGeminiApiKey();

      expect(result).toBeNull();
    });
  });

  describe('deleteGeminiApiKey', () => {
    test('應該能夠刪除 API Key', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await SecureStorage.deleteGeminiApiKey();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('gemini_api_key');
    });

    test('當刪除失敗時應該拋出錯誤', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Delete error')
      );

      await expect(SecureStorage.deleteGeminiApiKey()).rejects.toThrow(
        '無法刪除 API Key'
      );
    });
  });

  describe('hasGeminiApiKey', () => {
    test('當有 API Key 時應該返回 true', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-api-key');

      const result = await SecureStorage.hasGeminiApiKey();

      expect(result).toBe(true);
    });

    test('當沒有 API Key 時應該返回 false', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await SecureStorage.hasGeminiApiKey();

      expect(result).toBe(false);
    });

    test('當讀取失敗時應該返回 false', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Read error')
      );

      const result = await SecureStorage.hasGeminiApiKey();

      expect(result).toBe(false);
    });
  });
});
