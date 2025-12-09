import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';
import { Colors } from '../src/constants/colors';

export default function TodayScreen() {
  const router = useRouter();
  const { todayProgress, words, todayDiaryDone } = useAppStore();

  const todayWordCount = todayProgress.todayWordCount;
  const doneWordCount = todayProgress.doneWordCount;
  const diaryDone = todayDiaryDone;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今天的小任務</Text>
        <Text style={styles.subtitle}>慢慢來,考試也等你 🐌</Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>今日進度</Text>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{doneWordCount}/{todayWordCount}</Text>
            <Text style={styles.statLabel}>單字</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name={diaryDone ? "checkmark-circle" : "ellipse-outline"}
              size={32}
              color={diaryDone ? "#10B981" : "#D1D5DB"}
            />
            <Text style={styles.statLabel}>日記</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/words')}
      >
        <View style={styles.taskIcon}>
          <Ionicons name="book" size={24} color={Colors.primary} />
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>背單字</Text>
          <Text style={styles.taskSubtitle}>
            今天剩下 {todayWordCount - doneWordCount} 個
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/diary')}
      >
        <View style={styles.taskIcon}>
          <Ionicons name="create" size={24} color={Colors.primary} />
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>寫日記</Text>
          <Text style={styles.taskSubtitle}>
            {diaryDone ? '今天已寫完 👏' : '還沒跟日文老師打招呼～'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
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
    color: '#111827',
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  motivationPanel: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    color: '#92400E',
    textAlign: 'center',
  },
});
