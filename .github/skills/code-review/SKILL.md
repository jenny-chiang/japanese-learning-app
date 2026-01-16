---
name: code-review
description: Perform comprehensive code review including lint checks and generate detailed reports in Traditional Chinese. Use this skill when user says "review this file", "review this code", "code review", "check this file", "review PR", or asks to analyze code quality, find bugs, or check for improvements.
---

# Code Review Skill

## Purpose
Perform thorough code reviews for React Native and TypeScript projects, ensuring code quality, security, performance, and adherence to best practices. Generate comprehensive review reports in Traditional Chinese and automatically fix issues when possible.

## When to Use
- User asks to "review this code" or "check this file"
- User requests "code review" or "review PR"
- User asks about code quality, bugs, or improvements
- User mentions reviewing changes or checking for issues

## Review Process

### Step 1: Understand the Context
1. Identify files to review (current file, PR changes, or specified files)
2. Read the file(s) completely to understand the purpose and logic
3. Check related files if needed (imports, dependencies, types)

### Step 2: Apply Vercel React Best Practices
**IMPORTANT**: Before proceeding with other checks, first apply the `vercel-react-best-practices` skill to validate the code against industry-standard React/React Native best practices.

This will check for:
- Component structure and composition
- Hooks usage patterns
- Performance optimization (memo, useMemo, useCallback)
- State management patterns
- TypeScript best practices
- React Native specific optimizations
- Common anti-patterns

Document all findings from this check in the final report under a dedicated "React 最佳實踐檢查" section.
4: Manual Code Analysis
Review code against these criteria (in addition to Vercel best practices already checked)
Execute linting to identify automatic issues:
```bash
# TypeScript type checking
npx tsc --noEmit

# ESLint checks (if configured)
npx eslint <file-path> --format json

# Prettier formatting check (if configured)
npx prettier --check <file-path>
```

### Step 3: Manual Code Analysis
Review code against these criteria:

#### TypeScript Quality
- ✅ All types are explicitly defined (no implicit `any`)
- ✅ Interfaces and types are properly used
- ✅ Generic types are used appropriately
- ✅ No unused imports or variables
- ✅ Proper type guards where needed

#### React/React Native Best Practices
- ✅ Hooks rules followed (no conditional calls, proper dependency arrays)
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

### Step 5: Generate Review Report

Create a detailed report in Traditional Chinese with the following sections:

```markdown
# 程式碼審查報告

## 📊 審查摘要
- **審查時間**: [timestamp]
- **審查檔案**: [file paths]
- **整體評分**: [score]/10

## 📈 評分明細
- 程式碼品質: ⭐⭐⭐⭐⭐ (X/5)
- React 最佳實踐: ⭐⭐⭐⭐⭐ (X/5)
- 型別安全: ⭐⭐⭐⭐⭐ (X/5)
- 效能表現: ⭐⭐⭐⭐⭐ (X/5)
- 安全性: ⭐⭐⭐⭐⭐ (X/5)
- 可維護性: ⭐⭐⭐⭐⭐ (X/5)

## 🎯 React 最佳實踐檢查

### ✅ 通過項目
- [List of passed Vercel best practice checks]

### ⚠️ 警告項目
- [List of warnings from Vercel best practice checks]

### ❌ 未通過項目
- [List of failed Vercel best practice checks]

### 💡 改進建議
- [Suggestions based on Vercel best practices]

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

## ✅ 良好實踐

- ✅ [List things done well]
- ✅ [Positive feedback items]

## 📋 Lint 檢查結果

\`\`\`
[Output from lint tools]
\`\`\`

## 🔧 自動修正項目

已自動修正以下問題:
- [List of automatically fixed issues]
6
## 📝 檢查清單

- [x] TypeScript 型別完整
- [x] 錯誤處理完善
- [x] 效能考量周全
- [x] 安全性檢查通過
- [x] i18n 翻譯完整
- [ ] [Any unchecked items]

## 💡 總結與建議

[Overall summary and recommendations]
```

### Step 5: Auto-Fix Issues

After generating the report, automatically fix the following types of issues:

1. **Formatting Issues**
   ```bash
   npx prettier --write <file-path>
   ```

2. **Auto-fixable Lint Errors**
   ```bash
   npx eslint <file-path> --fix
   ```

