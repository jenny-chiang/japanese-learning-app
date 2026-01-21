---
name: code-review
description: Comprehensive code review for React Native and TypeScript projects. Triggered when user asks to review code, check code quality, find bugs, review this file, check for issues, analyze code, improve code, review PR, check for security issues, check for performance issues, or mentions code review.
---

# Code Review Skill

## Purpose
Perform thorough code reviews for React Native and TypeScript projects, ensuring code quality, security, performance, and adherence to best practices. Generate comprehensive review reports in Traditional Chinese and automatically fix issues when possible.

## Trigger Keywords
This skill is automatically triggered when user mentions:
- "review this code" / "review this file"
- "check this code" / "check this file"
- "code review" / "review PR"
- "find bugs" / "check for issues"
- "analyze code quality" / "improve code"
- "security review" / "performance review"
- "check for security issues" / "check for performance issues"

## When to Use
- User asks to review code or check a file
- User requests code quality analysis
- User wants to find bugs or issues
- User asks about security or performance
- User mentions reviewing changes or PR

## Review Process

### Step 0: Check Gemini CLI Installation (Optional)
**OPTIONAL CHECK**: Verify if Gemini CLI is installed for enhanced AI analysis.

1. **Check if Gemini CLI is available**:
   ```bash
   which gemini
   ```

2. **If Gemini CLI is NOT found**:
   - Log a note that Gemini analysis will be skipped
   - Continue with the review process using other tools

3. **If Gemini CLI is found**:
   - Log: "✅ Gemini CLI 已安裝，將使用 AI 分析..."
   - Proceed to use Gemini in Step 3

### Step 1: Understand the Context
1. Identify files to review (current file, PR changes, or specified files)
2. Read the file(s) completely to understand the purpose and logic
3. Check related files if needed (imports, dependencies, types)

### Step 2: Apply Best Practices Skills
**MUST EXECUTE**: Apply both `vercel-react-best-practices` and `react-native-best-practices` skills to validate the code.

#### 2.1 Vercel React Best Practices
**Action Required**:
1. Load and execute the vercel-react-best-practices skill
2. Apply all 45 rules across 8 categories from that skill
3. Collect findings from each rule category:
   - Eliminating Waterfalls (CRITICAL)
   - Bundle Size Optimization (CRITICAL)
   - Server-Side Performance (HIGH)
   - Client-Side Data Fetching (MEDIUM-HIGH)
   - Re-render Optimization (MEDIUM)
   - Rendering Performance (MEDIUM)
   - JavaScript Performance (LOW-MEDIUM)
   - Advanced Patterns (LOW)

**Expected Output**:
- List of passed checks (✅)
- List of warning items (⚠️)
- List of failed checks (❌)
- Specific improvement suggestions (💡)

#### 2.2 React Native Best Practices
**Action Required**:
1. Load and execute the react-native-best-practices skill
2. Apply guidelines across 6 priority categories:
   - FPS & Re-renders (CRITICAL) - `js-*` references
   - Bundle Size (CRITICAL) - `bundle-*` references
   - TTI Optimization (HIGH) - `native-*`, `bundle-*` references
   - Native Performance (HIGH) - `native-*` references
   - Memory Management (MEDIUM-HIGH) - `js-*`, `native-*` references
   - Animations (MEDIUM) - `js-*` references

3. Check for common React Native issues:
   - ❌ Using ScrollView for long lists instead of FlatList/FlashList
   - ❌ Barrel imports causing large bundles
   - ❌ Missing memoization causing re-renders
   - ❌ Synchronous operations blocking JS thread
   - ❌ Memory leaks in JS or native code
   - ❌ Animation jank (not using Reanimated worklets)
   - ❌ Unoptimized TextInput (controlled components)

**Expected Output**:
- FPS & Performance issues (🎯)
- Bundle size concerns (📦)
- Memory leak risks (💧)
- Native optimization opportunities (⚡)
- Animation improvements (🎬)

**CRITICAL**: Both skills are mandatory. The findings MUST be documented in the final report under "React 最佳實踐檢查" and "React Native 效能檢查" sections with specific rule violations and file locations.

