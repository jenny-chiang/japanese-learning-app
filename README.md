# 日文學習 App 📚

一個幫助 JLPT 考生養成每日學習習慣的日文學習 App。

## 🎯 App 定位

### 目標
一個會每日提醒學習的日文學習 App:
- JLPT 單字複習
- 日文日記修正
- 每日提醒

### 關鍵特色
- **行為面**: 習慣養成(每日小量)
- **學習面**: 單字 + 句子 + 文法

## 🚀 開始使用

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm start
# 或
npx expo start
```

### 執行測試
```bash
# 執行所有測試
npm test

# 監聽模式
npm run test:watch

# 生成覆蓋率報告
npm run test:coverage
```

詳細測試說明請參考：
- [測試文檔](./TESTING.md) - 完整的測試指南

## 📁 專案結構

```
japanese-learning-app/
├── app/                      # Expo Router 頁面
│   ├── (tabs)/              # Tab Navigation
│   ├── _layout.tsx          # Root Layout
│   ├── index.tsx            # 今天頁面
│   ├── words.tsx            # 單字頁面
│   ├── stats.tsx            # 統計頁面
│   ├── diary.tsx            # 日記頁面
│   └── settings.tsx         # 設定頁面
├── src/
│   ├── store/
│   │   └── useAppStore.ts   # Zustand 全域狀態管理
│   ├── types/
│   │   └── index.ts         # TypeScript 型別定義
│   ├── constants/
│   │   └── colors.ts        # 顏色常數與主題定義
│   ├── contexts/
│   │   └── ThemeContext.tsx # 主題管理 Context
│   ├── services/
│   │   ├── diaryApi.ts      # AI 日記批改服務
│   │   ├── notificationService.ts  # 推播通知服務
│   │   ├── secureStorage.ts # 安全儲存服務 (敏感資料)
│   │   └── ttsService.ts    # 日文 TTS 發音服務
│   ├── i18n/
│   │   ├── translations.ts  # 翻譯資源
│   │   └── i18n.config.ts   # i18next 配置
│   ├── components/          # 共用元件
│   │   └── diary/           # 日記相關元件
│   │       ├── DiaryEditor.tsx
│   │       ├── DiaryHistory.tsx
│   │       └── DiaryResult.tsx
│   ├── hooks/               # 自訂 Hooks (待擴充)
│   └── utils/               # 工具函式 (待擴充)
├── assets/
│   └── data/
│       ├── words-n5.json    # N5 單字資料 (100個)
│       ├── words-n4.json    # N4 單字資料 (100個)
│       ├── words-n3.json    # N3 單字資料 (100個)
│       ├── words-n2.json    # N2 單字資料 (50個)
│       └── words-n1.json    # N1 單字資料 (50個)
├── __tests__/               # 測試檔案
│   ├── basic.test.ts        # 基礎環境測試 (7 tests)
│   └── services/            # 服務層測試
│       ├── secureStorage.test.ts      # (4 tests)
│       ├── ttsService.test.ts         # (4 tests)
│       ├── notificationService.test.ts # (2 tests)
│       └── diaryApi.test.ts           # (2 tests)
├── __mocks__/               # Mock 資料
│   └── mockData.ts
├── jest.config.js           # Jest 配置
├── jest.setup.js            # Jest 設定檔
├── TESTING.md               # 測試文檔
└── package.json
```

## 🛠 技術棧

- **Framework**: Expo + React Native (Managed Workflow)
- **語言**: TypeScript
- **Navigation**: Expo Router (File-based routing)
- **狀態管理**: Zustand + AsyncStorage 持久化
- **主題系統**: React Context + 動態顏色
- **本機儲存**: @react-native-async-storage/async-storage
- **安全儲存**: expo-secure-store (用於敏感資料如 API Key)
- **國際化**: i18next + react-i18next
- **AI 服務**: Google Generative AI (@google/generative-ai)
- **圖表**: react-native-gifted-charts
- **通知**: expo-notifications
- **日期選擇**: @react-native-community/datetimepicker
- **語音合成**: expo-speech (日文 TTS)
- **UI Icons**: @expo/vector-icons (Ionicons)

## 📋 資料模型

### Word (單字)
```typescript
{
  id: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  kanji: string;
  kana: string;
  meaning: string;
  exampleJa?: string;
  exampleTranslation?: string;
  familiarity: 0|1|2|3;
  lastReviewedAt?: string;
  flagged?: boolean;
}
```

### DiaryEntry (日記)
```typescript
{
  id: string;
  createdAt: string;
  original: string;
  corrected?: string;
  chineseSummary?: string;          // 中文重述
  explanations?: string[];
  vocabIds?: string[];
  keyWords?: KeyWord[];             // 關鍵單字
  grammarPoints?: GrammarPoint[];   // 文法點（含例句）
  advancedWords?: AdvancedWord[];   // JLPT+1 進階單字
  advancedGrammar?: GrammarPoint[]; // JLPT+1 進階文法
  upgradedVersion?: string;         // JLPT+1 升級版
}

