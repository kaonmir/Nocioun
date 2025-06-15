-- OAuth 토큰을 저장하는 테이블 생성
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type VARCHAR(20) DEFAULT 'Bearer',
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 한 사용자가 같은 provider에 대해 하나의 토큰만 가질 수 있도록 제약
  UNIQUE(user_id, provider)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 토큰만 접근할 수 있도록 정책 설정
CREATE POLICY "Users can only access their own tokens" ON oauth_tokens
  FOR ALL USING (auth.uid() = user_id);

-- 테이블에 대한 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider 
  ON oauth_tokens(user_id, provider);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_oauth_tokens_updated_at 
  BEFORE UPDATE ON oauth_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 