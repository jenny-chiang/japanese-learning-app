import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';
import { JLPTLevel } from '../src/types';
import { Colors } from '../src/constants/colors';

export default function SettingsScreen() {
  const { settings, updateSettings, resetAllData } = useAppStore();

  const handleLevelChange = (level: JLPTLevel) => {
    updateSettings({ mainLevel: level });
  };

  const handleWordsPerDayChange = (change: number) => {
    const newValue = Math.max(5, Math.min(50, settings.wordsPerDay + change));
    updateSettings({ wordsPerDay: newValue });
  };

  const handleNotificationToggle = (value: boolean) => {
    updateSettings({ notificationsEnabled: value });
  };

  const handleReset = () => {
    Alert.alert(
      '確認重置',
      '這會清除所有學習記錄,確定要繼續嗎?',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('已重置', '所有學習記錄已清除');
          }
        }
      ]
    );
  };

  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>JLPT 主戰等級</Text>
        <Text style={styles.sectionDescription}>選擇你目前主力準備的等級</Text>

        <View style={styles.levelContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                settings.mainLevel === level && styles.levelButtonActive
              ]}
              onPress={() => handleLevelChange(level)}
            >
              <Text style={[
                styles.levelButtonText,
                settings.mainLevel === level && styles.levelButtonTextActive
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>每日單字數</Text>
        <Text style={styles.sectionDescription}>設定每天想背的單字數量</Text>

        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleWordsPerDayChange(-5)}
          >
            <Ionicons name="remove" size={24} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.counterValue}>
            <Text style={styles.counterNumber}>{settings.wordsPerDay}</Text>
            <Text style={styles.counterLabel}>個/天</Text>
          </View>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleWordsPerDayChange(5)}
          >
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>每日提醒</Text>
            <Text style={styles.settingDescription}>
              {settings.notificationsEnabled
                ? settings.reminderTime || '21:30'
                : '已關閉'}
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
            thumbColor={settings.notificationsEnabled ? Colors.primary : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>關於</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>版本</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleReset}
      >
        <Ionicons name="trash" size={20} color="#EF4444" />
        <Text style={styles.resetButtonText}>清除所有學習記錄</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>慢慢來,考試也等你 🐌</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  levelButtonTextActive: {
    color: Colors.primary,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  counterNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  counterLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
