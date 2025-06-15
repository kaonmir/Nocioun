# 개발 계획 (Development Plan)

## 1. 개발 단계 개요

### Phase 1: 기본 인프라 구축 (1-2주)

- 프로젝트 초기 설정
- Supabase 설정 및 데이터베이스 구축
- 기본 UI/UX 구현

### Phase 2: 인증 시스템 구현 (1주)

- Supabase OAuth 로그인 구현
- 사용자 세션 관리
- 워크스페이스 기본 기능

### Phase 3: Google Contact 연동 (2-3주)

- Google OAuth 인증
- Notion OAuth 인증
- 인증 결과 표시

## 2. 세부 개발 일정

### Week 1: 프로젝트 설정 및 기본 구조

**목표**: 개발 환경 구축 및 기본 페이지 생성

**작업 항목**:

- [ ] Vite + React 프로젝트 초기화
- [ ] Supabase 프로젝트 생성 및 설정
- [ ] React Router 설정 및 기본 라우팅 구조 설정 (/, /login, /workspace)
- [ ] Tailwind CSS + Headless UI 설정 및 기본 컴포넌트 생성
- [ ] 소개 페이지 UI 구현
- [ ] 반응형 레이아웃 기본 틀 구성

**완료 기준**:

- 소개 페이지가 정상적으로 표시됨
- 기본 네비게이션이 작동함
- 모바일/데스크톱 반응형 확인

### Week 2: 데이터베이스 및 인증 시스템

**목표**: Supabase 데이터베이스 구축 및 기본 인증 구현

**작업 항목**:

- [ ] 데이터베이스 스키마 생성 (actions, oauth_tokens, action_logs 테이블)
- [ ] RLS 정책 설정
- [ ] Supabase Auth 설정
- [ ] 로그인 페이지 UI 구현
- [ ] 로그인/로그아웃 기능 구현
- [ ] 인증 상태 관리 (Context API 또는 Zustand)

**완료 기준**:

- 사용자가 로그인/로그아웃 할 수 있음
- 로그인 상태에 따른 페이지 접근 제어
- 데이터베이스 연결 확인

### Week 3: 워크스페이스 구현

**목표**: Actions 관리 기본 기능 구현

**작업 항목**:

- [ ] 워크스페이스 페이지 UI 구현
- [ ] Actions 테이블 컴포넌트 개발
- [ ] Actions 데이터 CRUD 기능
- [ ] "Add Action" 버튼 및 페이지 이동
- [ ] Action Template 선택 페이지 UI
- [ ] 실시간 데이터 업데이트 (Supabase Realtime)

**완료 기준**:

- Actions 테이블이 정상적으로 표시됨
- 실시간 업데이트가 작동함
- Action Template 선택 페이지 접근 가능

### Week 4: Google Contact Action 설정 페이지

**목표**: Google Contact Action 설정 UI 구현

**작업 항목**:

- [ ] Google Contact Action 설정 페이지 UI
- [ ] Google OAuth 로그인 버튼 구현
- [ ] Notion OAuth 로그인 버튼 구현
- [ ] OAuth 상태 표시 컴포넌트
- [ ] 인증 결과 표시 로직
- [ ] 로딩 상태 및 에러 처리 UI

**완료 기준**:

- 설정 페이지 UI가 완성됨
- OAuth 버튼들이 정상적으로 표시됨
- 상태 표시가 올바르게 작동함

### Week 5-6: OAuth 인증 구현

**목표**: Google 및 Notion OAuth 실제 연동

**작업 항목**:

- [ ] Google Cloud Console OAuth 앱 설정
- [ ] Notion Integration 설정
- [ ] Supabase Edge Functions 개발
  - [ ] Google OAuth 콜백 처리
  - [ ] Notion OAuth 콜백 처리
- [ ] 프론트엔드 OAuth 플로우 구현
- [ ] 토큰 저장 및 관리 로직
- [ ] 인증 결과 사용자에게 표시

**완료 기준**:

- Google OAuth 로그인이 정상 작동함
- Notion OAuth 로그인이 정상 작동함
- 인증 결과가 사용자에게 명확하게 표시됨
- 토큰이 안전하게 저장됨

### Week 7: 더미 기능 및 마무리

**목표**: Naver Map 더미 기능 및 전체 시스템 테스트

**작업 항목**:

- [ ] Naver Map Action Template 더미 구현
- [ ] 전체 시스템 통합 테스트
- [ ] UI/UX 개선 및 버그 수정
- [ ] 성능 최적화
- [ ] 에러 처리 강화
- [ ] 문서화 완료

**완료 기준**:

- 모든 기능이 요구사항에 맞게 작동함
- 사용자 플로우가 원활함
- 에러 처리가 적절히 구현됨

## 3. 기술 스택 상세

### 3.1 프론트엔드

```json
{
  "bundler": "Vite",
  "dev-server": "Vite Dev Server",
  "hot-reload": "Vite HMR",
  "package-manager": "pnpm",
  "framework": "React 18",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui-components": "Headless UI",
  "routing": "React Router v6",
  "http-client": "Supabase Client"
}
```

### 3.2 백엔드

```json
{
  "platform": "Supabase",
  "database": "PostgreSQL",
  "auth": "Supabase Auth",
  "functions": "Supabase Edge Functions (Deno)",
  "realtime": "Supabase Realtime"
}
```

### 3.3 배포

```json
{
  "frontend": "Vercel",
  "backend": "Supabase (자동 관리)",
  "domain": "nocioun.kaonmir.com"
}
```

## 4. 개발 환경 설정

### 4.1 필수 환경변수

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
VITE_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Notion OAuth
VITE_NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=
```

### 4.2 개발 명령어

```bash
# 프로젝트 초기화
pnpm create vite@latest nocioun --template react-ts

# 의존성 설치
pnpm install @supabase/supabase-js @headlessui/react @heroicons/react

# 개발 의존성 설치
pnpm install -D @types/react @types/react-dom tailwindcss postcss autoprefixer

# Tailwind CSS 초기화
npx tailwindcss init -p

# 개발 서버 실행
pnpm dev

# Supabase 로컬 개발
npx supabase start
npx supabase db reset
```

## 5. 테스트 계획

### 5.1 단위 테스트

- [ ] OAuth 관련 유틸 함수
- [ ] 데이터 변환 로직
- [ ] API 호출 함수

### 5.2 통합 테스트

- [ ] 사용자 인증 플로우
- [ ] OAuth 인증 플로우
- [ ] 데이터베이스 CRUD 작업

### 5.3 E2E 테스트

- [ ] 전체 사용자 여정 테스트
- [ ] 다양한 브라우저 호환성
- [ ] 모바일 환경 테스트

## 6. 배포 전 체크리스트

- [ ] 모든 환경변수 설정 완료
- [ ] 프로덕션 데이터베이스 마이그레이션
- [ ] OAuth 앱 프로덕션 도메인 설정
- [ ] HTTPS 설정 확인
- [ ] 성능 테스트 완료
- [ ] 보안 검토 완료
- [ ] 사용자 가이드 작성

## 7. 향후 확장 계획

### Phase 4: 실제 Google Contact 싱크 구현

- Google Contacts와 Notion 데이터베이스 실제 동기화
- 스케줄링 및 자동 실행 기능
- 동기화 설정 옵션

### Phase 5: 추가 서비스 연동

- Naver Map API 실제 구현
- 다른 서비스 템플릿 추가 (Slack, Trello 등)
- 커스텀 Action Template 생성 기능
