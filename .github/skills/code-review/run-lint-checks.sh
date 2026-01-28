#!/bin/bash

# Code Review - Lint Checks Script
# 自動執行所有 lint 檢查並收集結果

set -e  # Exit on error (we'll handle errors manually)

FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
  echo "❌ 錯誤: 未提供檔案路徑"
  echo "用法: ./run-lint-checks.sh <file-path>"
  exit 1
fi

echo "🔍 執行 Lint 檢查: $FILE_PATH"
echo "================================"

# 1. TypeScript type checking
echo ""
echo "📘 TypeScript 型別檢查..."
if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt; then
  TSC_EXIT=0
  echo "✅ TypeScript 檢查通過"
else
  TSC_EXIT=$?
  echo "❌ TypeScript 檢查發現錯誤"
fi

# 2. ESLint checks (if configured)
echo ""
echo "🔧 ESLint 檢查..."
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ] || [ -f ".eslintrc" ]; then
  if npx eslint "$FILE_PATH" --format json > /tmp/eslint-output.json 2>&1; then
    ESLINT_EXIT=0
    echo "✅ ESLint 檢查通過"
  else
    ESLINT_EXIT=$?
    echo "❌ ESLint 檢查發現錯誤"
  fi
else
  echo "⚠️  ESLint 未配置，跳過"
  ESLINT_EXIT=0
fi

# 3. Prettier formatting check (if configured)
echo ""
echo "💅 Prettier 格式檢查..."
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f "prettier.config.js" ] || [ -f ".prettierrc.js" ]; then
  if npx prettier --check "$FILE_PATH" 2>&1 | tee /tmp/prettier-output.txt; then
    PRETTIER_EXIT=0
    echo "✅ Prettier 檢查通過"
  else
    PRETTIER_EXIT=$?
    echo "❌ Prettier 檢查發現格式問題"
  fi
else
  echo "⚠️  Prettier 未配置，跳過"
  PRETTIER_EXIT=0
fi

# Summary
echo ""
echo "================================"
echo "📊 Lint 檢查結果摘要："
echo "  TypeScript: $([ $TSC_EXIT -eq 0 ] && echo '✅ 通過' || echo '❌ 有錯誤')"
echo "  ESLint:     $([ $ESLINT_EXIT -eq 0 ] && echo '✅ 通過' || echo '❌ 有錯誤')"
echo "  Prettier:   $([ $PRETTIER_EXIT -eq 0 ] && echo '✅ 通過' || echo '❌ 有錯誤')"
echo ""

# Output files location
echo "📄 詳細輸出檔案:"
[ -f /tmp/tsc-output.txt ] && echo "  - TypeScript: /tmp/tsc-output.txt"
[ -f /tmp/eslint-output.json ] && echo "  - ESLint: /tmp/eslint-output.json"
[ -f /tmp/prettier-output.txt ] && echo "  - Prettier: /tmp/prettier-output.txt"

# Exit with error if any check failed
if [ $TSC_EXIT -ne 0 ] || [ $ESLINT_EXIT -ne 0 ] || [ $PRETTIER_EXIT -ne 0 ]; then
  echo ""
  echo "⚠️  部分檢查未通過，請查看詳細輸出"
  exit 1
else
  echo ""
  echo "🎉 所有檢查通過！"
  exit 0
fi
