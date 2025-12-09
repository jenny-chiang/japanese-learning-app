export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type Word = {
  id: string;
  level: JLPTLevel;
  kanji: string;
  kana: string;
  meaningZh: string;
  exampleJa?: string;
  exampleZh?: string;
  familiarity: 0 | 1 | 2 | 3;   // 0=完全不熟, 3=很熟
  lastReviewedAt?: string;      // ISO date
  flagged?: boolean;            // 特別難的
};

export type DiaryEntry = {
  id: string;
  createdAt: string;
  original: string;
  corrected?: string;
  explanations?: string[];   // 錯誤/不自然說明
  vocabIds?: string[];       // 這篇包含的單字 ID
  grammarPoints?: string[];  // 文法 tag
};

export type UserSettings = {
  mainLevel: JLPTLevel;      // 目前主力：N3 or N2
  wordsPerDay: number;       // 每日目標單字數
  reminderTime?: string;     // '21:30' 之類
  notificationsEnabled: boolean;
};

export type TodayProgress = {
  todayWordCount: number;
  doneWordCount: number;
  diaryDone: boolean;
};
