import { Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { correctDiaryWithGemini, extractWordsFromDiary } from '../src/services/diaryApi';
import { SecureStorage } from '../src/services/secureStorage';
import { DiaryEntry } from '../src/types';
import DiaryEditor from '../src/components/diary/DiaryEditor';
import DiaryResult from '../src/components/diary/DiaryResult';
import DiaryHistory from '../src/components/diary/DiaryHistory';

// 常數定義
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MAX_RETRY_COUNT = 3;
const SUPPORTED_LANGUAGES = ['zh', 'en'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// 工具函數：安全獲取支援的語言
const getSupportedLanguage = (lang: string): SupportedLanguage => {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as SupportedLanguage)
    : 'zh'; // 預設為中文
};

// 工具函數：計算學習時長（分鐘）
const calculateDurationInMinutes = (startTime: number): number => {
  return Math.round(
    (Date.now() - startTime) / MILLISECONDS_PER_SECOND / SECONDS_PER_MINUTE
  );
};

export default function DiaryScreen() {
  const { t, i18n } = useTranslation();
  const [diaryText, setDiaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [extractingWords, setExtractingWords] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const apiKeyCache = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const { addDiaryEntry, todayDiary, diaryEntries, settings, addWordsToLibrary, recordStudyTime } = useAppStore();

  // 元件卸載時的清理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 當用戶開始輸入時記錄時間
  useEffect(() => {
    if (diaryText.length > 0 && !startTimeRef.current && !showResult) {
      startTimeRef.current = Date.now();
    }
  }, [diaryText, showResult]);

  // 獲取並快取 API Key
  const getApiKey = async (): Promise<string | null> => {
    if (apiKeyCache.current === null) {
      apiKeyCache.current = await SecureStorage.getGeminiApiKey();
    }
    return apiKeyCache.current;
  };

  const handleSubmit = async () => {
    // 防止重複提交和空內容
    if (!diaryText.trim() || loading) return;

    setLoading(true);

    try {
      // 記錄學習時長
      if (startTimeRef.current) {
        const duration = calculateDurationInMinutes(startTimeRef.current);
        if (duration > 0) {
          recordStudyTime(duration);
        }
        startTimeRef.current = null;
      }

      // 使用 Gemini API（從快取獲取用戶的 API Key）
      const currentLanguage = getSupportedLanguage(i18n.language);
      const userApiKey = await getApiKey();
      const result = await correctDiaryWithGemini(
        diaryText,
        settings.mainLevel,
        currentLanguage,
        userApiKey || undefined
      );

      // 檢查元件是否仍然掛載
      if (!isMountedRef.current) return;

      addDiaryEntry({
        original: diaryText,
        corrected: result.corrected,
        chineseSummary: result.chineseSummary,
        explanations: result.explanations,
        vocabIds: result.vocabIds || [],
        keyWords: result.keyWords,
        grammarPoints: result.grammarPoints,
        advancedWords: result.advancedWords,
        advancedGrammar: result.advancedGrammar,
        upgradedVersion: result.upgradedVersion,
      });

      setLoading(false);
      setShowResult(true);
      setRetryCount(0); // 成功後重置重試次數
    } catch (error) {
      if (!isMountedRef.current) return;

      setLoading(false);

      // 改進的錯誤訊息
      const errorMessage = error instanceof Error ? error.message : t('unexpectedError');

      // 帶重試限制的錯誤處理
      if (retryCount < MAX_RETRY_COUNT) {
        Alert.alert(
          t('error'),
          errorMessage + '\n\n' + t('retryPrompt', { remaining: MAX_RETRY_COUNT - retryCount }),
          [
            {
              text: t('retry'),
              onPress: () => {
                setRetryCount(prev => prev + 1);
                handleSubmit();
              },
            },
            {
              text: t('cancel'),
              style: 'cancel',
              onPress: () => setRetryCount(0)
            },
          ]
        );
      } else {
        Alert.alert(
          t('error'),
          errorMessage + '\n\n' + t('maxRetriesReached'),
          [{ text: t('ok'), onPress: () => setRetryCount(0) }]
        );
      }
    }
  };

  const handleNewDiary = () => {
    // 重置所有狀態
    startTimeRef.current = null;
    setDiaryText('');
    setShowResult(false);
    setSelectedDiary(null);
    setRetryCount(0);
  };

  const handleSelectDiary = (diary: DiaryEntry) => {
    if (!diary) {
      console.error('Invalid diary entry');
      return;
    }
    setSelectedDiary(diary);
    setShowResult(true);
    setShowHistory(false);
  };

  const handleExtractWords = async () => {
    const textToExtract = selectedDiary?.original || diaryText;

    if (!textToExtract.trim()) {
      Alert.alert(t('noNewWords'), t('noDiaryContent'));
      return;
    }

    setExtractingWords(true);

    try {
      const currentLanguage = getSupportedLanguage(i18n.language);
      const userApiKey = await getApiKey();
      const words = await extractWordsFromDiary(
        textToExtract,
        settings.mainLevel,
        currentLanguage,
        userApiKey || undefined
      );

      // 檢查元件是否仍然掛載
      if (!isMountedRef.current) return;

      if (words.length === 0) {
        Alert.alert(t('noNewWords'), t('noNewWordsMessage'));
        setExtractingWords(false);
        return;
      }

      addWordsToLibrary(words);

      Alert.alert(
        t('wordsAdded'),
        t('wordsAddedMessage', {
          count: words.length,
          words: words.map(w => `• ${w.kanji} (${w.kana})`).join('\n')
        }),
        [{ text: t('great') }]
      );
    } catch (error) {
      if (!isMountedRef.current) return;
      const errorMessage = error instanceof Error ? error.message : t('extractFailedMessage');
      Alert.alert(t('extractFailed'), errorMessage);
    } finally {
      if (isMountedRef.current) {
        setExtractingWords(false);
      }
    }
  };

  // 顯示歷史記錄
  if (showHistory) {
    return (
      <DiaryHistory
        diaryEntries={diaryEntries}
        onBack={() => setShowHistory(false)}
        onSelectDiary={handleSelectDiary}
      />
    );
  }

  // 顯示結果
  if (showResult) {
    const diary = selectedDiary || todayDiary;

    // 防禦性檢查：如果沒有日記資料，返回編輯器
    if (!diary) {
      setShowResult(false);
      setSelectedDiary(null);
      return (
        <DiaryEditor
          diaryText={diaryText}
          onTextChange={setDiaryText}
          onSubmit={handleSubmit}
          onShowHistory={() => setShowHistory(true)}
          loading={loading}
        />
      );
    }

    return (
      <DiaryResult
        diary={diary}
        onBack={handleNewDiary}
        onExtractWords={handleExtractWords}
        extractingWords={extractingWords}
      />
    );
  }

  // 編輯器
  return (
    <DiaryEditor
      diaryText={diaryText}
      onTextChange={setDiaryText}
      onSubmit={handleSubmit}
      onShowHistory={() => setShowHistory(true)}
      loading={loading}
    />
  );
}
