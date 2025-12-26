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

export default function DiaryScreen() {
  const { t, i18n } = useTranslation();
  const [diaryText, setDiaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [extractingWords, setExtractingWords] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const { addDiaryEntry, todayDiary, diaryEntries, settings, addWordsToLibrary, recordStudyTime } = useAppStore();

  // 當用戶開始輸入時記錄時間
  useEffect(() => {
    if (diaryText.length > 0 && !startTimeRef.current && !showResult) {
      startTimeRef.current = Date.now();
    }
  }, [diaryText, showResult]);

  const handleSubmit = async () => {
    if (!diaryText.trim()) return;

    setLoading(true);

    try {
      // 記錄學習時長
      if (startTimeRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000 / 60); // 分鐘
        if (duration > 0) {
          recordStudyTime(duration);
        }
        startTimeRef.current = null;
      }

      // 使用 Gemini API（從安全儲存讀取用戶的 API Key）
      const currentLanguage = i18n.language as 'zh' | 'en';
      const userApiKey = await SecureStorage.getGeminiApiKey();
      const result = await correctDiaryWithGemini(
        diaryText,
        settings.mainLevel,
        currentLanguage,
        userApiKey || undefined
      );

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
    } catch (error) {
      setLoading(false);
      Alert.alert(
        t('submitting'),
        error instanceof Error ? error.message : t('noDiaryContent'),
        [
          {
            text: t('ok'),
            onPress: () => {
              handleSubmit();
            },
          },
          { text: t('cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleNewDiary = () => {
    // 重置時間計時器
    startTimeRef.current = null;
    setDiaryText('');
    setShowResult(false);
    setSelectedDiary(null);
  };

  const handleSelectDiary = (diary: DiaryEntry) => {
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
      const currentLanguage = i18n.language as 'zh' | 'en';
      const userApiKey = await SecureStorage.getGeminiApiKey();
      const words = await extractWordsFromDiary(
        textToExtract,
        settings.mainLevel,
        currentLanguage,
        userApiKey || undefined
      );

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
      Alert.alert(t('extractFailed'), t('extractFailedMessage'));
    } finally {
      setExtractingWords(false);
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
  if (showResult && (todayDiary || selectedDiary)) {
    const diary = selectedDiary || todayDiary!;
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
