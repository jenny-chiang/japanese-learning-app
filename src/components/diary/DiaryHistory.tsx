import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DiaryEntry } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface DiaryHistoryProps {
  diaryEntries: DiaryEntry[];
  onBack: () => void;
  onSelectDiary: (diary: DiaryEntry) => void;
}

export default function DiaryHistory({
  diaryEntries,
  onBack,
  onSelectDiary,
}: DiaryHistoryProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons name='arrow-back' size={24} color={colors.textPrimary} />
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
              color={colors.textTertiary}
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
                onPress={() => onSelectDiary(entry)}
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
                    color={colors.textTertiary}
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

const createStyles = (colors: ReturnType<typeof import('../../constants/colors').getTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    gap: 16,
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
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
    marginTop: 16,
  },
  historyItem: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: colors.shadow,
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
    color: colors.primary,
  },
  historyPreview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
