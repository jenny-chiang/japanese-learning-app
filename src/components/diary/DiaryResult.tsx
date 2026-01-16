import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DiaryEntry } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.resultHeaderContent}>
          <Ionicons name='checkmark-circle' size={48} color={colors.success} />
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

      {/* 升級版 */}
      {diary.upgradedVersion && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🎯 升級版</Text>
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
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name='book' size={20} color={colors.white} />
            <Text style={styles.extractWordsButtonText}>{t('extractWords')}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.newDiaryButton}
        onPress={onBack}
      >
        <Ionicons name='add-circle' size={24} color={colors.white} />
        <Text style={styles.newDiaryButtonText}>{t('writeAnother')}</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../../constants/colors').getTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultHeader: {
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.textPrimary,
    marginTop: 12,
  },
  section: {
    margin: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textBox: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  correctedBox: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.success,
  },
  originalText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  correctedText: {
    fontSize: 16,
    color: colors.success,
    lineHeight: 24,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  extractWordsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  extractWordsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  newDiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  newDiaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryBox: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  summaryText: {
    fontSize: 15,
    color: colors.primary,
    lineHeight: 24,
  },
  keyWordsContainer: {
    gap: 8,
  },
  keyWordItem: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  keyWordText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  keyWordMeaning: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  grammarItem: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  grammarPattern: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  grammarMeaning: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  exampleJa: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  advancedWordItem: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
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
    color: colors.primary,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  advancedWordMeaning: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  advancedGrammarItem: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  upgradedBox: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.success,
  },
  upgradedText: {
    fontSize: 16,
    color: colors.success,
    lineHeight: 24,
    fontWeight: '500',
  },
  upgradedHint: {
    fontSize: 13,
    color: colors.success,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
