#!/bin/bash

# Chrome拡張機能を完全リセットするスクリプト

set -e

echo "🔧 Chrome拡張機能のリセット"
echo ""

# ステップ1: ビルド
echo "📦 ステップ1: 拡張機能をビルド"
npm run build
echo ""

# ステップ2: manifest.json確認
echo "📝 ステップ2: nativeMessagingパーミッションを確認"
if grep -q '"nativeMessaging"' manifest.json; then
  echo "✅ nativeMessaging パーミッションが含まれています"
else
  echo "❌ nativeMessaging パーミッションが見つかりません"
  exit 1
fi
echo ""

# ステップ3: 診断情報を出力
echo "📋 ステップ3: 診断情報"
echo ""
echo "  拡張機能のパス:"
echo "  $(pwd)"
echo ""
echo "  必要なファイル:"
for file in manifest.json dist/background.js dist/popup.js dist/content.js dist/offscreen.js popup.html offscreen.html; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (見つかりません)"
  fi
done
echo ""

# ステップ4: 次の手順を表示
echo "🎯 次の手順（Chromeで実行）:"
echo ""
echo "  1. chrome://extensions/ を開く"
echo ""
echo "  2. 「MP3 Data Extractor」または「Media Extractor」を探す"
echo ""
echo "  3. 拡張機能を【削除】する（更新ではなく削除）"
echo ""
echo "  4. ページをリロード（F5）"
echo ""
echo "  5. 「パッケージ化されていない拡張機能を読み込む」をクリック"
echo ""
echo "  6. このフォルダを選択:"
echo "     $(pwd)"
echo ""
echo "  7. 「Service Worker」リンクをクリック"
echo ""
echo "  8. コンソールで以下を実行して確認:"
echo ""
echo "     typeof chrome.runtime.connectNative"
echo ""
echo "  期待される結果: 'function'"
echo ""
echo "✅ スクリプト完了"
