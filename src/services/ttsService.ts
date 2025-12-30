import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

/**
 * TTS 服務 - 負責日文發音功能
 */
interface TTSOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  voice?: string;
}

/**
 * 取得最佳的日文語音
 * iOS 會嘗試使用更高品質的語音
 */
const getBestJapaneseVoice = async (): Promise<string | undefined> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const japaneseVoices = voices.filter((voice) =>
      voice.language.startsWith('ja')
    );

    if (japaneseVoices.length === 0) {
      return undefined;
    }

    // iOS: 優先選擇高品質的日文語音
    // 通常名稱包含 "Kyoko", "Otoya" 等是較好的選擇
    if (Platform.OS === 'ios') {
      const preferredVoices = ['Kyoko', 'Otoya', 'O-ren'];
      for (const preferred of preferredVoices) {
        const voice = japaneseVoices.find(v =>
          v.name?.includes(preferred) || v.identifier?.includes(preferred)
        );
        if (voice) {
          return voice.identifier;
        }
      }
    }

    // 返回第一個可用的日文語音
    return japaneseVoices[0]?.identifier;
  } catch (error) {
    console.error('Get Voice Error:', error);
    return undefined;
  }
};

/**
 * 發音日文文字
 * @param text 要發音的日文文字
 * @param options 可選的 TTS 設定
 */
export const speakJapanese = async (
  text: string,
  options: TTSOptions = {}
): Promise<void> => {
  const {
    pitch = 1.0,        // 保持自然音調
    rate = 0.85,        // 稍慢一點，更清楚
    volume = 1.0,
    voice,
  } = options;

  try {
    // 停止任何正在進行的語音
    await Speech.stop();

    // 取得最佳語音（如果沒有指定）
    const selectedVoice = voice || await getBestJapaneseVoice();

    // 開始發音
    const speechOptions: Speech.SpeechOptions = {
      language: 'ja-JP',
      pitch,
      rate,
      volume,
    };

    // 如果找到特定語音，使用它
    if (selectedVoice) {
      speechOptions.voice = selectedVoice;
    }

    Speech.speak(text, speechOptions);
  } catch (error) {
    console.error('TTS Error:', error);
  }
};
