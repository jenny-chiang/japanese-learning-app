import { speakJapanese } from '../../src/services/ttsService';
import * as Speech from 'expo-speech';

// Mock expo-speech
jest.mock('expo-speech');

describe('TTSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('speakJapanese', () => {
    test('應該能夠播放日文文字', async () => {
      (Speech.speak as jest.Mock).mockImplementation(() => {});
      (Speech.stop as jest.Mock).mockResolvedValue(undefined);
      (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);

      await speakJapanese('こんにちは');

      expect(Speech.speak).toHaveBeenCalled();
      const callArgs = (Speech.speak as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('こんにちは');
      expect(callArgs[1]).toHaveProperty('language', 'ja-JP');
    });

    test('應該能夠使用自訂選項', async () => {
      (Speech.speak as jest.Mock).mockImplementation(() => {});
      (Speech.stop as jest.Mock).mockResolvedValue(undefined);
      (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);

      await speakJapanese('ありがとう', {
        pitch: 1.2,
        rate: 0.8,
        volume: 0.9,
      });

      expect(Speech.speak).toHaveBeenCalled();
      const callArgs = (Speech.speak as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        pitch: 1.2,
        rate: 0.8,
        volume: 0.9,
      });
    });

    test('應該處理空文字', async () => {
      (Speech.speak as jest.Mock).mockImplementation(() => {});
      (Speech.stop as jest.Mock).mockResolvedValue(undefined);
      (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);

      await speakJapanese('');

      expect(Speech.speak).toHaveBeenCalledWith('', expect.any(Object));
    });

    test('應該在播放前先停止', async () => {
      (Speech.speak as jest.Mock).mockImplementation(() => {});
      (Speech.stop as jest.Mock).mockResolvedValue(undefined);
      (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);

      await speakJapanese('こんにちは');

      expect(Speech.stop).toHaveBeenCalled();
    });
  });
});
