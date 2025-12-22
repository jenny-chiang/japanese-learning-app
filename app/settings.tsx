import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { JLPTLevel } from '../src/types';
import { Colors } from '../src/constants/colors';
import {
  requestNotificationPermissions,
  scheduleDailyNotification,
  cancelAllNotifications,
} from '../src/services/notificationService';
import { verifyGeminiApiKey } from '../src/services/diaryApi';

export default function SettingsScreen() {
  const { settings, updateSettings, resetAllData, stats, achievements } = useAppStore();
  const { t, i18n } = useTranslation();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // 初始化時間選擇器的預設值
    if (settings.reminderTime) {
      const [hour, minute] = settings.reminderTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hour, minute);
      setTempTime(date);
    }

    // 初始化日期選擇器的預設值
    if (settings.examDate) {
      setTempDate(new Date(settings.examDate));
    }
  }, [settings.reminderTime, settings.examDate]);

  const handleLevelChange = (level: JLPTLevel) => {
    updateSettings({ mainLevel: level });
  };

  const handleWordsPerDayChange = (change: number) => {
    const newValue = Math.max(5, Math.min(50, settings.wordsPerDay + change));
    updateSettings({ wordsPerDay: newValue });
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // 開啟通知 - 請求權限
      const hasPermission = await requestNotificationPermissions();

      if (!hasPermission) {
        Alert.alert(
          t('needNotificationPermission'),
          t('notificationPermissionMessage'),
          [{ text: t('ok') }]
        );
        return;
      }

      // 排程通知
      const [hour, minute] = (settings.reminderTime || '21:30')
        .split(':')
        .map(Number);
      const notificationId = await scheduleDailyNotification(hour, minute);

      if (notificationId) {
        updateSettings({ notificationsEnabled: true });
        Alert.alert(
          t('reminderEnabled_alert'),
          t('reminderEnabledMessage', { time: settings.reminderTime || '21:30' })
        );
      } else {
        Alert.alert(t('reminderFailed'), t('reminderFailedMessage'));
      }
    } else {
      // 關閉通知
      await cancelAllNotifications();
      updateSettings({ notificationsEnabled: false });
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      setTempTime(selectedDate);

      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      updateSettings({ reminderTime: timeString });

      // 如果通知已開啟,重新排程
      if (settings.notificationsEnabled) {
        await cancelAllNotifications();
        await scheduleDailyNotification(hour, minute);
        Alert.alert(t('timeUpdated'), t('timeUpdatedMessage', { time: timeString }));
      }
    }

    if (Platform.OS === 'ios') {
      setShowTimePicker(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      setTempDate(selectedDate);

      // 格式化日期為 YYYY-MM-DD
      const dateString = selectedDate.toISOString().split('T')[0];
      updateSettings({ examDate: dateString });

      Alert.alert(t('dateSet'), t('dateSetMessage', { date: dateString }));
    }

    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleReset = () => {
    Alert.alert(t('confirmReset'), t('confirmResetMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('confirm'),
        style: 'destructive',
        onPress: () => {
          resetAllData();
          Alert.alert(t('resetComplete'), t('resetCompleteMessage'));
        },
      },
    ]);
  };

  const handleVerifyApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert(t('error') || '錯誤', '請輸入 API Key');
      return;
    }

    setVerifyingKey(true);

    try {
      const isValid = await verifyGeminiApiKey(apiKey.trim());

      if (isValid) {
        updateSettings({ geminiApiKey: apiKey.trim() });
        Alert.alert(
          t('success') || '成功',
          '✅ API Key 驗證成功！\n\n您現在可以使用自己的 API 配額來批改日記了。',
          [{ text: t('ok') || '確定' }]
        );
      } else {
        Alert.alert(
          t('error') || '錯誤',
          '❌ API Key 無效\n\n請確認您輸入的 API Key 是否正確。\n\n您可以在 Google AI Studio 取得免費的 API Key：\nhttps://aistudio.google.com/apikey'
        );
      }
    } catch (error) {
      Alert.alert(
        t('error') || '錯誤',
        '驗證失敗，請檢查網路連線後重試'
      );
    } finally {
      setVerifyingKey(false);
    }
  };

  const handleRemoveApiKey = () => {
    Alert.alert(
      '移除 API Key',
      '確定要移除您的 API Key 嗎？',
      [
        { text: t('cancel') || '取消', style: 'cancel' },
        {
          text: t('confirm') || '確定',
          style: 'destructive',
          onPress: () => {
            setApiKey('');
            updateSettings({ geminiApiKey: undefined });
            Alert.alert(t('success') || '成功', 'API Key 已移除');
          },
        },
      ]
    );
  };

  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('jlptLevel')}</Text>
        <Text style={styles.sectionDescription}>{t('jlptLevelDesc')}</Text>

        <View style={styles.levelContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                settings.mainLevel === level && styles.levelButtonActive,
              ]}
              onPress={() => handleLevelChange(level)}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  settings.mainLevel === level && styles.levelButtonTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('wordsPerDay')}</Text>
        <Text style={styles.sectionDescription}>{t('wordsPerDayDesc')}</Text>

        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleWordsPerDayChange(-5)}
          >
            <Ionicons name='remove' size={24} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.counterValue}>
            <Text style={styles.counterNumber}>{settings.wordsPerDay}</Text>
            <Text style={styles.counterLabel}>{t('perDay')}</Text>
          </View>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleWordsPerDayChange(5)}
          >
            <Ionicons name='add' size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Gemini API Key</Text>
        <Text style={styles.sectionDescription}>
          使用您自己的 Google Gemini API Key，避免共用配額限制。
          {'\n'}免費取得：https://aistudio.google.com/apikey
        </Text>

        {settings.geminiApiKey ? (
          <View style={styles.apiKeyContainer}>
            <View style={styles.apiKeyStatus}>
              <Ionicons name='checkmark-circle' size={24} color='#10B981' />
              <View style={styles.apiKeyStatusText}>
                <Text style={styles.apiKeyStatusTitle}>✅ 已設定 API Key</Text>
                <Text style={styles.apiKeyStatusDesc}>
                  使用您自己的配額
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeKeyButton}
              onPress={handleRemoveApiKey}
            >
              <Ionicons name='trash-outline' size={20} color='#EF4444' />
              <Text style={styles.removeKeyButtonText}>移除</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.apiKeyInputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.apiKeyInput}
                placeholder='輸入您的 Gemini API Key'
                placeholderTextColor='#9CA3AF'
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize='none'
                autoCorrect={false}
                secureTextEntry={!showApiKey}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowApiKey(!showApiKey)}
              >
                <Ionicons
                  name={showApiKey ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color='#6B7280'
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                verifyingKey && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerifyApiKey}
              disabled={verifyingKey || !apiKey.trim()}
            >
              {verifyingKey ? (
                <ActivityIndicator color='#fff' size='small' />
              ) : (
                <>
                  <Ionicons name='checkmark-circle-outline' size={20} color='#fff' />
                  <Text style={styles.verifyButtonText}>驗證並儲存</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name='information-circle-outline' size={20} color={Colors.primary} />
          <Text style={styles.infoBoxText}>
            💡 設定您自己的 API Key 後，日記批改將使用您的配額，不會消耗應用程式的共用配額。
            Google 提供每日免費額度。
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('examDate')}</Text>
        <Text style={styles.sectionDescription}>{t('examDateDesc')}</Text>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name='calendar-outline' size={24} color={Colors.primary} />
          <Text style={styles.datePickerText}>
            {settings.examDate || t('clickToSetDate')}
          </Text>
          <Ionicons name='chevron-forward' size={20} color='#9CA3AF' />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dailyReminder')}</Text>
        <Text style={styles.sectionDescription}>{t('dailyReminderDesc')}</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{t('enableReminder')}</Text>
            <Text style={styles.settingDescription}>
              {settings.notificationsEnabled
                ? t('reminderEnabled', { time: settings.reminderTime || '21:30' })
                : t('reminderDisabled')}
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
            thumbColor={
              settings.notificationsEnabled ? Colors.primary : '#F3F4F6'
            }
          />
        </View>

        {settings.notificationsEnabled && (
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name='time-outline' size={24} color={Colors.primary} />
            <Text style={styles.timePickerText}>
              {settings.reminderTime || '21:30'}
            </Text>
            <Ionicons name='chevron-forward' size={20} color='#9CA3AF' />
          </TouchableOpacity>
        )}

        {showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode='time'
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <Text style={styles.sectionDescription}>{t('languageDesc')}</Text>

        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              i18n.language === 'zh' && styles.languageButtonActive,
            ]}
            onPress={() => i18n.changeLanguage('zh')}
          >
            <Text
              style={[
                styles.languageButtonText,
                i18n.language === 'zh' && styles.languageButtonTextActive,
              ]}
            >
              🇹🇼 繁體中文
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              i18n.language === 'en' && styles.languageButtonActive,
            ]}
            onPress={() => i18n.changeLanguage('en')}
          >
            <Text
              style={[
                styles.languageButtonText,
                i18n.language === 'en' && styles.languageButtonTextActive,
              ]}
            >
              🇬🇧 English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('achievementTitle')}</Text>
        <Text style={styles.sectionDescription}>
          {t('achievementDesc', { days: stats.currentStreak })}
        </Text>

        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => {
            const titleKey = achievement.id.replace('streak-', 'streak');
            const achievementTitleKey = titleKey === 'streak3' ? 'beginner' :
                                       titleKey === 'streak7' ? 'persistent' :
                                       titleKey === 'streak14' ? 'determined' : 'master';
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  achievement.unlockedAt && styles.achievementUnlocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>
                  {t(achievementTitleKey)}
                </Text>
                <Text style={styles.achievementDesc}>
                  {t(titleKey)}
                </Text>
                {achievement.unlockedAt && (
                  <Text style={styles.achievementUnlockedText}>
                    {t('achievementUnlocked')}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about')}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('version')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Ionicons name='trash' size={20} color='#EF4444' />
        <Text style={styles.resetButtonText}>{t('resetData')}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('footerText')}</Text>
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
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timePickerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 12,
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  achievementUnlocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    opacity: 1,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  achievementUnlockedText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 4,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  languageButtonTextActive: {
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  apiKeyContainer: {
    gap: 12,
  },
  apiKeyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 12,
  },
  apiKeyStatusText: {
    flex: 1,
  },
  apiKeyStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 2,
  },
  apiKeyStatusDesc: {
    fontSize: 14,
    color: '#16A34A',
  },
  removeKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  removeKeyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  apiKeyInputContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  apiKeyInput: {
    flex: 1,
    padding: 16,
    fontSize: 14,
    color: '#111827',
  },
  eyeButton: {
    padding: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 18,
  },
});