### Step 3: AI-Powered Analysis with Gemini CLI
**MUST EXECUTE**: Use Gemini CLI for AI-powered code analysis with both Vercel React Best Practices and React Native Best Practices as standards.

**Action Required**:
1. Reference both global skills (vercel-react-best-practices AND react-native-best-practices)
2. Prepare a prompt that instructs Gemini to follow both skill sets
3. Execute Gemini CLI analysis with the enhanced prompt
4. Use `run_in_terminal` to run the command
5. Parse the JSON output
6. Collect all findings

**Step-by-step Execution**:

```bash
# Create a prompt that references both global skills
cat > /tmp/gemini-review-prompt.txt << 'EOF'
Analyze this React/React Native TypeScript file using TWO skill sets as standards:

1. VERCEL REACT BEST PRACTICES (45 rules across 8 categories):
   - Eliminating Waterfalls (CRITICAL) - async-*, promise handling
   - Bundle Size Optimization (CRITICAL) - bund (Optional)
**OPTIONAL**: Use Gemini CLI for enhanced AI-powered code analysis if available.

**If Gemini CLI is available**:
```bash
gemini analyze <file-path> --format json --checks security,performance,best-practices
```

**If Gemini CLI is NOT available**:
- Skip this step
- Continue with manual analysis in Steps 4-5

**Expected Output (if executed)**:
- Security vulnerabilities with severity levels
- Performance bottlenecks and optimization suggestions
- Code quality issues and improvement recommendations
- Best practice violations

# Code quality assessment
gemini review <file-path> --output json
```

Integrate Gemini's findings into the review report, specifically:
- Security vulnerabilities identified by Gemini
- Performance bottlenecks detected
- Code quality suggestions from Gemini's analysis
- Best practice violations flagged by Geminiper dependency arrays)
- ✅ Components have proper TypeScript prop types
- ✅ State management is appropriate (local vs global)
- ✅ Proper use of `useMemo`, `useCallback` for performance
- ✅ No unnecessary re-renders
- ✅ Event handlers properly typed
- ✅ Platform-specific code properly handled

