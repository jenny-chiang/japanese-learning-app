import { Word, DiaryEntry, UserSettings, LearningStats, Achievement, FamiliarityLevel } from '../src/types';

export const mockWords: Word[] = [
  {
    id: '1',
    level: 'N3',
    kanji: '学校',
    kana: 'がっこう',
    meaning: '學校',
    exampleJa: '私は毎日学校に行きます。',
    exampleTranslation: '我每天去學校。',
    familiarity: FamiliarityLevel.DontKnow,
    flagged: false,
  },
  {
    id: '2',
    level: 'N3',
    kanji: '先生',
    kana: 'せんせい',
    meaning: '老師',
    exampleJa: '田中先生は英語の先生です。',
    exampleTranslation: '田中老師是英文老師。',
    familiarity: FamiliarityLevel.Know,
    flagged: false,
  },
  {
    id: '3',
    level: 'N3',
    kanji: '勉強',
    kana: 'べんきょう',
    meaning: '學習',
    exampleJa: '毎日日本語を勉強します。',
    exampleTranslation: '每天學習日文。',
    familiarity: FamiliarityLevel.VeryFamiliar,
    flagged: true,
  },
];

export const mockDiaryEntry: DiaryEntry = {
  id: '1',
  createdAt: '2026-01-21T10:00:00.000Z',
  original: '今日は学校に行きました。先生と話しました。',
  corrected: '今日は学校に行きました。先生とお話ししました。',
  chineseSummary: '今天去了學校，和老師聊天。',
  explanations: ['「話す」在對尊敬的人使用時應使用「お話しする」'],
  keyWords: [
    { word: '学校', meaning: '學校' },
    { word: '先生', meaning: '老師' },
  ],
  grammarPoints: [
    {
      pattern: 'に行く',
      meaning: '去（某地）',
      example: '学校に行く',
      exampleTranslation: '去學校',
    },
  ],
  advancedWords: [
    {
      word: '話し合う',
      level: 'N2',
      meaning: '討論、商談',
      example: '問題について話し合う',
      exampleTranslation: '關於問題進行討論',
    },
  ],
  advancedGrammar: [
    {
      pattern: '〜について',
      meaning: '關於〜',
      example: '日本の文化について勉強する',
      exampleTranslation: '學習關於日本的文化',
    },
  ],
  upgradedVersion: '本日は学校へ参りました。先生とお話し申し上げました。',
};

export const mockSettings: UserSettings = {
  mainLevel: 'N3',
  wordsPerDay: 10,
  reminderTime: '21:30',
  notificationsEnabled: true,
  examDate: '2026-07-05',
  language: 'zh',
  themeMode: 'system',
};

export const mockStats: LearningStats = {
  currentStreak: 5,
  longestStreak: 10,
  totalDays: 20,
  lastActiveDate: '2026-01-21',
  dailyHistory: {
    '2026-01-21': {
      wordsLearned: 10,
      diaryWritten: true,
      completed: true,
      studyDuration: 30,
    },
    '2026-01-20': {
      wordsLearned: 10,
      diaryWritten: true,
      completed: true,
      studyDuration: 25,
    },
  },
};

export const mockAchievements: Achievement[] = [
  {
    id: 'streak-3',
    title: '初心者',
    description: '連續學習 3 天',
    icon: '🌱',
    requirement: 3,
    unlockedAt: '2026-01-19T10:00:00.000Z',
  },
  {
    id: 'streak-7',
    title: '持續者',
    description: '連續學習 7 天',
    icon: '🔥',
    requirement: 7,
    unlockedAt: undefined,
  },
];
