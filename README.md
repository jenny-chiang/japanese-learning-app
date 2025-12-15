# 日文學習 App 📚

一個幫助 JLPT 考生養成每日學習習慣的日文學習 App。

## 🎯 App 定位

### 目標
一個會每日提醒學習的日文學習 App:
- JLPT 單字複習
- 日文日記修正
- 每日提醒

### 核心對象
- 主要使用者: JLPT 考生
- 次要對象: 同溫層考生

### 關鍵特色
- **行為面**: 習慣養成(每日小量)
- **學習面**: 單字 + 句子 + 文法
- **體驗面**: 輕量、可愛、不恐怖、不「我一定要超拼命」那種

## ✨ 功能特色

### MVP 第一階段 (已完成 ✅)
- ✅ **四個主要頁面**
  - 🏠 今天 (Today) - 顯示今日學習進度與任務
  - 📚 單字 (Words) - N3 單字複習與練習
  - ✍️ 日記 (Diary) - 日文日記撰寫與 AI 批改
  - ⚙️ 設定 (Settings) - 個人化學習設定

- ✅ **單字功能**
  - 今日單字列表
  - 單字卡片練習模式
  - 熟悉度分級 (0-3)
  - 收藏功能
  - 自動計算今日待複習單字

- ✅ **日記功能**
  - 日文日記撰寫
  - AI 智慧批改 (Google Gemini)
  - 繁體中文詳細說明
  - 文法重點標示
  - 日記歷史記錄查看
  - 返回編輯功能

- ✅ **設定功能**
  - JLPT 等級選擇 (N5/N4/N3/N2/N1)
  - 每日單字數量設定
  - 每日提醒開關

### 第二階段 (已完成 ✅)
- ✅ **AI 整合**
  - Google Gemini API (gemini-1.5-flash)
  - 繁體中文回應
  - Markdown 格式清理

- ✅ **資料持久化**
  - AsyncStorage 本機儲存
  - 單字學習記錄保存
  - 日記歷史保存
  - 設定自動同步

- ✅ **程式碼優化**
  - 集中化顏色常數管理
  - TypeScript 型別定義完善

### 🌈 第三階段 (已完成 ✅)
- ✅ **考試倒數計時器**
  - 首頁顯示距離考試還有幾天
  - Settings 可設定考試日期
  - 自動計算剩餘天數

- ✅ **連續打卡天數追蹤**
  - 記錄每日學習完成狀態
  - 首頁顯示當前連續天數
  - 追蹤最長連續記錄
  - 統計總學習天數

- ✅ **成就徽章系統**
- ✅ **多國語系支援**
  - 支援繁體中文與英文介面
  - 使用 react-i18next 專業國際化方案
  - 語言選擇自動持久化
  - 即時切換無需重啟

  - 四個成就等級 (3/7/14/30 天)
  - 達成後自動解鎖
  - Settings 頁面顯示所有成就
  - 視覺化顯示已解鎖/未解鎖狀態

- ✅ **錯題本功能**
  - 自動收集熟悉度 0 的單字
  - Words 頁面新增「錯題本」分頁
  - 可針對錯題加強練習
  - 掌握後自動移出錯題本

- ✅ **日記單字提取**
  - 一鍵從日記中提取生字
  - AI 自動識別 N3/N2 等級單字
  - 自動加入單字庫
  - 避免重複單字

- ✅ **多國語系支援**
  - 支援繁體中文與英文介面
  - 使用 react-i18next 專業國際化方案
  - 語言選擇自動持久化
  - 即時切換無需重啟

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

## 📁 專案結構

```
japanese-learning-app/
├── app/                      # Expo Router 頁面
│   ├── (tabs)/              # Tab Navigation
│   ├── _layout.tsx          # Root Layout
│   ├── index.tsx            # 今天頁面
│   ├── words.tsx            # 單字頁面
│   ├── diary.tsx            # 日記頁面
│   └── settings.tsx         # 設定頁面
├── src/
│   ├── store/
│   │   └── useAppStore.ts   # Zustand 全域狀態管理
│   ├── types/
│   │   └── index.ts         # TypeScript 型別定義
│   ├── constants/
│   │   └── colors.ts        # 顏色常數定義
│   ├── services/
│   │   ├── diaryApi.ts      # AI 日記批改服務
│   │   └── notificationService.ts  # 推播通知服務
│   ├── i18n/
│   │   ├── translations.ts  # 翻譯資源
│   │   └── i18n.config.ts   # i18next 配置
│   ├── components/          # 共用元件 (待擴充)
│   ├── hooks/               # 自訂 Hooks (待擴充)
│   └── utils/               # 工具函式 (待擴充)
├── assets/
│   └── data/
│       └── words-n3.json    # N3 單字假資料
└── package.json
```