3. **Simp7e Type Issues**
   - Add missing type annotations
   - Replace `any` with proper types
   - Add missing return types

4. **Import Organization**
   - Remove unused imports
   - Sort imports alphabetically
   - Group imports by type (React, libraries, local)

5. **Simple Refactoring**
   - Extract magic numbers to constants
   - Convert function declarations to arrow functions (if consistent with project)
   - Add missing dependency arrays to useEffect/useCallback/useMemo

### Step 6: Document Changes

After auto-fixing, append to the report:

```markdown
## 🔧 已執行自動修正

### 格式化
- 已使用 Prettier 格式化程式碼

### Lint 修正
- [List of lint fixes applied]

### 型別修正
- [List of type improvements made]

### 其他改進
- [List of other automated improvements]

---
**注意**: 請檢查自動修正的內容,確保符合預期後再提交。
```

## Important Guidelines

1. **Execute, Don't Just Suggest**: USE TOOLS to actually fix issues, don't just describe what should be fixed
2. **Be Constructive**: Focus on improvement, not criticism
3. **Provide Examples**: Always show code examples for suggestions
4. **Prioritize**: Use severity levels (🔴🟡🔵) to help developers prioritize
5. **Be Specific**: Always reference file paths and line numbers
6. **Explain Reasoning**: Don't just point out issues, explain why they matter
7. **Celebrate Good Code**: Acknowledge what was done well
8. **Maintain Context**: Consider the broader application context
9. **Auto-fix Aggressively**: Apply all safe fixes automatically - formatting, types, dependencies, imports
10. **Document Actual Changes**: Report only changes that were actually executed, not plans

## Execution Workflow

**YOU MUST FOLLOW THIS EXACT SEQUENCE**:

1. **Read files** - Use `read_file` to analyze code
2. **Check with Vercel best practices** - Apply vercel-react-best-practices skill
3. **Run lint** - Use `run_in_terminal` to execute linting commands
4. **Generate report** - Create review findings in Traditional Chinese
5. **EXECUTE FIXES** - Use `run_in_terminal` for Prettier/ESLint, use `replace_string_in_file` for code fixes
6. **Save report** - Create report file at `.github/review-reports/review-[timestamp].md`
7. **Summarize** - Print what was reviewed and what was ACTUALLY fixed

**CRITICAL**: Step 5 is NOT optional. You must attempt to fix issues, not just report them.

## Example Usage

```
User: "Review this file"
→ 1. Read and analyze current file
→ 2. Check Vercel best practices
→ 3. Run lint checks
→ 4. Generate review report in Traditional Chinese
→ 5. EXECUTE: Run prettier --write
→ 6. EXECUTE: Run eslint --fix
→ 7. EXECUTE: Apply code fixes using edit tools
→ 8. Save report to .github/review-reports/
→ 9. Show summary of fixes APPLIED

User: "Review PR"
→ Same workflow for all PR changed files

User: "Review app/diary.tsx and fix it"
→ Same workflow, emphasizing auto-fix execution

User: "Just review, don't fix"
→ Skip step 5-7, only generate report
```

## Tool Usage Examples

**For formatting:**
```bash
npx prettier --write app/diary.tsx
```

**For lint fixes:**
```bash
npx eslint app/diary.tsx --fix
```

**For code fixes:**
Use `replace_string_in_file` or `multi_replace_string_in_file` to directly edit code files.
```

## Tool Usage Examples

**For formatting:**
```typescript
await run_in_terminal({
  command: "npx prettier --write app/diary.tsx",
  explanation: "格式化程式碼"
})
```

**For code fixes:**
```typescript
await replace_string_in_file({
  filePath: "/path/to/file.tsx",
  oldString: "const [state, setState] = useState()",
  newString: "const [state, setState] = useState<string>('')"
})
→ Get PR changes, review all modified files, generate comprehensive report

User: "Quick review of app/diary.tsx"
→ Review specified file, generate focused report

User: "Check for security issues"
→ Focus review on security aspects, report findings
```

## Notes

- Always run lint checks before manual review
- Save all reports for tracking and history
- Confirm before auto-fixing complex issues
- Consider project-specific patterns from `.github/copilot-instructions.md`
- For React Native: Pay special attention to platform-specific code and performance
