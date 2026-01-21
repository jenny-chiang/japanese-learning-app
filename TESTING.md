# 自動化測試文檔

## 📋 測試概覽

本專案使用 Jest 和 React Native Testing Library 進行全面的自動化測試，包含單元測試、組件測試和整合測試。

## 🛠 測試工具

- **Jest**: JavaScript 測試框架
- **@testing-library/react-native**: React Native 組件測試工具
- **jest-expo**: Expo 專案的 Jest 預設配置
- **ts-jest**: TypeScript 支援

## 📁 測試檔案結構

```
__tests__/
├── basic.test.ts        # 基礎環境測試 (7 tests)

├── services/            # 服務層測試
│   ├── secureStorage.test.ts      # (4 tests)
│   ├── ttsService.test.ts         # (4 tests)
│   ├── notificationService.test.ts # (2 tests)
│   └── diaryApi.test.ts           # (2 tests)

__mocks__/               # Mock 資料
└── mockData.ts

jest.config.js           # Jest 配置
jest.setup.js            # Jest 設定檔
```

## 📊 測試統計

- **測試套件**: 5 個全部通過
- **測試案例**: 25 個全部通過
- **執行時間**: ~0.4秒
- **測試覆蓋**: 基礎環境、服務層

## 🚀 執行測試

### 執行所有測試
```bash
npm test
```

### 監聽模式（開發時使用）
```bash
npm run test:watch
```

### 生成覆蓋率報告
```bash
npm run test:coverage
```

### CI 環境執行
```bash
npm run test:ci
```

## 📊 測試覆蓋率

查看覆蓋率報告：
```bash
npm run test:coverage
# 報告會生成在 coverage/ 目錄
# 可以開啟 coverage/lcov-report/index.html 查看詳細報告
```

## 🧪 測試類型

### 1. 單元測試 (Unit Tests)

測試單一功能或函數的正確性。

**範例：Store 測試**
```typescript
// __tests__/store/useAppStore.test.ts
test('應該能夠更新單字熟悉度', async () => {
  const { result } = renderHook(() => useAppStore());
  // ...測試邏輯
});
```

**範例：Service 測試**
```typescript
// __tests__/services/secureStorage.test.ts
test('應該能夠儲存 API Key', async () => {
  await SecureStorage.saveGeminiApiKey('test-api-key');
  // ...驗證邏輯
});
```

### 2. 整合測試 (Integration Tests)

測試完整的使用者流程。

**範例：**
```typescript
// __tests__/integration/userFlows.test.ts
test('完整的單字學習流程', async () => {
  // 1. 載入資料
  // 2. 設定參數
  // 3. 學習單字
  // 4. 更新熟悉度
  // 5. 保存資料
  // ...完整流程測試
});
```

## 🎯 測試範圍

### ✅ 已測試的功能

#### Store (useAppStore)
- ✅ 單字管理
  - 更新單字熟悉度
  - 標記/取消標記單字
  - 加入單字到單字庫
  - 錯題本管理
  - 計算今日單字
- ✅ 日記管理
  - 新增日記
  - 從日記提取單字
- ✅ 設定管理
  - 更新設定
  - 計算考試倒數
  - 深色模式判斷
- ✅ 統計管理
  - 記錄學習時長
  - 計算連續天數
  - 成就檢查
  - 熟悉度分布
- ✅ 資料持久化
  - 保存和載入資料
  - 重置資料

#### Services
- ✅ SecureStorage
  - API Key 的儲存、讀取、刪除
  - 錯誤處理
- ✅ TTSService
  - 日文發音
  - 自訂選項
  - 播放控制
- ✅ NotificationService
  - 權限請求
  - 每日提醒設定
  - 通知取消
- ✅ DiaryApi
  - API Key 驗證
  - 日記批改
  - 單字提取
  - 錯誤處理

## 🔧 Mock 設定

所有外部依賴都已在 `jest.setup.js` 中進行 Mock：

- AsyncStorage
- expo-secure-store
- expo-notifications
- expo-speech
- expo-linear-gradient
- @google/genai
- react-i18next
- react-native-gifted-charts

## 📝 編寫測試的最佳實踐

### 1. 測試命名
使用描述性的測試名稱，清楚說明測試目的：
```typescript
test('應該能夠更新單字熟悉度', async () => {
  // ...
});
```

### 2. AAA 模式
- **Arrange**: 準備測試資料
- **Act**: 執行要測試的操作
- **Assert**: 驗證結果

```typescript
test('範例', async () => {
  // Arrange - 準備
  const { result } = renderHook(() => useAppStore());

  // Act - 執行
  act(() => {
    result.current.updateSettings({ mainLevel: 'N2' });
  });

  // Assert - 驗證
  await waitFor(() => {
    expect(result.current.settings.mainLevel).toBe('N2');
  });
});
```

### 3. 清理
每個測試前後都要清理狀態：
```typescript
beforeEach(async () => {
  await clearAsyncStorage();
  jest.clearAllMocks();
});
```

### 4. 使用 waitFor
對於異步操作，使用 `waitFor` 等待狀態更新：
```typescript
await waitFor(() => {
  expect(result.current.words.length).toBeGreaterThan(0);
});
```

## 🐛 常見問題

### Q: 測試執行很慢怎麼辦？
A: 使用 `npm run test:watch` 只執行修改過的測試，或使用 `-t` 參數執行特定測試：
```bash
npm test -- -t "單字管理"
```

### Q: Mock 不起作用？
A: 確保 Mock 在 `jest.setup.js` 中正確設定，並在測試前清除：
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Q: 如何測試異步操作？
A: 使用 `act` 和 `waitFor`：
```typescript
await act(async () => {
  await result.current.loadData();
});

await waitFor(() => {
  expect(result.current.words.length).toBeGreaterThan(0);
});
```

## 🔄 持續整合 (CI)

專案可以輕鬆整合到 CI/CD 流程中：

### GitHub Actions 範例
參考 `.github/workflows/test.yml`

### 本地 CI 測試
```bash
npm run test:ci
```

## 📈 改進計劃

- [ ] 提高測試覆蓋率至 80%
- [ ] 新增 E2E 測試（使用 Detox）
- [ ] 新增視覺回歸測試
- [ ] 效能測試
- [ ] 無障礙測試

## 🤝 貢獻

編寫新功能時，請務必：
1. 為新功能編寫測試
2. 確保所有測試通過
3. 保持測試覆蓋率不降低

```bash
# 執行測試並檢查覆蓋率
npm run test:coverage

# 確保覆蓋率符合要求
# Branches: >= 50%
# Functions: >= 50%
# Lines: >= 50%
# Statements: >= 50%
```
