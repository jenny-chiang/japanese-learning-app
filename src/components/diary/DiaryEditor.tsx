import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';

interface DiaryEditorProps {
  diaryText: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onShowHistory: () => void;
  loading: boolean;
}

export default function DiaryEditor({
  diaryText,
  onTextChange,
  onSubmit,
  onShowHistory,
  loading,
}: DiaryEditorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t('diaryTitle')}</Text>
            <Text style={styles.subtitle}>{t('writeDiaryPlaceholder')}</Text>
          </View>
          <TouchableOpacity
            onPress={onShowHistory}
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
          onChangeText={onTextChange}
          textAlignVertical='top'
        />
      </View>

      <View style={styles.tipBox}>
        <Ionicons name='information-circle' size={20} color={Colors.primary} />
        <Text style={styles.tipText}>{t('writeDiaryPlaceholder')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={onSubmit}
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
});
