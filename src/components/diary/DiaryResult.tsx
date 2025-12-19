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
});
