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

## 2. Actions 관리

### 2.1 actions 테이블

```sql
CREATE TABLE actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'google_contact_sync', 'naver_map', etc.
  status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'pending'
  config JSONB, -- 설정 정보를 JSON으로 저장
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own actions" ON actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions" ON actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions" ON actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions" ON actions
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. OAuth 토큰 관리

### 3.1 oauth_tokens 테이블

```sql
CREATE TABLE oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'notion'
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

## 4. 실행 로그

### 4.1 action_logs 테이블

```sql
CREATE TABLE action_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'success', 'error', 'running'
  message TEXT,
  error_details JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own action logs" ON action_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert action logs" ON action_logs
  FOR INSERT WITH CHECK (true); -- Edge Functions에서 삽입 가능
```

## 5. 인덱스

```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_template_type ON actions(template_type);

CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_action_id ON oauth_tokens(action_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);

CREATE INDEX idx_action_logs_action_id ON action_logs(action_id);
CREATE INDEX idx_action_logs_user_id ON action_logs(user_id);
CREATE INDEX idx_action_logs_created_at ON action_logs(created_at);
```

## 6. 데이터 관계도

```
auth.users (Supabase)
├── profiles (1:1)
├── actions (1:N)
│   ├── oauth_tokens (1:N)
│   └── action_logs (1:N)
```

## 7. 샘플 데이터

### 7.1 Actions 테이블 샘플

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "name": "내 Google 연락처 동기화",
  "template_type": "google_contact_sync",
  "status": "active",
  "config": {
    "notion_database_id": "database-uuid",
    "sync_frequency": "daily",
    "field_mapping": {
      "name": "Name",
      "email": "Email",
      "phone": "Phone"
    }
  },
  "last_executed_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-10T14:20:00Z"
}
```

### 7.2 OAuth Tokens 테이블 샘플

```json
{
  "id": "token-uuid",
  "user_id": "user-uuid",
  "action_id": "action-uuid",
  "provider": "google",
  "access_token": "encrypted-access-token",
  "refresh_token": "encrypted-refresh-token",
  "expires_at": "2024-01-15T15:30:00Z",
  "scope": "https://www.googleapis.com/auth/contacts.readonly"
}
```
