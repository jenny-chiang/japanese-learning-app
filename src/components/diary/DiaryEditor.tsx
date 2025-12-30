import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
            <Ionicons name='time-outline' size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          placeholder={t('writeDiaryPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={diaryText}
          onChangeText={onTextChange}
          textAlignVertical='top'
        />
      </View>

      <View style={styles.tipBox}>
        <Ionicons name='information-circle' size={20} color={colors.primary} />
        <Text style={styles.tipText}>{t('writeDiaryPlaceholder')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading || !diaryText.trim()}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name='send' size={24} color={colors.white} />
            <Text style={styles.submitButtonText}>{t('submitDiary')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('../../constants/colors').getTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.cardBackground,
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
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputContainer: {
    margin: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    minHeight: 200,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
