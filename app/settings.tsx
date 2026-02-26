import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { JLPTLevel, Language, UserSettings } from '../src/types';
import { useTheme } from '../src/contexts/ThemeContext';
import {
  requestNotificationPermissions,
  scheduleDailyNotification,
  cancelAllNotifications,
} from '../src/services/notificationService';
import { verifyGeminiApiKey } from '../src/services/diaryApi';
import { SecureStorage } from '../src/services/secureStorage';
import { Link } from 'expo-router';
import { createStyles } from './settings.styles';
import {
  DEFAULT_REMINDER_TIME,
  WORDS_PER_DAY_MIN,
  WORDS_PER_DAY_MAX,
  WORDS_PER_DAY_STEP,
  LEVELS,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  parseTimeString,
  formatTimeString,
  formatDateString,
  getAchievementTitleKey,
} from './settings.constants';

export default function SettingsScreen() {
  const { settings, updateSettings, resetAllData, stats, achievements } = useAppStore();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const reminderTime = settings.reminderTime || DEFAULT_REMINDER_TIME;
  const trimmedApiKey = apiKey.trim();
  const canVerifyApiKey = !verifyingKey && trimmedApiKey.length > 0;
  const activeLanguage = i18n.language.startsWith('zh') ? 'zh' : 'en';

  // 載入 API Key 狀態
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const exists = await SecureStorage.hasGeminiApiKey();
        setHasApiKey(exists);
      } catch (error) {
        console.error('檢查 API Key 失敗:', error);
      }
    };

    checkApiKey();
  }, []);

  useEffect(() => {
    // 初始化時間選擇器的預設值
    if (settings.reminderTime) {
      const { hour, minute } = parseTimeString(settings.reminderTime);
      const date = new Date();
      date.setHours(hour, minute);
      setTempTime(date);
    }

    // 初始化日期選擇器的預設值
    if (settings.examDate) {
      const parsedDate = new Date(settings.examDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        setTempDate(parsedDate);
      }
    }
  }, [settings.reminderTime, settings.examDate]);

  const handleLevelChange = useCallback((level: JLPTLevel) => {
    updateSettings({ mainLevel: level });
  }, [updateSettings]);

  const handleWordsPerDayChange = useCallback((change: number) => {
    const newValue = Math.max(
      WORDS_PER_DAY_MIN,
      Math.min(WORDS_PER_DAY_MAX, settings.wordsPerDay + change)
    );
    updateSettings({ wordsPerDay: newValue });
  }, [settings.wordsPerDay, updateSettings]);

  const decreaseWordsPerDay = useCallback(() => {
    handleWordsPerDayChange(-WORDS_PER_DAY_STEP);
  }, [handleWordsPerDayChange]);

  const increaseWordsPerDay = useCallback(() => {
    handleWordsPerDayChange(WORDS_PER_DAY_STEP);
  }, [handleWordsPerDayChange]);

  const handleNotificationToggle = useCallback(async (value: boolean) => {
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
      const { hour, minute } = parseTimeString(reminderTime);
      const notificationId = await scheduleDailyNotification(hour, minute);

      if (notificationId) {
        updateSettings({ notificationsEnabled: true });
        Alert.alert(
          t('reminderEnabled_alert'),
          t('reminderEnabledMessage', { time: reminderTime })
        );
      } else {
        Alert.alert(t('reminderFailed'), t('reminderFailedMessage'));
      }
    } else {
      // 關閉通知
      await cancelAllNotifications();
      updateSettings({ notificationsEnabled: false });
    }
  }, [reminderTime, t, updateSettings]);

  const handleTimeChange = useCallback(async (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      setTempTime(selectedDate);

      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      const timeString = formatTimeString(selectedDate);

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
  }, [settings.notificationsEnabled, t, updateSettings]);

  const handleDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      setTempDate(selectedDate);

      // 格式化日期為 YYYY-MM-DD
      const dateString = formatDateString(selectedDate);
      updateSettings({ examDate: dateString });

      Alert.alert(t('dateSet'), t('dateSetMessage', { date: dateString }));
    }

    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  }, [t, updateSettings]);

  const handleReset = useCallback(() => {
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
  }, [resetAllData, t]);

  const handleVerifyApiKey = useCallback(async () => {
    if (!trimmedApiKey) {
      Alert.alert(t('error'), t('apiKeyEnterPrompt'));
      return;
    }

    setVerifyingKey(true);

    try {
      const isValid = await verifyGeminiApiKey(trimmedApiKey);

      if (isValid) {
        // 使用安全儲存儲存 API Key
        await SecureStorage.saveGeminiApiKey(trimmedApiKey);
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
  }, [t, trimmedApiKey]);

  const handleRemoveApiKey = useCallback(() => {
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
  }, [t]);

  const handleToggleApiKeyVisibility = useCallback(() => {
    setShowApiKey((prev) => !prev);
  }, []);

  const openDatePicker = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const openTimePicker = useCallback(() => {
    setShowTimePicker(true);
  }, []);

  const handleLanguageChange = useCallback((language: Language) => {
    i18n.changeLanguage(language);
    updateSettings({ language });
  }, [i18n, updateSettings]);

  const handleThemeModeChange = useCallback((themeMode: UserSettings['themeMode']) => {
    updateSettings({ themeMode });
  }, [updateSettings]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('jlptLevel')}</Text>
        <Text style={styles.sectionDescription}>{t('jlptLevelDesc')}</Text>

        <View style={styles.levelContainer}>
          {LEVELS.map((level) => (
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
            onPress={decreaseWordsPerDay}
          >
            <Ionicons name='remove' size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.counterValue}>
            <Text style={styles.counterNumber}>{settings.wordsPerDay}</Text>
            <Text style={styles.counterLabel}>{t('perDay')}</Text>
          </View>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={increaseWordsPerDay}
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
                onPress={handleToggleApiKeyVisibility}
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
              disabled={!canVerifyApiKey}
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
          onPress={openDatePicker}
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
                ? t('reminderEnabled', { time: reminderTime })
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
            onPress={openTimePicker}
          >
            <Ionicons name='time-outline' size={24} color={colors.primary} />
            <Text style={styles.timePickerText}>
              {reminderTime}
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
          {LANGUAGE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.code}
              style={[
                styles.languageButton,
                activeLanguage === option.code && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange(option.code)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  activeLanguage === option.code && styles.languageButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('theme')}</Text>
        <Text style={styles.sectionDescription}>{t('themeDesc')}</Text>

        <View style={styles.languageContainer}>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.languageButton,
                settings.themeMode === option.mode && styles.languageButtonActive,
              ]}
              onPress={() => handleThemeModeChange(option.mode)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  settings.themeMode === option.mode && styles.languageButtonTextActive,
                ]}
              >
                {option.icon} {t(option.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('achievementTitle')}</Text>
        <Text style={styles.sectionDescription}>
          {t('achievementDesc', { days: stats.currentStreak })}
        </Text>

        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => {
            const { titleKey, achievementTitleKey } = getAchievementTitleKey(achievement.id);
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