// 關鍵單字
type KeyWord = {
  word: string;
  meaning: string;
};

// 進階單字
type AdvancedWord = {
  word: string;
  level: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
};

// 文法點
type GrammarPoint = {
  pattern: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
};
```

### UserSettings (使用者設定)
```typescript
{
  mainLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  wordsPerDay: number;
  reminderTime?: string;
  notificationsEnabled: boolean;
  examDate?: string;
  language: 'zh' | 'en';
  // 注意：geminiApiKey 已改用 expo-secure-store 安全儲存
  // 不再存放在 AsyncStorage 中，而是使用設備的 Keychain/Keystore
}
```

export type DailyStats = {
  wordsLearned: number;
  diaryWritten: boolean;
  completed: boolean;
  studyDuration: number; // 學習時長（分鐘）
};

export type LearningStats = {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastActiveDate?: string;
  dailyHistory: {
    [date: string]: DailyStats;
  };
}
```

### Achievement (成就)
```typescript
{
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  unlockedAt?: string;
}
```

## 🎯 開發優先序與未來規劃

### Phase 1: MVP ✅ (已完成)
- [x] 基本導航與頁面
- [x] 單字列表與練習
- [x] 日記撰寫與 AI 批改
- [x] 本機資料儲存
- [x] 設定頁面

### Phase 2: 可用版本 ✅ (已完成)
- [x] SRS 演算法
- [x] 串接 Google Gemini API
- [x] 推播通知實作
- [x] 日期時間選擇器

### Phase 3: 完整版本 ✅ (已完成)
- [x] 考試倒數計時器
- [x] 連續打卡天數追蹤
- [x] 成就徽章系統
- [x] 錯題本功能
- [x] 日記單字提取
- [x] 多國語系支援

### Phase 4: 進階體驗 ✅ (已完成)
- [x] 學習統計圖表
  - 每日學習時長自動追蹤
  - 週/月學習趨勢圖表
  - 單字熟悉度分布圖
  - 整體統計數據

- [x] **用戶自訂 API Key**
  - 支援用戶使用自己的 Gemini API Key
  - 內建 API Key 驗證功能
  - 避免共用配額限制
  - 一鍵設定與移除

- [x] **進階日記批改系統**
  - 智能錯誤檢查（只標示真正錯誤）
  - 中文內容重述（確認理解正確）
  - 關鍵單字整理
  - 文法點整理（含例句）
  - JLPT+1 進階單字推薦
  - JLPT+1 進階文法教學
  - JLPT+1 升級版範文

- [x] **智能單字提取**
  - 同時提取當前級別與進階級別單字
  - 自動去重機制
  - 每次提取 5-8 個精選單字
  - 包含例句與中文翻譯

### Phase 5: 內容擴充 ✅ (已完成)

- [x] **深色模式** ✅
  - 淺色/深色/跟隨系統
  - 完整主題系統
  - 動態顏色切換
  - Settings 頁面設定

- [x] **單字發音功能** ✅
  - 日文 TTS 發音
  - 支援線上播放
  - 單字卡片上一鍵播放
  - 單字列表中快速發音

### Phase 6: 內容擴充 ✅ (已完成)
- [x] **更多 JLPT 單字資料**
  - N5: 100 個基礎單字 (學校、家人、日常生活)
  - N4: 100 個中級單字 (抽象概念、動詞變化)
  - N3: 100 個進階單字 (商務、生活應用)
  - N2: 50 個高級單字 (學術、專業用語)
  - N1: 50 個專精單字 (正式場合、文學用語)
  - 總計 400+ 個 JLPT 單字

### Phase 7: 內容擴充 (規劃中)
- [ ] 更多 N2/N1 單字庫 (擴充至 100+ 個)
- [ ] 文法練習功能
- [ ] 聽力練習

### 長期規劃
- [ ] 雲端同步 (Firebase/Supabase)
- [ ] 多裝置資料同步
- [ ] 社群功能 (學習小組)
- [ ] 單字卡片分享

## 💡 使用提示

1. **今天頁面** - 每天打開 App 的第一站,快速了解今日任務
2. **單字練習** - 點擊「開始練習」進入卡片模式,按「顯示意思」查看答案
3. **統計頁面** - 查看學習時長、單字進度與學習趨勢圖表
4. **日記撰寫** - 用日文寫下今天的事情,AI 會提供詳細批改與進階學習建議
5. **設定調整** - 根據自己的步調調整每日單字數量，並可設定個人 API Key

