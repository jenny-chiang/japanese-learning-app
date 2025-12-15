import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { correctDiaryWithGemini, extractWordsFromDiary } from '../src/services/diaryApi';
import { DiaryEntry } from '../src/types';
import { Colors } from '../src/constants/colors';

export default function DiaryScreen() {
  const { t, i18n } = useTranslation();
  const [diaryText, setDiaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<any>(null);
  const [extractingWords, setExtractingWords] = useState(false);

  const { addDiaryEntry, todayDiary, diaryEntries, settings, addWordsToLibrary } = useAppStore();

  const handleSubmit = async () => {
    if (!diaryText.trim()) return;

    setLoading(true);

    try {
      // 使用 Gemini API
      const currentLanguage = i18n.language as 'zh' | 'en';
      const result = await correctDiaryWithGemini(diaryText, settings.mainLevel, currentLanguage);

      addDiaryEntry({
        original: diaryText,
        corrected: result.corrected,
        explanations: result.explanations,
        vocabIds: result.vocabIds || [],
        grammarPoints: result.grammarPoints,
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
    setDiaryText('');
    setShowResult(false);
    setSelectedDiary(null);
  };

  const viewDiary = (diary: any) => {
    setSelectedDiary(diary);
    setShowResult(true);
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
      const words = await extractWordsFromDiary(textToExtract, settings.mainLevel, currentLanguage);

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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => setShowHistory(false)}
              style={styles.backButton}
            >
              <Ionicons name='arrow-back' size={24} color='#111827' />
            </TouchableOpacity>
            <Text style={styles.title}>{t('diaryHistory')}</Text>
          </View>
        </View>
        <ScrollView>
          {diaryEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name='document-text-outline'
                size={64}
                color='#9CA3AF'
              />
              <Text style={styles.emptyText}>{t('noDiaryYet')}</Text>
            </View>
          ) : (
            diaryEntries
              .slice()
              .reverse()
              .map((entry: DiaryEntry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.historyItem}
                  onPress={() => {
                    viewDiary(entry);
                    setShowHistory(false);
                  }}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.createdAt).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Ionicons
                      name='chevron-forward'
                      size={20}
                      color='#9CA3AF'
                    />
                  </View>
                  <Text style={styles.historyPreview} numberOfLines={2}>
                    {entry.original}
                  </Text>
                </TouchableOpacity>
              ))
          )}
        </ScrollView>
      </View>
    );
  }

  if (showResult && (todayDiary || selectedDiary)) {
    const diary = selectedDiary || todayDiary;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultHeader}>
          <TouchableOpacity onPress={handleNewDiary} style={styles.backButton}>
            <Ionicons name='arrow-back' size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.resultHeaderContent}>
            <Ionicons name='checkmark-circle' size={48} color='#10B981' />
            <Text style={styles.resultTitle}>{t('teacherComments')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('original')}</Text>
          <View style={styles.textBox}>
            <Text style={styles.originalText}>{diary.original}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('corrected')}</Text>
          <View style={[styles.textBox, styles.correctedBox]}>
            <Text style={styles.correctedText}>{diary.corrected}</Text>
          </View>
        </View>

        {diary.explanations && diary.explanations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('teacherComments')}</Text>
            {diary.explanations.map((explanation: string, index: number) => (
              <View key={index} style={styles.explanationItem}>
                <Ionicons name='bulb' size={16} color='#F59E0B' />
                <Text style={styles.explanationText}>{explanation}</Text>
              </View>
            ))}
          </View>
        )}

        {diary.grammarPoints && diary.grammarPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('grammarPoints')}</Text>
            <View style={styles.tagsContainer}>
              {diary.grammarPoints.map((point: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.extractWordsButton}
          onPress={handleExtractWords}
          disabled={extractingWords}
        >
          {extractingWords ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name='book' size={20} color='#fff' />
              <Text style={styles.extractWordsButtonText}>{t('extractWords')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newDiaryButton}
          onPress={handleNewDiary}
        >
          <Ionicons name='add-circle' size={24} color='#fff' />
          <Text style={styles.newDiaryButtonText}>{t('writeAnother')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t('diaryTitle')}</Text>
            <Text style={styles.subtitle}>{t('writeDiaryPlaceholder')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowHistory(true)}
            style={styles.historyButton}
          >
            <Ionicons name='time-outline' size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          placeholder={t('writeDiaryPlaceholder')}
          placeholderTextColor='#9CA3AF'
          value={diaryText}
          onChangeText={setDiaryText}
          textAlignVertical='top'
        />
      </View>

      <View style={styles.tipBox}>
        <Ionicons name='information-circle' size={20} color={Colors.primary} />
        <Text style={styles.tipText}>{t('writeDiaryPlaceholder')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading || !diaryText.trim()}
      >
        {loading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <>
            <Ionicons name='send' size={24} color='#fff' />
            <Text style={styles.submitButtonText}>{t('submitDiary')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  historyButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  inputContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    minHeight: 200,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#4338CA',
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 20,
  },
  resultHeaderContent: {
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  section: {
    margin: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  correctedBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  originalText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  correctedText: {
    fontSize: 16,
    color: '#065F46',
    lineHeight: 24,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#4338CA',
    fontWeight: '500',
  },
  extractWordsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  extractWordsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newDiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  newDiaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  historyPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
