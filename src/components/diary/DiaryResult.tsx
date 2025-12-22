import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DiaryEntry } from '../../types';
import { Colors } from '../../constants/colors';

interface DiaryResultProps {
  diary: DiaryEntry;
  onBack: () => void;
  onExtractWords: () => void;
  extractingWords: boolean;
}

export default function DiaryResult({
  diary,
  onBack,
  onExtractWords,
  extractingWords,
}: DiaryResultProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color='#111827' />
        </TouchableOpacity>
        <View style={styles.resultHeaderContent}>
          <Ionicons name='checkmark-circle' size={48} color='#10B981' />
          <Text style={styles.resultTitle}>{t('teacherComments')}</Text>
        </View>
      </View>

      {/* 原文 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>📝 {t('original')}</Text>
        <View style={styles.textBox}>
          <Text style={styles.originalText}>{diary.original}</Text>
        </View>
      </View>

      {/* 中文重述 */}
      {diary.chineseSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🌏 中文重述</Text>
          <View style={[styles.textBox, styles.summaryBox]}>
            <Text style={styles.summaryText}>{diary.chineseSummary}</Text>
          </View>
        </View>
      )}

      {/* 修正後的日文 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>✅ {t('corrected')}</Text>
        <View style={[styles.textBox, styles.correctedBox]}>
          <Text style={styles.correctedText}>{diary.corrected}</Text>
        </View>
      </View>

      {/* 老師的說明 */}
      {diary.explanations && diary.explanations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>💡 {t('teacherComments')}</Text>
          {diary.explanations.map((explanation: string, index: number) => (
            <View key={index} style={styles.explanationItem}>
              <Ionicons name='bulb' size={16} color='#F59E0B' />
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 關鍵單字 */}
      {diary.keyWords && diary.keyWords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📚 關鍵單字</Text>
          <View style={styles.keyWordsContainer}>
            {diary.keyWords.map((item, index) => (
              <View key={index} style={styles.keyWordItem}>
                <Text style={styles.keyWordText}>{item.word}</Text>
                <Text style={styles.keyWordMeaning}>{item.meaning}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 文法整理 */}
      {diary.grammarPoints && diary.grammarPoints.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📖 文法整理</Text>
          {diary.grammarPoints.map((point, index) => (
            <View key={index} style={styles.grammarItem}>
              <Text style={styles.grammarPattern}>{point.pattern}</Text>
              <Text style={styles.grammarMeaning}>{point.meaning}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleJa}>{point.example}</Text>
                <Text style={styles.exampleTranslation}>{point.exampleTranslation}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 進階單字（JLPT+1） */}
      {diary.advancedWords && diary.advancedWords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>⭐ 進階單字（挑戰更高級別）</Text>
          {diary.advancedWords.map((word, index) => (
            <View key={index} style={styles.advancedWordItem}>
              <View style={styles.advancedWordHeader}>
                <Text style={styles.advancedWord}>{word.word}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{word.level}</Text>
                </View>
              </View>
              <Text style={styles.advancedWordMeaning}>{word.meaning}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleJa}>{word.example}</Text>
                <Text style={styles.exampleTranslation}>{word.exampleTranslation}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 進階文法（JLPT+1） */}
      {diary.advancedGrammar && diary.advancedGrammar.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🚀 進階文法（挑戰更高級別）</Text>
          {diary.advancedGrammar.map((grammar, index) => (
            <View key={index} style={styles.advancedGrammarItem}>
              <Text style={styles.grammarPattern}>{grammar.pattern}</Text>
              <Text style={styles.grammarMeaning}>{grammar.meaning}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleJa}>{grammar.example}</Text>
                <Text style={styles.exampleTranslation}>{grammar.exampleTranslation}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* JLPT+1 升級版 */}
      {diary.upgradedVersion && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🎯 JLPT+1 升級版</Text>
          <View style={[styles.textBox, styles.upgradedBox]}>
            <Text style={styles.upgradedText}>{diary.upgradedVersion}</Text>
          </View>
          <Text style={styles.upgradedHint}>
            💡 這是用更進階的詞彙和表現方式改寫的版本，可以作為學習目標
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.extractWordsButton}
        onPress={onExtractWords}
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
        onPress={onBack}
      >
        <Ionicons name='add-circle' size={24} color='#fff' />
        <Text style={styles.newDiaryButtonText}>{t('writeAnother')}</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  resultHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: 12,
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
  summaryBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  summaryText: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 24,
  },
  keyWordsContainer: {
    gap: 8,
  },
  keyWordItem: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyWordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  keyWordMeaning: {
    fontSize: 14,
    color: '#78350F',
  },
  grammarItem: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  grammarPattern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 6,
  },
  grammarMeaning: {
    fontSize: 14,
    color: '#075985',
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  exampleJa: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  advancedWordItem: {
    backgroundColor: '#FDF4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ABFC',
  },
  advancedWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  advancedWord: {
    fontSize: 18,
    fontWeight: '700',
    color: '#701A75',
  },
  levelBadge: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  advancedWordMeaning: {
    fontSize: 14,
    color: '#86198F',
    marginBottom: 8,
  },
  advancedGrammarItem: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  upgradedBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  upgradedText: {
    fontSize: 16,
    color: '#166534',
    lineHeight: 24,
    fontWeight: '500',
  },
  upgradedHint: {
    fontSize: 13,
    color: '#16A34A',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
