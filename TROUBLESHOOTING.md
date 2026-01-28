# Native Messaging トラブルシューティング

## エラー: "chrome.runtime.connectNativeが利用できません"

### 手順1: 拡張機能の完全リロード

1. `chrome://extensions/` を開く
2. 「MP3 Data Extractor」の**削除**ボタンをクリック
3. ページをリロード（F5）
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `/Users/kirinnokubinagaiyo/mp3-data-extractor` フォルダを選択

### 手順2: Chromeの再起動

1. Chromeを**完全に終了**（Cmd+Q）
2. Chromeを再起動
3. `chrome://extensions/` で拡張機能が有効か確認

### 手順3: Service Workerの診断

1. `chrome://extensions/` を開く
2. 「Service Worker」リンクをクリック
3. コンソールで以下を実行:

```javascript
// chrome.runtime.connectNative の存在確認
console.log('connectNative:', typeof chrome.runtime.connectNative);

// すべてのメソッドを確認
Object.keys(chrome.runtime).filter(k => typeof chrome.runtime[k] === 'function');

// パーミッション確認
chrome.runtime.getManifest().permissions;
```

### 手順4: Chromeバージョン確認

1. `chrome://version/` を開く
2. バージョンを確認（推奨: 88以上）

### 手順5: Native Hostのインストール（後で実行）

```bash
cd /Users/kirinnokubinagaiyo/mp3-data-extractor/native_host
chmod +x install.sh
./install.sh
```

## 期待される結果

- `typeof chrome.runtime.connectNative` が `"function"` と表示される
- パーミッションに `"nativeMessaging"` が含まれる

## まだ解決しない場合

以下の情報を提供してください:
- Chromeのバージョン
- macOSのバージョン
- Service Workerコンソールの出力
