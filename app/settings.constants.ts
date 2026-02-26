import { JLPTLevel, Language, UserSettings } from '../src/types';

export const DEFAULT_REMINDER_TIME = '21:30';
export const WORDS_PER_DAY_MIN = 5;
export const WORDS_PER_DAY_MAX = 50;
export const WORDS_PER_DAY_STEP = 5;

export const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: 'zh', label: '🇹🇼 繁體中文' },
  { code: 'en', label: '🇬🇧 English' },
];

export const THEME_OPTIONS: Array<{
  mode: UserSettings['themeMode'];
  icon: string;
  labelKey: 'themeLight' | 'themeDark' | 'themeSystem';
}> = [
  { mode: 'light', icon: '☀️', labelKey: 'themeLight' },
  { mode: 'dark', icon: '🌙', labelKey: 'themeDark' },
  { mode: 'system', icon: '📱', labelKey: 'themeSystem' },
];

export const parseTimeString = (time = DEFAULT_REMINDER_TIME) => {
  const [hour, minute] = time.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 21,
    minute: Number.isFinite(minute) ? minute : 30,
  };
};

export const formatTimeString = (date: Date) => {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

export const formatDateString = (date: Date) => date.toISOString().split('T')[0];

export const getAchievementTitleKey = (achievementId: string) => {
  const titleKey = achievementId.replace('streak-', 'streak');
  const achievementTitleKey = titleKey === 'streak3'
    ? 'beginner'
    : titleKey === 'streak7'
      ? 'persistent'
      : titleKey === 'streak14'
        ? 'determined'
        : 'master';

  return { titleKey, achievementTitleKey };
};