## 🔑 API Key 設定指南

### 方式一：使用環境變數（開發用）
在專案根目錄建立 `.env` 檔案:
```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 方式二：用戶自訂 API Key（推薦）⭐
1. 前往 [Google AI Studio](https://aistudio.google.com/apikey) 取得免費 API Key
2. 在 App 的「設定」頁面輸入 API Key
3. 點擊「驗證並儲存」
4. 驗證成功後，API Key 會被安全加密儲存到設備的 Keychain (iOS) 或 Keystore (Android)

**優點：**
- ✅ 避免共用配額限制
- ✅ Google 提供每日免費額度
- ✅ 更穩定的服務品質
- ✅ 適合 App 上架後使用
- 🔒 **使用設備原生加密儲存，安全性極高**
- 🔒 **API Key 不會存在 AsyncStorage，而是使用 expo-secure-store**

### API 使用說明
- **Google Gemini**
  - 申請 API Key: https://aistudio.google.com/apikey
  - 免費額度：每日 1500 次請求
  - 用戶可在「設定」頁面輸入自己的 API Key

## ⭐ 主要更新記錄

### v5.0 - 完整 JLPT 單字庫 (2026-01-08) 📚
- 📖 大幅擴充單字資料
  - N5: 100 個基礎單字（學校、家人、日常生活）
  - N4: 100 個中級單字（抽象概念、動詞變化）
  - N3: 100 個進階單字（商務、生活應用）
  - N2: 50 個高級單字（學術、專業用語）
  - N1: 50 個專精單字（正式場合、文學用語）
- 🎯 總計 400+ 個精選 JLPT 單字
- 🔄 自動載入所有級別單字
- 📝 每個單字包含：
  - 漢字、假名、中文意思
  - 日文例句與中文翻譯
  - 熟悉度等級追蹤

### v4.3 - 深色模式 (2025-12-30) 🌙
- 🎨 完整主題系統
  - 支援淺色/深色/跟隨系統三種模式
  - 使用 ThemeProvider 統一管理
  - 動態顏色切換，即時生效
  - 主題設定自動持久化
- 🌈 精心設計的深色主題配色
  - 護眼的深色背景
  - 優化的文字對比度
  - 適配所有 UI 元件
- ⚙️ Settings 頁面新增主題選項
  - 三種主題模式可選
  - Emoji 圖示區分
  - 即時預覽效果

### v4.2 - 單字發音功能 (2025-12-30) ✨
- 🔊 日文 TTS 發音系統
  - 使用 expo-speech 實現日文語音合成
  - 支援單字列表快速發音
  - 練習卡片中一鍵播放
  - 優化的語速與音調設定
  - 智能語音選擇（iOS 優先使用 Kyoko）
- 🎯 發音服務模組 (ttsService)
  - 統一管理 TTS 功能
  - 可自訂語速、音調、音量
  - 支援檢查播放狀態

### v4.1 - 安全性強化 (2025-12-26)
- 🔒 API Key 改用 expo-secure-store 安全儲存
  - 使用設備的 Keychain (iOS) 和 Keystore (Android)
  - 原生級別的加密保護
  - 不再使用 AsyncStorage 儲存敏感資料
- 🛡️ 新增 SecureStorage 服務模組
  - 統一管理敏感資料儲存
  - 提供安全的讀取、儲存、刪除 API

### v4.0 - 進階學習系統 (2025-12-22)
- 🔑 支援用戶使用自己的 Gemini API Key
- 📚 全新 6 大日記批改規則
  - 智能錯誤檢查（只標示真正錯誤）
  - 中文重述（確認理解正確）
  - 關鍵單字整理
  - 文法點整理（含例句）
  - JLPT+1 進階單字推薦
  - JLPT+1 進階文法教學
  - JLPT+1 升級版範文示範
- 🎯 智能單字提取
  - 同時提取當前級別與進階級別單字
  - 自動去重機制
  - 每次提取 5-8 個精選單字
- 🎨 全新批改結果 UI
  - 分區清晰的資訊呈現
  - 彩色卡片設計
  - 易讀的排版

### v3.0 - 學習統計與多語系 (2025-12)
- 📊 學習統計圖表
- 🌍 多國語系支援（繁中/英文）
- ⏱️ 學習時長自動追蹤

### v2.0 - 習慣養成系統 (2025-12)
- 🎯 考試倒數計時器
- 🔥 連續打卡天數追蹤
- 🏆 成就徽章系統
- 📖 錯題本功能
