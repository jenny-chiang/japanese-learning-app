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
import { useTheme } from '../src/contexts/ThemeContext';
import {
  requestNotificationPermissions,
  scheduleDailyNotification,
  cancelAllNotifications,
} from '../src/services/notificationService';
import { verifyGeminiApiKey } from '../src/services/diaryApi';
import { SecureStorage } from '../src/services/secureStorage';
import { Link } from 'expo-router';

export default function SettingsScreen() {
  const { settings, updateSettings, resetAllData, stats, achievements } = useAppStore();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(true);

  // 載入 API Key 狀態
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const exists = await SecureStorage.hasGeminiApiKey();
        setHasApiKey(exists);
      } catch (error) {
        console.error('檢查 API Key 失敗:', error);
      } finally {
        setLoadingApiKey(false);
      }
    };

    checkApiKey();
  }, []);

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
      Alert.alert(t('error'), t('apiKeyEnterPrompt'));
      return;
    }

    setVerifyingKey(true);

    try {
      const isValid = await verifyGeminiApiKey(apiKey.trim());

      if (isValid) {
        // 使用安全儲存儲存 API Key
        await SecureStorage.saveGeminiApiKey(apiKey.trim());
        setHasApiKey(true);
        setApiKey(''); // 清空輸入框
        Alert.alert(
          t('success'),
          t('apiKeyVerifySuccess'),
          [{ text: t('ok') }]
        );
      } else {
        Alert.alert(
          t('error'),
          t('apiKeyInvalid')
        );
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        t('apiKeyVerifyFailed')
      );
    } finally {
      setVerifyingKey(false);
    }
  };

  const handleRemoveApiKey = () => {
    Alert.alert(
      t('apiKeyRemoveTitle'),
      t('apiKeyRemoveConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStorage.deleteGeminiApiKey();
              setApiKey('');
              setHasApiKey(false);
              Alert.alert(t('success'), t('apiKeyRemoveSuccess'));
            } catch (error) {
              Alert.alert(t('error'), t('apiKeyRemoveFailed'));
            }
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
            <Ionicons name='remove' size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.counterValue}>
            <Text style={styles.counterNumber}>{settings.wordsPerDay}</Text>
            <Text style={styles.counterLabel}>{t('perDay')}</Text>
          </View>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleWordsPerDayChange(5)}
          >
            <Ionicons name='add' size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('apiKeyTitle')}</Text>
          <Text style={[styles.sectionDescription, { marginBottom: 0 }]}>
            {t('apiKeyDesc')}
          </Text>
          <Link style={styles.apiLink} href='https://aistudio.google.com/apikey' target='_blank'>https://aistudio.google.com/apikey</Link>

        {hasApiKey ? (
          <View style={styles.apiKeyContainer}>
            <View style={styles.apiKeyStatus}>
              <Ionicons name='checkmark-circle' size={24} color='#10B981' />
              <View style={styles.apiKeyStatusText}>
                <Text style={styles.apiKeyStatusTitle}>{t('apiKeyConfigured')}</Text>
                <Text style={styles.apiKeyStatusDesc}>
                  {t('apiKeyStoredSecurely')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeKeyButton}
              onPress={handleRemoveApiKey}
            >
              <Ionicons name='trash-outline' size={20} color={colors.error} />
              <Text style={styles.removeKeyButtonText}>{t('apiKeyRemove')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.apiKeyInputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.apiKeyInput}
                placeholder={t('apiKeyPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize='none'
                autoCorrect={false}
                secureTextEntry={!showApiKey}
                keyboardAppearance={isDark ? 'dark' : 'light'}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowApiKey(!showApiKey)}
              >
                <Ionicons
                  name={showApiKey ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
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
                  <Text style={styles.verifyButtonText}>{t('apiKeyVerifyAndSave')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name='information-circle-outline' size={20} color={colors.primary} />
          <Text style={styles.infoBoxText}>
            {t('apiKeyInfoTip')}
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
          <Ionicons name='calendar-outline' size={24} color={colors.primary} />
          <Text style={styles.datePickerText}>
            {settings.examDate || t('clickToSetDate')}
          </Text>
          <Ionicons name='chevron-forward' size={20} color={colors.textTertiary} />
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
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={
              settings.notificationsEnabled ? colors.primary : colors.border
            }
          />
        </View>

        {settings.notificationsEnabled && (
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name='time-outline' size={24} color={colors.primary} />
            <Text style={styles.timePickerText}>
              {settings.reminderTime || '21:30'}
            </Text>
            <Ionicons name='chevron-forward' size={20} color={colors.textTertiary} />
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
        <Text style={styles.sectionTitle}>{t('theme')}</Text>
        <Text style={styles.sectionDescription}>{t('themeDesc')}</Text>

        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              settings.themeMode === 'light' && styles.languageButtonActive,
            ]}
            onPress={() => updateSettings({ themeMode: 'light' })}
          >
            <Text
              style={[
                styles.languageButtonText,
                settings.themeMode === 'light' && styles.languageButtonTextActive,
              ]}
            >
              ☀️ {t('themeLight')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              settings.themeMode === 'dark' && styles.languageButtonActive,
            ]}
            onPress={() => updateSettings({ themeMode: 'dark' })}
          >
            <Text
              style={[
                styles.languageButtonText,
                settings.themeMode === 'dark' && styles.languageButtonTextActive,
              ]}
            >
              🌙 {t('themeDark')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              settings.themeMode === 'system' && styles.languageButtonActive,
            ]}
            onPress={() => updateSettings({ themeMode: 'system' })}
          >
            <Text
              style={[
                styles.languageButtonText,
                settings.themeMode === 'system' && styles.languageButtonTextActive,
              ]}
            >
              📱 {t('themeSystem')}
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
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../src/constants/colors').getTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.cardBackground,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  levelButtonTextActive: {
    color: colors.primary,
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
    backgroundColor: colors.primaryLight,
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
    color: colors.primary,
  },
  counterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timePickerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
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
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '47%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    opacity: 0.5,
  },
  achievementUnlocked: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
    opacity: 1,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  achievementUnlockedText: {
    fontSize: 11,
    color: colors.warning,
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
    backgroundColor: colors.border,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  languageButtonTextActive: {
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  apiKeyContainer: {
    gap: 12,
  },
  apiLink: {
    color: colors.primary,
    marginBottom: 16,
  },
  apiKeyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    gap: 12,
  },
  apiKeyStatusText: {
    flex: 1,
  },
  apiKeyStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 2,
  },
  apiKeyStatusDesc: {
    fontSize: 14,
    color: colors.success,
  },
  removeKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  removeKeyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  apiKeyInputContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  apiKeyInput: {
    flex: 1,
    padding: 16,
    fontSize: 14,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
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
    color: colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
  },
});
