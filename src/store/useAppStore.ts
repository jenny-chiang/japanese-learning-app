import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Word,
  DiaryEntry,
  UserSettings,
  TodayProgress,
  Achievement,
  LearningStats,
  DailyStats,
} from '../types';
import wordsN3Data from '../../assets/data/words-n3.json';

interface AppState {
  // 單字
  words: Word[];
  todayWords: Word[];
  wrongWords: Word[]; // 錯題本

  // 日記
  diaryEntries: DiaryEntry[];
  todayDiary: DiaryEntry | null;
  todayDiaryDone: boolean;

  // 設定
  settings: UserSettings;

  // 今日進度
  todayProgress: TodayProgress;

  // 學習統計
  stats: LearningStats;

  // 成就
  achievements: Achievement[];

  // Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;

  // 單字相關
  updateWordFamiliarity: (wordId: string, familiarity: FamiliarityLevel) => void;
  flagWord: (wordId: string, flagged: boolean) => void;
  calculateTodayWords: () => void;
  addWordsToLibrary: (words: Word[]) => void; // 新增單字到單字庫
  addToWrongWords: (wordId: string) => void; // 加入錯題本
  removeFromWrongWords: (wordId: string) => void; // 從錯題本移除

  // 日記相關
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  extractWordsFromDiary: (diaryId: string, words: Word[]) => void; // 從日記提取單字

  // 設定相關
  updateSettings: (settings: Partial<UserSettings>) => void;

  // 統計相關
  updateDailyStats: () => void; // 更新每日統計
  calculateStreak: () => void; // 計算連續天數
  checkAchievements: () => void; // 檢查成就
  recordStudyTime: (minutes: number) => void; // 記錄學習時長
  getWeeklyStudyTrend: () => { date: string; duration: number; words: number }[]; // 獲取週學習趨勢
  getMonthlyStudyTrend: () => { date: string; duration: number; words: number }[]; // 獲取月學習趨勢
  getWordsFamiliarityDistribution: () => { level: number; count: number }[]; // 獲取單字熟悉度分布

  // 其他
  resetAllData: () => void;
  calculateTodayProgress: () => void;
  getDaysUntilExam: () => number | null; // 考試倒數天數
}

const defaultSettings: UserSettings = {
  mainLevel: 'N3',
  wordsPerDay: 10,
  reminderTime: '21:30',
  notificationsEnabled: false,
  language: 'zh',
};

const defaultStats: LearningStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalDays: 0,
  dailyHistory: {},
};

