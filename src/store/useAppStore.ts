import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Word,
  DiaryEntry,
  UserSettings,
  TodayProgress,
} from '../types';
import wordsN3Data from '../../assets/data/words-n3.json';

interface AppState {
  // 單字
  words: Word[];
  todayWords: Word[];

  // 日記
  diaryEntries: DiaryEntry[];
  todayDiary: DiaryEntry | null;
  todayDiaryDone: boolean;

  // 設定
  settings: UserSettings;

  // 今日進度
  todayProgress: TodayProgress;

  // Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;

  // 單字相關
  updateWordFamiliarity: (wordId: string, familiarity: 0 | 1 | 2 | 3) => void;
  flagWord: (wordId: string, flagged: boolean) => void;
  calculateTodayWords: () => void;

  // 日記相關
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;

  // 設定相關
  updateSettings: (settings: Partial<UserSettings>) => void;

  // 其他
  resetAllData: () => void;
  calculateTodayProgress: () => void;
}

const defaultSettings: UserSettings = {
  mainLevel: 'N3',
  wordsPerDay: 10,
  reminderTime: '21:30',
  notificationsEnabled: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  // 初始狀態
  words: [],
  todayWords: [],
  diaryEntries: [],
  todayDiary: null,
  todayDiaryDone: false,
  settings: defaultSettings,
  todayProgress: {
    todayWordCount: 0,
    doneWordCount: 0,
    diaryDone: false,
  },

  // 載入資料
  loadData: async () => {
    try {
      // 載入單字 (先從假資料,之後從 AsyncStorage)
      const storedWords = await AsyncStorage.getItem('words');
      let words: Word[] = [];

      if (storedWords) {
        words = JSON.parse(storedWords);
      } else {
        // 第一次使用,載入假資料
        words = wordsN3Data.map((w) => ({
          ...w,
          lastReviewedAt: undefined,
          flagged: false,
        })) as Word[];
      }

      // 載入日記
      const storedDiaries = await AsyncStorage.getItem('diaryEntries');
      const diaryEntries: DiaryEntry[] = storedDiaries
        ? JSON.parse(storedDiaries)
        : [];

      // 載入設定
      const storedSettings = await AsyncStorage.getItem('settings');
      const settings: UserSettings = storedSettings
        ? JSON.parse(storedSettings)
        : defaultSettings;

      // 檢查今天的日記
      const today = new Date().toISOString().split('T')[0];
      const todayDiary = diaryEntries.find((entry) =>
        entry.createdAt.startsWith(today)
      );

      set({
        words,
        diaryEntries,
        settings,
        todayDiary: todayDiary || null,
        todayDiaryDone: !!todayDiary,
      });

      // 計算今日單字和進度
      get().calculateTodayWords();
      get().calculateTodayProgress();
    } catch (error) {
      console.error('載入資料失敗:', error);
    }
  },

  // 儲存資料
  saveData: async () => {
    try {
      const { words, diaryEntries, settings } = get();
      await AsyncStorage.setItem('words', JSON.stringify(words));
      await AsyncStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('儲存資料失敗:', error);
    }
  },

  // 更新單字熟悉度
  updateWordFamiliarity: (wordId: string, familiarity: 0 | 1 | 2 | 3) => {
    set((state) => ({
      words: state.words.map((word) =>
        word.id === wordId
          ? {
              ...word,
              familiarity,
              lastReviewedAt: new Date().toISOString(),
            }
          : word
      ),
    }));
    get().calculateTodayProgress();
    get().saveData();
  },

  // 標記單字
  flagWord: (wordId: string, flagged: boolean) => {
    set((state) => ({
      words: state.words.map((word) =>
        word.id === wordId ? { ...word, flagged } : word
      ),
      todayWords: state.todayWords.map((word) =>
        word.id === wordId ? { ...word, flagged } : word
      ),
    }));
    get().saveData();
  },

  // 計算今日單字
  calculateTodayWords: () => {
    const { words, settings } = get();
    const today = new Date().toISOString().split('T')[0];

    // 簡單的 SRS: 優先選擇熟悉度低的 + 很久沒複習的
    const sortedWords = [...words].sort((a, b) => {
      // 先按熟悉度排序
      if (a.familiarity !== b.familiarity) {
        return a.familiarity - b.familiarity;
      }

      // 再按上次複習時間排序
      const aTime = a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0;
      const bTime = b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0;
      return aTime - bTime;
    });

    const todayWords = sortedWords.slice(0, settings.wordsPerDay);

    set({ todayWords });
  },

  // 新增日記
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      diaryEntries: [newEntry, ...state.diaryEntries],
      todayDiary: newEntry,
      todayDiaryDone: true,
    }));

    get().calculateTodayProgress();
    get().saveData();
  },

  // 更新設定
  updateSettings: (newSettings: Partial<UserSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));

    // 如果改了每日單字數,重新計算今日單字
    if (newSettings.wordsPerDay) {
      get().calculateTodayWords();
    }

    get().saveData();
  },

  // 重置所有資料
  resetAllData: () => {
    set({
      words: wordsN3Data.map((w) => ({
        ...w,
        lastReviewedAt: undefined,
        flagged: false,
      })) as Word[],
      todayWords: [],
      diaryEntries: [],
      todayDiary: null,
      todayDiaryDone: false,
      settings: defaultSettings,
      todayProgress: {
        todayWordCount: 0,
        doneWordCount: 0,
        diaryDone: false,
      },
    });

    AsyncStorage.clear();
    get().calculateTodayWords();
  },

  // 計算今日進度
  calculateTodayProgress: () => {
    const { todayWords, todayDiaryDone } = get();
    const today = new Date().toISOString().split('T')[0];

    // 只有今天複習過且熟悉度 >= 1 才算完成
    const doneWordCount = todayWords.filter((word) => {
      if (!word.lastReviewedAt) return false;
      const reviewedToday = word.lastReviewedAt.startsWith(today);
      return reviewedToday && word.familiarity >= 1;
    }).length;

    set({
      todayProgress: {
        todayWordCount: todayWords.length,
        doneWordCount,
        diaryDone: todayDiaryDone,
      },
    });
  },
}));
