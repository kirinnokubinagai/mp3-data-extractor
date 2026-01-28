# 拡張機能IDの確認方法

## 手順

1. Chromeで `chrome://extensions/` を開く

2. 右上の「デベロッパーモード」をONにする

3. 「Media Extractor」カードの下に「ID:」という項目が表示される

4. IDをコピー（例: `abcdefghijklmnopqrstuvwxyz123456`）

## 次の手順

IDを取得したら、以下のコマンドを実行してください：

```bash
cd /Users/kirinnokubinagaiyo/mp3-data-extractor/native_host
./install.sh
```

プロンプトが表示されたら、コピーしたIDを貼り付けてEnterを押してください。
