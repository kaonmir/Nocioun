# 데이터 모델 (Data Models)

## 1. 사용자 관리

### 1.1 users (Supabase Auth 기본 테이블 확장)

```sql
-- Supabase Auth의 auth.users 테이블 사용
-- 추가 프로필 정보가 필요한 경우 profiles 테이블 생성
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. OAuth 토큰 관리

### 2.1 oauth_tokens 테이블

```sql
CREATE TABLE oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'notion'
  service_type TEXT DEFAULT 'contacts', -- 서비스 타입 구분
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens" ON oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. 동기화 로그

### 3.1 sync_logs 테이블

```sql
CREATE TABLE sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'notion'
  service_type TEXT NOT NULL, -- 'contacts', etc.
  status TEXT NOT NULL, -- 'success', 'error', 'running'
  message TEXT,
  error_details JSONB,
  synced_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs" ON sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert sync logs" ON sync_logs
  FOR INSERT WITH CHECK (true); -- Edge Functions에서 삽입 가능
```

## 4. 인덱스

```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);
CREATE INDEX idx_oauth_tokens_service_type ON oauth_tokens(service_type);

CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_provider ON sync_logs(provider);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at);
```

## 5. 데이터 관계도

```
auth.users (Supabase)
├── profiles (1:1)
├── oauth_tokens (1:N)
└── sync_logs (1:N)
```

## 6. 샘플 데이터

### 6.1 OAuth Tokens 테이블 샘플

```json
{
  "id": "token-uuid",
  "user_id": "user-uuid",
  "provider": "google",
  "service_type": "contacts",
  "access_token": "encrypted-access-token",
  "refresh_token": "encrypted-refresh-token",
  "expires_at": "2024-01-15T15:30:00Z",
  "scope": "https://www.googleapis.com/auth/contacts.readonly"
}
```

### 6.2 Sync Logs 테이블 샘플

```json
{
  "id": "log-uuid",
  "user_id": "user-uuid",
  "provider": "google",
  "service_type": "contacts",
  "status": "success",
  "message": "Google Contacts 동기화 완료",
  "synced_count": 25,
  "execution_time_ms": 1500,
  "created_at": "2024-01-15T10:30:00Z"
}
```
