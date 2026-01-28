-- ユーザー使用状況テーブル
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM'形式
  usage_count INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free', -- 'free', 'basic', 'pro'
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- インデックス作成
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_month ON user_usage(month);

-- RLS（Row Level Security）有効化
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users can view own usage"
  ON user_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロール（APIサーバー）は全てのデータにアクセス可能
CREATE POLICY "Service role can manage all usage"
  ON user_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON user_usage
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- プランごとのクオータ設定（定数テーブル）
CREATE TABLE plan_quotas (
  plan TEXT PRIMARY KEY,
  monthly_quota INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  stripe_price_id TEXT
);

INSERT INTO plan_quotas (plan, monthly_quota, price_usd) VALUES
  ('free', 10, 0.00),
  ('basic', 100, 2.99),
  ('pro', 999999, 9.99); -- 実質無制限

-- 使用回数チェック関数
CREATE OR REPLACE FUNCTION check_quota(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  remaining INTEGER,
  plan TEXT,
  quota INTEGER
) AS $$
DECLARE
  v_month TEXT := TO_CHAR(NOW(), 'YYYY-MM');
  v_usage user_usage%ROWTYPE;
  v_quota_info plan_quotas%ROWTYPE;
BEGIN
  -- 今月の使用状況を取得（なければ作成）
  SELECT * INTO v_usage
  FROM user_usage
  WHERE user_id = p_user_id AND month = v_month;

  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, month, usage_count, plan)
    VALUES (p_user_id, v_month, 0, 'free')
    RETURNING * INTO v_usage;
  END IF;

  -- プランのクオータ情報を取得
  SELECT * INTO v_quota_info
  FROM plan_quotas
  WHERE plan_quotas.plan = v_usage.plan;

  -- クオータチェック
  RETURN QUERY SELECT
    v_usage.usage_count < v_quota_info.monthly_quota,
    GREATEST(0, v_quota_info.monthly_quota - v_usage.usage_count),
    v_usage.plan,
    v_quota_info.monthly_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用回数インクリメント関数
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_month TEXT := TO_CHAR(NOW(), 'YYYY-MM');
BEGIN
  INSERT INTO user_usage (user_id, month, usage_count)
  VALUES (p_user_id, v_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET usage_count = user_usage.usage_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
