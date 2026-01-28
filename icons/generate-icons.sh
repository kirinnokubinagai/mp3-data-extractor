#!/bin/bash

# Media Extractor アイコン生成スクリプト
# SVGから各サイズのPNGを生成

echo "🎨 Media Extractor アイコン生成開始..."

# カレントディレクトリを確認
if [ ! -f "icon.svg" ]; then
  echo "❌ エラー: icon.svg が見つかりません"
  echo "   icons/ディレクトリ内で実行してください"
  exit 1
fi

# ImageMagickがインストールされているか確認
if ! command -v convert &> /dev/null; then
  echo "❌ エラー: ImageMagickがインストールされていません"
  echo ""
  echo "インストール方法:"
  echo "  macOS: brew install imagemagick"
  echo "  Ubuntu: sudo apt-get install imagemagick"
  exit 1
fi

# 各サイズのPNGを生成
for size in 16 32 48 128; do
  echo "⏳ icon-${size}.png を生成中..."
  convert icon.svg -resize ${size}x${size} icon-${size}.png

  if [ -f "icon-${size}.png" ]; then
    echo "✅ icon-${size}.png 生成完了"
  else
    echo "❌ icon-${size}.png の生成に失敗しました"
  fi
done

echo ""
echo "🎉 全てのアイコンが生成されました！"
echo ""
echo "生成されたファイル:"
ls -lh icon-*.png

echo ""
echo "次のステップ:"
echo "1. Chrome拡張機能をリロード"
echo "2. ツールバーのアイコンを確認"
echo "3. 問題なければ placeholder.svg を削除可能"