## 🛠 技術棧

- **Framework**: Expo + React Native (Managed Workflow)
- **語言**: TypeScript
- **Navigation**: Expo Router (File-based routing)
- **狀態管理**: Zustand + AsyncStorage 持久化
- **本機儲存**: @react-native-async-storage/async-storage
- **國際化**: i18next + react-i18next
- **AI 服務**: Google Generative AI (@google/generative-ai)
- **通知**: expo-notifications
- **日期選擇**: @react-native-community/datetimepicker
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
  explanations?: string[];
  vocabIds?: string[];
  grammarPoints?: string[];
}
```

### UserSettings (使用者設定)
```typescript
{
  mainLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  wordsPerDay: number;
  reminderTime?: string;
  notificationsEnabled: boolean;
  examDate?: string;
}
```

### LearningStats (學習統計)
```typescript
{
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastActiveDate?: string;
  dailyHistory: {
    [date: string]: {
      wordsLearned: number;
      diaryWritten: boolean;
      completed: boolean;
    };
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

### Phase 4: 進階體驗 (規劃中)
- [ ] **學習統計圖表**
  - 每日學習時長統計
  - 單字熟悉度分布圖
  - 過去 7/30 天學習趨勢
  - 視覺化學習報告

- [ ] **深色模式**
  - 淺色/深色/跟隨系統
  - 所有頁面適配
  - 護眼設計

- [ ] **單字發音功能**
  - 日文 TTS 發音
  - 支援線上/離線播放
  - 單字卡片上一鍵播放

### Phase 5: 內容擴充*
  - 日文 TTS 發音
  - 支援線上/離線播放
  - 單字卡片上一鍵播放

### 第五階段 (內容擴充)
- [ ] 更多 JLPT 單字資料 (目前僅 15 個 N3 單字)
- [ ] N2/N1 進階單字庫
- [ ] 文法練習功能
- [ ] 聽力練習

### 長期規劃
- [ ] 雲端同步 (Firebase/Supabase)
- [ ] 多裝置資料同步
- [ ] 社群功能 (學習小組)
- [ ] 單字卡片分享

## 🎨 設計理念

- 🌱 **輕量**: 每天一點點,不給壓力
- 🎯 **習慣養成**: 專注於建立持續學習的習慣
- 😊 **友善**: 可愛的 UI,不恐怖的學習體驗
- 📊 **可視化進度**: 清楚看到自己的進步

## 💡 使用提示

1. **今天頁面** - 每天打開 App 的第一站,快速了解今日任務
2. **單字練習** - 點擊「開始練習」進入卡片模式,按「顯示意思」查看答案
3. **日記撰寫** - 用日文寫下今天的事情,不用擔心錯誤
4. **設定調整** - 根據自己的步調調整每日單字數量

## 📝 開發筆記

目前進度 (第三階段完成):
- ✅ 所有資料都儲存在本機 (AsyncStorage)
- ✅ 日記批改功能已串接 Google Gemini API
- ✅ AI 回應使用繁體中文說明
- ✅ 日記歷史記錄功能
- ✅ SRS 間隔重複演算法
- ✅ 每日推播通知功能
- ✅ 從日記提取單字功能
- ✅ 包含 15 個 N3 單字作為測試資料
- ⏳ 單字庫需擴充更多 JLPT 詞彙

### 環境變數設定
在專案根目錄建立 `.env` 檔案:
```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### API 使用說明
- **Google Gemini** (gemini-1.5-flash): 免費額度 1500 次/天,完全免費使用
- 申請 API Key: https://aistudio.google.com/app/apikey
