#!/bin/bash

# Code Review - Auto-Fix Script
# 自動修正格式化和 lint 錯誤

set -e  # Exit on error (we'll handle errors manually)

FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
  echo "❌ 錯誤: 未提供檔案路徑"
  echo "用法: ./run-lint-fixes.sh <file-path>"
  exit 1
fi

echo "🔧 執行自動修正: $FILE_PATH"
echo "================================"

# 1. Prettier formatting
echo ""
echo "💅 Prettier 格式化..."
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f "prettier.config.js" ] || [ -f ".prettierrc.js" ]; then
  if npx prettier --write "$FILE_PATH" 2>&1 | tee /tmp/prettier-fix-output.txt; then
    echo "✅ Prettier 格式化完成"
    PRETTIER_EXIT=0
  else
    PRETTIER_EXIT=$?
    echo "❌ Prettier 格式化失敗"
  fi
else
  echo "⚠️  Prettier 未配置，跳過"
  PRETTIER_EXIT=0
fi

# 2. ESLint auto-fix
echo ""
echo "🔧 ESLint 自動修正..."
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ] || [ -f ".eslintrc" ]; then
  if npx eslint "$FILE_PATH" --fix 2>&1 | tee /tmp/eslint-fix-output.txt; then
    echo "✅ ESLint 自動修正完成"
    ESLINT_EXIT=0
  else
    ESLINT_EXIT=$?
    echo "⚠️  ESLint 修正完成（可能仍有需手動處理的問題）"
  fi
else
  echo "⚠️  ESLint 未配置，跳過"
  ESLINT_EXIT=0
fi

# Summary
echo ""
echo "================================"
echo "📊 自動修正結果摘要："
echo "  Prettier: $([ $PRETTIER_EXIT -eq 0 ] && echo '✅ 完成' || echo '❌ 失敗')"
echo "  ESLint:   $([ $ESLINT_EXIT -eq 0 ] && echo '✅ 完成' || echo '⚠️  部分完成')"
echo ""

# Output files location
echo "📄 詳細輸出檔案:"
[ -f /tmp/prettier-fix-output.txt ] && echo "  - Prettier: /tmp/prettier-fix-output.txt"
[ -f /tmp/eslint-fix-output.txt ] && echo "  - ESLint: /tmp/eslint-fix-output.txt"

echo ""
echo "🎉 自動修正已完成！"
echo "⚠️  請檢查變更內容後再提交"
exit 0
