# デプロイ手順（Render + Supabase）

## 前提条件

- GitHubアカウント
- Renderアカウント（https://render.com/）
- Supabaseアカウント（https://supabase.com/）

## Step 1: Supabaseプロジェクト作成

1. https://supabase.com/ にアクセス
2. 「New Project」をクリック
3. 以下を設定:
   - **Name**: `youtube-downloader`
   - **Database Password**: 強力なパスワード（保存しておく）
   - **Region**: `Northeast Asia (Tokyo)` または近い地域
4. 「Create new project」をクリック（1〜2分待つ）

## Step 2: データベーススキーマ作成

1. Supabaseダッシュボードで **「SQL Editor」** を開く
2. `server/schema.sql` の内容をコピー＆ペースト
3. 「RUN」をクリックして実行
4. 成功すると「Success. No rows returned」と表示される

## Step 3: Supabase認証情報取得

1. Supabaseダッシュボードで **「Settings」** → **「API」** を開く
2. 以下をコピー（後で使用）:
   - **Project URL**: `https://xxx.supabase.co`
   - **service_role key**: `eyJhbG...`（**anon keyではなくservice_role key**）

⚠️ **重要**: `service_role key`を使用してください（admin権限が必要）

## Step 4: GitHubにpush

```bash
cd /Users/kirinnokubinagaiyo/mp3-data-extractor
git add -A
git commit -m "Add Supabase auth and quota system"
git push origin main
```

## Step 5: Renderにデプロイ

1. https://render.com/ にアクセス
2. 「New +」→「Web Service」をクリック
3. リポジトリ `mp3-data-extractor` を選択
4. 以下を設定:

| 項目 | 値 |
|------|-----|
| **Name** | `youtube-downloader-api` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Docker` |
| **Instance Type** | `Free` |

5. **Environment Variables** セクションで「Add Environment Variable」をクリック
6. 以下の環境変数を追加:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxx.supabase.co`（Step 3でコピー） |
| `SUPABASE_SERVICE_KEY` | `eyJhbG...`（Step 3でコピー） |

7. 「Create Web Service」をクリック

## Step 6: デプロイ完了を確認

1. デプロイログを確認（5〜10分かかる）
2. 「Live」と表示されたら成功
3. URLをコピー（例: `https://youtube-downloader-api.onrender.com`）

## Step 7: 動作確認

ブラウザで以下にアクセス:
```
https://あなたのアプリ名.onrender.com/
```

以下のレスポンスが返れば成功:
```json
{
  "status": "ok",
  "service": "YouTube Downloader API",
  "auth_enabled": true
}
```

## Step 8: Chrome拡張機能のAPI URL更新

1. `background.js` の `API_SERVER_URL` を更新:
```javascript
const API_SERVER_URL = 'https://あなたのアプリ名.onrender.com';
```

2. ビルド＆リロード:
```bash
npm run build
```

3. `chrome://extensions/` で拡張機能を更新

## トラブルシューティング

### デプロイが失敗する
- ログで `ModuleNotFoundError` が出る → `requirements.txt` を確認
- Dockerビルドが失敗 → `Dockerfile` を確認

### 認証エラーが出る
- 環境変数を確認: `SUPABASE_SERVICE_KEY` が正しいか
- **anon key** ではなく **service_role key** を使用しているか確認

### クオータチェックが動作しない
- Supabaseで `schema.sql` を実行したか確認
- RLS（Row Level Security）が有効になっているか確認

## 無料枠の制限

### Render（無料プラン）
- 750時間/月（毎月リセット）
- アイドル時スリープ（初回アクセス時30秒〜1分の起動遅延）
- 帯域幅: 100GB/月

### Supabase（無料プラン）
- Database: 500MB
- API requests: 無制限
- Auth users: 50,000 MAU（月間アクティブユーザー）

## プラン設定のカスタマイズ

`schema.sql` の `plan_quotas` テーブルを編集:
```sql
INSERT INTO plan_quotas (plan, monthly_quota, price_usd) VALUES
  ('free', 10, 0.00),      -- 無料: 10回/月
  ('basic', 100, 2.99),    -- ベーシック: 100回/月
  ('pro', 999999, 9.99);   -- プロ: 実質無制限
```

変更後、Supabase SQL Editorで再実行してください。
