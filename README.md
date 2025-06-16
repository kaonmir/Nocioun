# Nocioun - DaisyUI Welcome Page with Supabase Auth

DaisyUI 컴포넌트와 Supabase OAuth 인증이 구현된 Next.js 애플리케이션입니다.

## 주요 기능

- ✨ DaisyUI를 사용한 아름다운 웰컴 페이지
- 🔐 Supabase OAuth 인증 (GitHub, Google)
- 📋 인증된 사용자를 위한 Actions 대시보드
- 🎨 다크모드 지원
- 📱 반응형 디자인

## 기술 스택

- **Framework**: Next.js 15
- **UI**: DaisyUI + Tailwind CSS
- **Authentication**: Supabase
- **Language**: TypeScript

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Authentication > Providers에서 GitHub, Google OAuth 설정
3. Database에서 다음 테이블들이 생성되어 있는지 확인:
   - `actions`
   - `jobs`
   - `oauth_tokens`

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)를 열어서 확인하세요.

## 페이지 구조

- `/` - DaisyUI로 만든 웰컴 페이지
- `/login` - OAuth 로그인 페이지
- `/actions` - 인증된 사용자를 위한 액션 대시보드

## 인증 플로우

1. 사용자가 "시작하기" 버튼 클릭
2. `/actions` 페이지로 이동
3. 로그인하지 않은 경우 `/login`으로 리다이렉트
4. OAuth 로그인 (GitHub 또는 Google)
5. 로그인 성공 시 `/actions`로 리다이렉트

## Supabase 스키마

### actions 테이블

```sql
CREATE TABLE actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  properties JSONB,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 개발

```bash
# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 린트
pnpm lint
```

## 배포

Vercel에 배포할 때 환경 변수를 설정해야 합니다:

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Environment Variables에서 환경 변수 추가
3. Supabase URL과 Key 설정

## 라이센스

MIT License