const defaultAchievements: Achievement[] = [
  {
    id: 'streak-3',
    title: '初心者',
    description: '連續學習 3 天',
    icon: '🌱',
    requirement: 3,
  },
  {
    id: 'streak-7',
    title: '堅持者',
    description: '連續學習 7 天',
    icon: '🔥',
    requirement: 7,
  },
  {
    id: 'streak-14',
    title: '決心者',
    description: '連續學習 14 天',
    icon: '⭐',
    requirement: 14,
  },
  {
    id: 'streak-30',
    title: '大師',
    description: '連續學習 30 天',
    icon: '👑',
    requirement: 30,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  // 初始狀態
  words: [],
  todayWords: [],
  wrongWords: [],
  diaryEntries: [],
  todayDiary: null,
  todayDiaryDone: false,
  settings: defaultSettings,
  todayProgress: {
    todayWordCount: 0,
    doneWordCount: 0,
    diaryDone: false,
  },
  stats: defaultStats,
  achievements: defaultAchievements,

  // 載入資料
  loadData: async () => {
    try {
      // 載入單字
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

      // 載入錯題本
      const storedWrongWords = await AsyncStorage.getItem('wrongWords');
      const wrongWords: Word[] = storedWrongWords
        ? JSON.parse(storedWrongWords)
        : [];

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

      // 載入統計
      const storedStats = await AsyncStorage.getItem('stats');
      const stats: LearningStats = storedStats
        ? JSON.parse(storedStats)
        : defaultStats;

      // 載入成就
      const storedAchievements = await AsyncStorage.getItem('achievements');
      const achievements: Achievement[] = storedAchievements
        ? JSON.parse(storedAchievements)
        : defaultAchievements;

      // 檢查今天的日記
      const today = new Date().toISOString().split('T')[0];
      const todayDiary = diaryEntries.find((entry) =>
        entry.createdAt.startsWith(today)
      );

      set({
        words,
        wrongWords,
        diaryEntries,
        settings,
        stats,
        achievements,
        todayDiary: todayDiary || null,
        todayDiaryDone: !!todayDiary,
      });

      // 計算今日單字和進度
      get().calculateTodayWords();
      get().calculateTodayProgress();
      get().calculateStreak();
      get().updateDailyStats();
    } catch (error) {
      console.error('載入資料失敗:', error);
    }
  },

  // 儲存資料
  saveData: async () => {
    try {
      const { words, wrongWords, diaryEntries, settings, stats, achievements } = get();
      await AsyncStorage.setItem('words', JSON.stringify(words));
      await AsyncStorage.setItem('wrongWords', JSON.stringify(wrongWords));
      await AsyncStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
      await AsyncStorage.setItem('stats', JSON.stringify(stats));
      await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('儲存資料失敗:', error);
    }
  },

  // 更新單字熟悉度
  updateWordFamiliarity: (wordId: string, familiarity: FamiliarityLevel) => {
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

    // 如果選擇「完全不熟」,加入錯題本
    if (familiarity === FamiliarityLevel.DontKnow) {
      get().addToWrongWords(wordId);
    } else if (familiarity >= FamiliarityLevel.Know) {
      // 如果掌握了 (熟悉度 >= 2),從錯題本移除
      get().removeFromWrongWords(wordId);
    }

    get().calculateTodayProgress();
    get().updateDailyStats();
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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // SRS 間隔重複演算法
    // 根據熟悉度決定下次複習間隔 (天數)
    const getReviewInterval = (familiarity: FamiliarityLevel): number => {
      switch (familiarity) {
        case FamiliarityLevel.DontKnow: return 0;  // 完全不會 - 馬上複習
        case FamiliarityLevel.SoSo: return 1;  // 不熟 - 1天後
        case FamiliarityLevel.Know: return 3;  // 還行 - 3天後
        case FamiliarityLevel.VeryFamiliar: return 7;  // 很熟 - 7天後
        default: return 0;
      }
    };

    // 判斷單字是否該複習
    const shouldReview = (word: Word): boolean => {
      if (!word.lastReviewedAt) return true; // 從未複習過

      const lastReview = new Date(word.lastReviewedAt);
      const daysSinceReview = Math.floor((today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
      const interval = getReviewInterval(word.familiarity);

      return daysSinceReview >= interval;
    };

    // 篩選該複習的單字
    const wordsToReview = words.filter(shouldReview);

    // 排序: 優先順序 = 熟悉度低 > 很久沒複習
    const sortedWords = [...wordsToReview].sort((a, b) => {
      // 先按熟悉度排序 (越不熟越優先)
      if (a.familiarity !== b.familiarity) {
        return a.familiarity - b.familiarity;
      }

      // 再按上次複習時間排序 (越久沒複習越優先)
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
    get().updateDailyStats();
    get().saveData();
  },

  // 從日記提取單字
  extractWordsFromDiary: (diaryId: string, words: Word[]) => {
    // 更新日記的 vocabIds
    set((state) => ({
      diaryEntries: state.diaryEntries.map((entry) =>
        entry.id === diaryId
          ? { ...entry, vocabIds: words.map((w) => w.id) }
          : entry
      ),
    }));

    // 將單字加入單字庫
    get().addWordsToLibrary(words);
  },

  // 加入錯題本
  addToWrongWords: (wordId: string) => {
    const { words, wrongWords } = get();
    const word = words.find((w) => w.id === wordId);

    if (!word) return;

    // 檢查是否已在錯題本中
    const alreadyExists = wrongWords.some((w) => w.id === wordId);
    if (alreadyExists) return;

    set((state) => ({
      wrongWords: [...state.wrongWords, word],
    }));

    get().saveData();
  },

  // 從錯題本移除
  removeFromWrongWords: (wordId: string) => {
    set((state) => ({
      wrongWords: state.wrongWords.filter((w) => w.id !== wordId),
    }));

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
      wrongWords: [],
      diaryEntries: [],
      todayDiary: null,
      todayDiaryDone: false,
      settings: defaultSettings,
      todayProgress: {
        todayWordCount: 0,
        doneWordCount: 0,
        diaryDone: false,
      },
      stats: defaultStats,
      achievements: defaultAchievements,
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
      return reviewedToday && word.familiarity >= FamiliarityLevel.SoSo;
    }).length;

    set({
      todayProgress: {
        todayWordCount: todayWords.length,
        doneWordCount,
        diaryDone: todayDiaryDone,
      },
    });
  },

  // 將單字加入單字庫
  addWordsToLibrary: (newWords: Word[]) => {
    set((state) => {
      // 過濾掉已存在的單字 (依漢字和假名判斷)
      const existingKeys = new Set(
        state.words.map(w => `${w.kanji}-${w.kana}`)
      );

      const uniqueNewWords = newWords.filter(
        w => !existingKeys.has(`${w.kanji}-${w.kana}`)
      );

      if (uniqueNewWords.length === 0) {
        return state;
      }

      return {
        words: [...state.words, ...uniqueNewWords],
      };
    });

    get().calculateTodayWords();
    get().saveData();
  },

  // 更新每日統計
  updateDailyStats: () => {
    const { todayProgress, stats } = get();
    const today = new Date().toISOString().split('T')[0];

    // 檢查今天是否完成任務
    const completed =
      todayProgress.doneWordCount >= todayProgress.todayWordCount &&
      todayProgress.diaryDone;

    // 更新每日歷史
    const newDailyHistory = { ...stats.dailyHistory };
    const existingDay = newDailyHistory[today] || {
      wordsLearned: 0,
      diaryWritten: false,
      completed: false,
      studyDuration: 0,
    };

    newDailyHistory[today] = {
      ...existingDay,
      wordsLearned: todayProgress.doneWordCount,
      diaryWritten: todayProgress.diaryDone,
      completed,
    };

    set((state) => ({
      stats: {
        ...state.stats,
        dailyHistory: newDailyHistory,
        lastActiveDate: today,
      },
    }));

    // 如果今天完成了,計算連續天數和檢查成就
    if (completed) {
      get().calculateStreak();
      get().checkAchievements();
    }

    get().saveData();
  },

  // 計算連續天數
  calculateStreak: () => {
    const { stats } = get();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = stats.longestStreak;
    let totalDays = 0;

    // 往回檢查連續天數
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = stats.dailyHistory[dateStr];

      if (dayData && dayData.completed) {
        currentStreak++;
        totalDays++;
      } else if (i > 0) {
        // 中斷了,停止計算 currentStreak
        break;
      }
    }

    // 計算總天數
    totalDays = Object.values(stats.dailyHistory).filter(
      (day) => day.completed
    ).length;

    // 更新最長連續天數
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    set((state) => ({
      stats: {
        ...state.stats,
        currentStreak,
        longestStreak,
        totalDays,
      },
    }));

    get().saveData();
  },

  // 檢查成就
  checkAchievements: () => {
    const { stats, achievements } = get();
    const now = new Date().toISOString();

    const updatedAchievements = achievements.map((achievement) => {
      // 如果已解鎖,不再檢查
      if (achievement.unlockedAt) return achievement;

      // 檢查是否達成條件
      if (stats.currentStreak >= achievement.requirement) {
        return {
          ...achievement,
          unlockedAt: now,
        };
      }

      return achievement;
    });

    set({ achievements: updatedAchievements });
    get().saveData();
  },

  // 計算考試倒數天數
  getDaysUntilExam: () => {
    const { settings } = get();
    if (!settings.examDate) return null;

    const today = new Date();
    const examDate = new Date(settings.examDate);

    // 計算相差天數
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },

  // 記錄學習時長
  recordStudyTime: (minutes: number) => {
    const { stats } = get();
    const today = new Date().toISOString().split('T')[0];

    const newDailyHistory = { ...stats.dailyHistory };
    const existingDay = newDailyHistory[today] || {
      wordsLearned: 0,
      diaryWritten: false,
      completed: false,
      studyDuration: 0,
    };

    newDailyHistory[today] = {
      ...existingDay,
      studyDuration: existingDay.studyDuration + minutes,
    };

    set((state) => ({
      stats: {
        ...state.stats,
        dailyHistory: newDailyHistory,
      },
    }));

    get().saveData();
  },

  // 獲取週學習趨勢（當週 - 週一到週日）
  getWeeklyStudyTrend: () => {
    const { stats } = get();
    const today = new Date();
    const trend: { date: string; duration: number; words: number }[] = [];

    // 獲取當週週一（0 = 週日, 1 = 週一, ..., 6 = 週六）
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1); // 週日特殊處理

    // 從週一開始
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + mondayOffset + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.dailyHistory[dateStr];

      trend.push({
        date: dateStr,
        duration: dayData?.studyDuration || 0,
        words: dayData?.wordsLearned || 0,
      });
    }

    return trend;
  },

  // 獲取月學習趨勢（當月 - 1 號到月底）
  getMonthlyStudyTrend: () => {
    const { stats } = get();
    const today = new Date();
    const trend: { date: string; duration: number; words: number }[] = [];

    // 獲取當月的第一天
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // 獲取當月有多少天
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let i = 0; i < lastDayOfMonth; i++) {
      const date = new Date(firstDayOfMonth);
      date.setDate(firstDayOfMonth.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.dailyHistory[dateStr];

      trend.push({
        date: dateStr,
        duration: dayData?.studyDuration || 0,
        words: dayData?.wordsLearned || 0,
      });
    }

    return trend;
  },

  // 獲取單字熟悉度分布
  getWordsFamiliarityDistribution: () => {
    const { words } = get();
    const distribution = [
      { level: 0, count: 0 },
      { level: 1, count: 0 },
      { level: 2, count: 0 },
      { level: 3, count: 0 },
    ];

    words.forEach((word) => {
      distribution[word.familiarity].count++;
    });

    return distribution;
  },
}));

