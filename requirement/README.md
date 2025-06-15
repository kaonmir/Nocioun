# Nocioun 요구사항 문서

## 프로젝트 개요

Nocioun은 Google Contacts와 Notion을 연동하여 연락처 정보를 자동으로 동기화하는 서비스입니다.

## 주요 기능

1. **사용자 인증 및 관리**

   - Supabase Auth를 통한 안전한 로그인
   - 개인 워크스페이스 제공

2. **외부 서비스 연동**

   - Google OAuth 2.0 인증
   - Notion OAuth 인증
   - 서비스 연동 상태 관리

3. **데이터 동기화**

   - Google Contacts 데이터 조회
   - Notion 데이터베이스와 동기화
   - 실시간 동기화 상태 모니터링

4. **로그 및 모니터링**
   - 동기화 이력 추적
   - 에러 로깅 및 상태 관리

## 문서 구조

- `01-project-overview.md`: 프로젝트 전반적인 개요
- `02-functional-requirements.md`: 기능적 요구사항
- `03-technical-requirements.md`: 기술적 요구사항
- `04-user-stories.md`: 사용자 스토리
- `05-data-models.md`: 데이터베이스 모델 및 스키마
- `06-ui-flow.md`: UI/UX 플로우 및 화면 설계
- `07-api-specifications.md`: API 명세서
- `08-development-plan.md`: 개발 계획 및 일정
- `09-frontend-tech-stack.md`: 프론트엔드 기술 스택 상세

## 주요 사용자 플로우

### Epic 1: 사용자 인증

- 홈페이지 방문 및 서비스 소개 확인
- 로그인 후 워크스페이스 접근

### Epic 2: 서비스 연동

- Google OAuth 인증
- Notion OAuth 인증
- 연동 상태 확인

### Epic 3: 데이터 동기화

- Google Contacts 데이터 조회
- Notion과 동기화 실행
- 동기화 결과 확인

### Epic 4: 모니터링

- 동기화 이력 조회
- 에러 상태 관리

## 기술 스택

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Headless UI
- **Routing**: React Router
- **State Management**: Context API

### Backend

- **Platform**: Supabase
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Functions**: Supabase Edge Functions
- **Realtime**: Supabase Realtime

### Deployment

- **Frontend**: Vercel
- **Backend**: Supabase (자동 관리)
- **Domain**: nocioun.kaonmir.com

## 개발 일정

- **Week 1**: 기본 인프라 구축
- **Week 2**: 데이터베이스 및 OAuth 구조
- **Week 3**: 서비스 연동 관리 기능
- **Week 4**: Google Contact 동기화 완성
