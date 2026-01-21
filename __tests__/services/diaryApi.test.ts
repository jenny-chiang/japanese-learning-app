import { verifyGeminiApiKey } from '../../src/services/diaryApi';
import { GoogleGenAI } from '@google/genai';

// Mock @google/genai
jest.mock('@google/genai');

describe('DiaryApi Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyGeminiApiKey', () => {
    test('應該呼叫 GoogleGenAI', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'test response',
        },
      });

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      await verifyGeminiApiKey('valid-api-key');

      expect(GoogleGenAI).toHaveBeenCalled();
    });

    test('當沒有提供 API Key 時應該返回 false', async () => {
      const result = await verifyGeminiApiKey('');

      expect(result).toBe(false);
    });
  });
});