#### Code Quality
- ✅ Single Responsibility Principle followed
- ✅ Functions are small and focused
- ✅ Variable and function names are descriptive
- ✅ Code is DRY (Don't Repeat Yourself)
- ✅ Magic numbers/strings are constants
- ✅ Comments explain "why", not "what"

#### Performance
- ✅ No unnecessary renders (React.memo, useMemo, useCallback)
- ✅ Long lists use FlatList, not ScrollView
- ✅ Images are optimized
- ✅ Heavy computations are memoized
- ✅ Async operations are properly managed

#### Error Handling
- ✅ Try-catch blocks for async operations
- ✅ Error states are handled in UI
- ✅ Network errors are caught and displayed
- ✅ Edge cases are considered
- ✅ Input validation is present

#### Security
- ✅ No hardcoded API keys or secrets
- ✅ User input is validated and sanitized
- ✅ Sensitive data uses secure storage
- ✅ No XSS vulnerabilities
- ✅ HTTPS for API calls

#### i18n (Internationalization)
- ✅ All user-facing text uses translation keys
- ✅ Translation keys are descriptive
- ✅ No hardcoded text strings in UI

#### Project-Specific Standards
- ✅ Follows project folder structure
- ✅ Uses project's shared components/utilities
- ✅ Follows naming conventions
- ✅ Zustand store patterns followed (if applicable)

### Step 6: Generate Review Report

Create a detailed report in Traditional Chinese with the following sections:

```markdown
# 程式碼審查報告

## 📊 審查摘要
- **審查時間**: [timestamp]
- **審查檔案**: [file paths]
- **整體評分**: [score]/5.0
- **審查工具**: Gemini CLI + ESLint + Prettier + Vercel Best Practices

## 📈 評分明細
- 程式碼品質: ⭐⭐⭐⭐⭐ (X/5)
- React 最佳實踐: ⭐⭐⭐⭐⭐ (X/5)
- React Native 效能: ⭐⭐⭐⭐⭐ (X/5)
- 型別安全: ⭐⭐⭐⭐⭐ (X/5)
- 效能表現: ⭐⭐⭐⭐⭐ (X/5)
- 安全性: ⭐⭐⭐⭐⭐ (X/5)
- 可維護性: ⭐⭐⭐⭐⭐ (X/5)

## 🤖 Gemini AI 分析結果

### 安全性檢查
- [Security issues identified by Gemini]

### 效能分析
- [Performance suggestions from Gemini]
- [React Native specific performance issues]

### 程式碼品質建議
- [Code quality recommendations from Gemini]

## 🎯 React 最佳實踐檢查

### ✅ 通過項目
- [List of passed Vercel best practice checks]

### ⚠️ 警告項目
- [List of warnings from Vercel best practice checks]

### ❌ 未通過項目
- [List of failed Vercel best practice checks]

### 💡 改進建議
- [Suggestions based on Vercel best practices]

## 📱 React Native 效能檢查

### 🎯 FPS & Re-renders (CRITICAL)
- ✅/❌ 長列表使用 FlatList/FlashList
- ✅/❌ 使用 React Compiler 或手動 memoization
- ✅/❌ 使用 atomic state 減少 re-renders
- ✅/❌ 使用 useDeferredValue 處理昂貴計算

### 📦 Bundle Size (CRITICAL)
- ✅/❌ 避免 barrel imports
- ✅/❌ 啟用 tree shaking
- ✅/❌ 使用 R8 優化 Android
- ✅/❌ 移除不必要的 polyfills

### ⚡ TTI Optimization (HIGH)
- ✅/❌ 停用 Android JS bundle 壓縮 (啟用 Hermes mmap)
- ✅/❌ 使用 native navigation (react-native-screens)
- ✅/❌ 使用 InteractionManager 延遲非關鍵工作

### 🚀 Native Performance (HIGH)
- ✅/❌ Turbo Modules 使用 async 方法
- ✅/❌ 重度計算移至背景執行緒
- ✅/❌ 使用 C++ 處理跨平台效能關鍵程式碼

### 💧 Memory Management (MEDIUM-HIGH)
- ✅/❌ 無 JS 記憶體洩漏
- ✅/❌ 無 native 記憶體洩漏
- ✅/❌ 正確清理 listeners 和 timers

### 🎬 Animations (MEDIUM)
- ✅/❌ 使用 Reanimated worklets 而非 Animated API
- ✅/❌ TextInput 使用 uncontrolled components
- ✅/❌ 動畫不造成 frame drops

## 🔴 嚴重問題 (必須修復)

### [file-path]:[line-number]
**問題描述**: [Detailed description]
**影響**: [Impact explanation]
**建議修正**:
\`\`\`typescript
// 修改前
[original code]

// 修改後
[suggested fix]
\`\`\`

## 🟡 警告 (建議修復)

### [file-path]:[line-number]
**問題描述**: [Description]
**建議**: [Suggestion]
**原因**: [Reasoning]

## 🔵 建議改進 (可選)

### [file-path]:[line-number]
**改進建議**: [Improvement suggestion]
**好處**: [Benefits of improvement]

## 📋 Lint 檢查結果

\`\`\`
[Output from lint tools]
\`\`\`

## 🔧 自動修正項目

已自動修正以下問題:
- [List of automatically fixed issues]

## 📝 檢查清單

- [x] TypeScript 型別完整
- [x] 錯誤處理完善
- [x] 效能考量周全
- [x] 安全性檢查通過
- [x] i18n 翻譯完整
- [ ] [Any unchecked items]

## 💡 總結與建議

**已完成的優化**：
- [List specific optimizations that were applied]

**後續建議**：
- [List recommendations for future improvements]
```

### Step 7: Auto-Fix Issues

**MUST EXECUTE**: After generating the report, you MUST automatically apply fixes using the available tools:

1. **Formatting Issues** - EXECUTE IMMEDIATELY:
   ```bash
   npx prettier --write <file-path>
   ```
   Use `run_in_terminal` tool to execute this command.

2. **Auto-fixable Lint Errors** - EXECUTE IMMEDIATELY:
   ```bash
   npx eslint <file-path> --fix
   ```
   Use `run_in_terminal` tool to execute this command.

3. **Code Issues** - APPLY USING EDIT TOOLS:
   You MUST use `replace_string_in_file` or `multi_replace_string_in_file` to fix:

   - **Missing Type Annotations**: Add explicit types to function parameters and return types
   - **Replace `any` types**: Replace with proper TypeScript types
   - **Missing Dependencies**: Add missing items to useEffect/useCallback/useMemo dependency arrays
   - **Unused Imports**: Remove import statements that are never used
   - **Magic Numbers**: Extract hardcoded numbers to named constants
   - **Inline Functions**: Convert inline arrow functions in JSX to memoized callbacks
   - **Missing Keys**: Add unique `key` props to list items
   - **Platform.select**: Use Platform.select for platform-specific values instead of Platform.OS checks

4. **What NOT to Auto-fix** (provide suggestions only):
   - Complex logic changes
   - Business logic modifications
   - API signature changes
   - State structure changes
   - Navigation flow changes

**EXECUTION RULE**: Always attempt to auto-fix unless the change requires business logic understanding. Do NOT just suggest fixes - actually apply them using the appropriate tools.

### Step 8: Document Changes

After ACTUALLY executing auto-fixes (not just suggesting), append to the report:

```markdown
## 🔧 已執行自動修正

### 格式化修正
✅ 已使用 Prettier 格式化程式碼
- 檔案: [list files formatted]

### ESLint 自動修正
✅ 已執行 ESLint --fix
- 修正項目: [list of specific lint fixes applied]

### 程式碼修正 (使用編輯工具)
以下修正已直接應用到程式碼:

#### 型別註解補充
- ✅ [file:line] 為函數參數添加型別
- ✅ [file:line] 添加函數返回型別

#### 依賴陣列修正
- ✅ [file:line] 為 useEffect 添加缺少的依賴項
- ✅ [file:line] 為 useCallback 添加依賴陣列

#### 效能優化
- ✅ [file:line] 將內聯函數提取為 useCallback
- ✅ [file:line] 為列表項添加 key 屬性

#### Import 整理
- ✅ [file:line] 移除未使用的 import

---
**✅ 自動修正已完成並應用**: 所有安全的修正已直接套用到程式碼檔案。
**⚠️ 請確認變更**: 建議檢查修正內容後再提交。
```

**IMPORTANT**: This section must list ACTUAL changes made, not hypothetical suggestions. If you didn't execute any fixes, explain why.

## Important Guidelines

1. **Execute, Don't Just Suggest**: USE TOOLS to actually fix issues, don't just describe what should be fixed
2. **Be Constructive**: Focus on improvement, not criticism
3. **Provide Examples**: Always show code examples for suggestions
4. **Prioritize**: Use severity levels (🔴🟡🔵) to help developers prioritize
5. **Be Specific**: Always reference file paths and line numbers
6. **Explain Reasoning**: Don't just point out issues, explain why they matter
7. **Celebrate Good Code**: Acknowledge what was done well
8. **Apply Both Skill Sets**: Always check against BOTH Vercel React and React Native best practices
9. **React Native Focus**: Pay special attention to FPS, bundle size, TTI, and memory issues
## Execution Summary

1. **Check Gemini CLI** - Verify installation (optional, skip if not available)
2. **Apply best practices skills** - Execute both vercel-react-best-practices AND react-native-best-practices
3. **Run Gemini Analysis** - Use `gemini` CLI if available for AI-powered analysis
4. **Run lint** - Execute TypeScript, ESLint, Prettier checks
5. **Manual analysis** - Review code against quality criteria
6. **Generate report** - Create detailed review in Traditional Chinese
7. **EXECUTE FIXES** - Apply formatting, lint fixes, and safe code improvements
8. **Save report** - Document findings at `.github/review-reports/review-[timestamp].md`
9. **Summarize** - Report what was reviewed and what was actually fixed

**CRITICAL NOTES**:
- Gemini CLI is optional - if not installed, continue without it
- Steps 2 (best practices) and 7 (fixes) are mandatory
- Always attempt to fix issues using available tools, not just suggest
- Generate all reports in Traditional Chinese

## Notes

- Run lint checks before manual review
- Save all reports for tracking
- Consider project-specific patterns from `.github/copilot-instructions.md`
- For React Native: Focus on FPS, bundle size, TTI, and memory issues
