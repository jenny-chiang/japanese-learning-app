import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/contexts/ThemeContext';

export default function TodayScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { todayProgress, stats, getDaysUntilExam, achievements } = useAppStore();
  const { colors } = useTheme();

  const todayWordCount = todayProgress.todayWordCount;
  const doneWordCount = todayProgress.doneWordCount;
  const diaryDone = todayProgress.diaryDone;
  const daysUntilExam = getDaysUntilExam();
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('todayTitle')}</Text>
        {daysUntilExam !== null && daysUntilExam > 0 && (
          <Text style={styles.examCountdown}>
            📅 {t('daysUntilExam', { days: daysUntilExam })}
          </Text>
        )}
      </View>

      {/* 連續打卡 & 成就 */}
      <View style={styles.statsRow}>
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
          <Text style={styles.streakLabel}>{t('currentStreak')}</Text>
        </View>
        <View style={styles.achievementCard}>
          <Text style={styles.achievementEmoji}>
            {unlockedAchievements.length > 0
              ? unlockedAchievements[unlockedAchievements.length - 1].icon
              : '🏆'}
          </Text>
          <Text style={styles.achievementNumber}>{unlockedAchievements.length}</Text>
          <Text style={styles.achievementLabel}>{t('achievements')}</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>{t('todayProgress')}</Text>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{doneWordCount}/{todayWordCount}</Text>
            <Text style={styles.statLabel}>{t('wordsLabel')}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name={diaryDone ? "checkmark-circle" : "ellipse-outline"}
              size={32}
              color={diaryDone ? colors.success : colors.textTertiary}
            />
            <Text style={styles.statLabel}>{t('diaryLabel')}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/words')}
      >
        <View style={styles.taskIcon}>
          <Ionicons name="book" size={24} color={colors.primary} />
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{t('studyWords')}</Text>
          <Text style={styles.taskSubtitle}>
            {t('wordsRemaining', { count: todayWordCount - doneWordCount })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/diary')}
      >
        <View style={styles.taskIcon}>
          <Ionicons name="create" size={24} color={colors.primary} />
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{t('writeDiary')}</Text>
          <Text style={styles.taskSubtitle}>
            {diaryDone ? t('diaryDone') : t('diaryNotDone')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
      </TouchableOpacity>
    </ScrollView>
  );
}


const createStyles = (colors: ReturnType<typeof import('../src/constants/colors').getTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.backgroundWhite,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  examCountdown: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  streakCard: {
    flex: 1,
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.warning,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: '600',
  },
  achievementCard: {
    flex: 1,
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.warning,
  },
  achievementLabel: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  motivationPanel: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    color: colors.warningDark,
    textAlign: 'center',
  },
});
