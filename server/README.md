# YouTube Downloader API Server

yt-dlpを使用したYouTube動画情報取得APIサーバー

## Renderへのデプロイ手順

### 1. GitHubリポジトリにpush

```bash
cd /Users/kirinnokubinagaiyo/mp3-data-extractor
git add server/
git commit -m "Add yt-dlp API server"
git push origin main
```

### 2. Renderアカウント作成

https://render.com/ でアカウント作成（GitHubアカウントで登録可能）

### 3. New Web Service作成

1. Renderダッシュボードで「New +」→「Web Service」をクリック
2. GitHubリポジトリを接続
3. 以下の設定を入力:
   - **Name**: `youtube-downloader-api`（任意）
   - **Region**: `Oregon (US West)` または `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`

4. 「Create Web Service」をクリック

### 4. デプロイ完了を待つ

- 初回デプロイは5〜10分かかります
- デプロイが完了すると、URLが表示されます（例: `https://youtube-downloader-api.onrender.com`）

### 5. 動作確認

ブラウザで以下のURLにアクセス:
```
https://あなたのアプリ名.onrender.com/health
```

以下のレスポンスが返れば成功:
```json
{"status":"healthy"}
```

## API エンドポイント

### GET /health
ヘルスチェック

### POST /api/video-info
動画情報取得

リクエスト:
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### POST /api/download-url
動画ダウンロードURL取得

### POST /api/audio-url
音声ダウンロードURL取得

## ローカルでのテスト

```bash
cd server
pip install -r requirements.txt
python main.py
```

http://localhost:8000/docs でAPI仕様を確認できます

## 注意事項

- 無料プランは750時間/月の制限あり
- アイドル時はスリープし、初回アクセス時に起動（30秒〜1分の遅延）
- 帯域幅: 100GB/月まで無料
