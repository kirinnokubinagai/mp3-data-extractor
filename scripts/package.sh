#!/bin/bash

# Media Extractor - Chrome Web Store Package Script
# このスクリプトは、Chrome Web Store用のZIPパッケージを作成します

set -e  # エラーが発生したら停止

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Media Extractor Package Script ===${NC}"
echo ""

# manifest.jsonからバージョンを取得
if [ ! -f "manifest.json" ]; then
  echo -e "${RED}Error: manifest.json not found${NC}"
  echo "このスクリプトはプロジェクトルートで実行してください"
  exit 1
fi

VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
PACKAGE_NAME="media-extractor-v${VERSION}.zip"

echo -e "Version: ${GREEN}${VERSION}${NC}"
echo -e "Package name: ${GREEN}${PACKAGE_NAME}${NC}"
echo ""

# ビルド前チェック
echo -e "${YELLOW}[1/6] Pre-build checks...${NC}"

# Node.jsがインストールされているか確認
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js not found${NC}"
  echo "Node.jsをインストールしてください: https://nodejs.org/"
  exit 1
fi

# npm がインストールされているか確認
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm not found${NC}"
  exit 1
fi

echo "✓ Node.js and npm found"

# Lint チェック
echo -e "${YELLOW}[2/6] Running linter...${NC}"
if npm run lint; then
  echo "✓ Lint passed"
else
  echo -e "${RED}Error: Lint failed${NC}"
  echo "npm run lint:fix でエラーを修正してください"
  exit 1
fi

# テスト実行
echo -e "${YELLOW}[3/6] Running tests...${NC}"
if npm test; then
  echo "✓ Tests passed"
else
  echo -e "${RED}Error: Tests failed${NC}"
  echo "テストを修正してください"
  exit 1
fi

# セキュリティ監査
echo -e "${YELLOW}[4/6] Running security audit...${NC}"
if npm audit --audit-level=high; then
  echo "✓ No high/critical vulnerabilities"
else
  echo -e "${YELLOW}Warning: Vulnerabilities found${NC}"
  echo "npm audit fix で修正を試みてください"
  # 警告のみで続行
fi

# アイコンファイル確認
echo -e "${YELLOW}[5/6] Checking icon files...${NC}"
ICONS=("icons/icon-16.png" "icons/icon-32.png" "icons/icon-48.png" "icons/icon-128.png")
ALL_ICONS_EXIST=true

for icon in "${ICONS[@]}"; do
  if [ ! -f "$icon" ]; then
    echo -e "${RED}Error: $icon not found${NC}"
    ALL_ICONS_EXIST=false
  fi
done

if [ "$ALL_ICONS_EXIST" = false ]; then
  echo -e "${YELLOW}アイコンを生成しますか? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    cd icons
    bash generate-icons.sh
    cd ..
    echo "✓ Icons generated"
  else
    echo -e "${RED}Error: アイコンが不足しています${NC}"
    exit 1
  fi
else
  echo "✓ All icon files exist"
fi

# ZIPファイル作成
echo -e "${YELLOW}[6/6] Creating ZIP package...${NC}"

# 既存のZIPファイルを削除
if [ -f "$PACKAGE_NAME" ]; then
  echo "Removing existing package: $PACKAGE_NAME"
  rm "$PACKAGE_NAME"
fi

# ZIPファイル作成
zip -r "$PACKAGE_NAME" \
  manifest.json \
  popup.html \
  offscreen.html \
  dist/ \
  lib/lucide.min.js \
  icons/icon-16.png \
  icons/icon-32.png \
  icons/icon-48.png \
  icons/icon-128.png \
  -x "*.test.js" "*test*" "node_modules/*" ".git/*" "*.log" ".DS_Store" "icons/icon.svg" "icons/placeholder.svg" "icons/generate-icons.sh" "icons/README.md" "icons/TASK_*.md"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Package created successfully${NC}"
else
  echo -e "${RED}Error: Failed to create package${NC}"
  exit 1
fi

# パッケージサイズを確認
FILESIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
echo ""
echo -e "${GREEN}=== Package Info ===${NC}"
echo -e "File: ${GREEN}$PACKAGE_NAME${NC}"
echo -e "Size: ${GREEN}$FILESIZE${NC}"

# 5MBを超えている場合は警告
FILESIZE_BYTES=$(stat -f%z "$PACKAGE_NAME" 2>/dev/null || stat -c%s "$PACKAGE_NAME" 2>/dev/null)
if [ "$FILESIZE_BYTES" -gt 5242880 ]; then
  echo -e "${YELLOW}Warning: Package size exceeds 5MB (recommended limit)${NC}"
fi

# ZIPの内容を表示
echo ""
echo -e "${YELLOW}Package contents:${NC}"
unzip -l "$PACKAGE_NAME" | head -n 20

echo ""
echo -e "${GREEN}=== Next Steps ===${NC}"
echo "1. ローカルでテスト:"
echo "   - mkdir test-extension"
echo "   - unzip $PACKAGE_NAME -d test-extension/"
echo "   - chrome://extensions/ で読み込み"
echo ""
echo "2. Chrome Web Storeにアップロード:"
echo "   - https://chrome.google.com/webstore/devconsole/"
echo "   - $PACKAGE_NAME をアップロード"
echo ""
echo -e "${GREEN}パッケージ作成完了！${NC}"
