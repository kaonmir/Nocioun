# 개발 계획 (Development Plan)

## 1. 프로젝트 개요

### 1.1 개발 기간

- **전체 기간**: 4주 (2024년 1월 - 2024년 2월)
- **주요 마일스톤**: 매주 주요 기능 완성

### 1.2 개발 환경

- **프론트엔드**: Vite + React 18 + TypeScript
- **백엔드**: Supabase (PostgreSQL + Edge Functions)
- **배포**: Vercel (프론트엔드) + Supabase (백엔드)

## 2. 주차별 개발 계획

### Week 1: 기본 인프라 구축

**목표**: 프로젝트 초기 설정 및 기본 페이지 구현

**주요 작업:**

- [x] 프로젝트 초기 설정 (Vite, React, TypeScript)
- [x] Supabase 프로젝트 생성 및 설정
- [x] 기본 라우팅 구조 설정
- [x] 홈페이지 (소개 페이지) 구현
- [x] 로그인 페이지 구현
- [x] 워크스페이스 페이지 기본 구조

**완성 기준:**

- 기본 페이지 간 네비게이션 작동
- Supabase Auth 로그인 기능 작동
- 반응형 UI 구현

### Week 2: 데이터베이스 및 OAuth 기반 구조

**목표**: 데이터베이스 설계 및 OAuth 인증 시스템 구현

**주요 작업:**

- [x] 데이터베이스 스키마 생성 (oauth_tokens, sync_logs 테이블)
- [x] Google OAuth 설정 및 Edge Function 구현
- [x] Notion OAuth 설정 및 Edge Function 구현
- [x] OAuth 토큰 관리 시스템 구현
- [x] 기본 에러 처리 시스템

**완성 기준:**

- Google OAuth 로그인 성공
- Notion OAuth 로그인 성공
- 토큰 데이터베이스 저장 확인

### Week 3: 서비스 연동 관리 기능

**목표**: 서비스 연동 상태 관리 및 동기화 기본 기능 구현

**주요 작업:**

- [ ] 서비스 연동 상태 표시 컴포넌트 개발
- [ ] 서비스 연동 CRUD 기능
- [ ] Google Contacts API 연동 함수 구현
- [ ] 기본 동기화 로직 구현

**완성 기준:**

- 연동 상태가 정상적으로 표시됨
- Google Contacts 데이터 조회 가능
- 기본 동기화 기능 작동

### Week 4: Google Contact 동기화 완성

**목표**: Google Contact 동기화 UI 및 기능 완성

**주요 작업:**

- [ ] Google Contact 동기화 페이지 UI
- [ ] 동기화 설정 및 실행 기능
- [ ] 동기화 상태 모니터링
- [ ] 동기화 로그 표시 기능
- [ ] 에러 처리 및 사용자 피드백

**완성 기준:**

- Google Contact 동기화 완전 작동
- 사용자 친화적인 UI/UX
- 안정적인 에러 처리

## 3. 기술 스택별 상세 계획

### 3.1 프론트엔드 (React)

**주요 컴포넌트:**

- `HomePage`: 서비스 소개
- `LoginPage`: 로그인 페이지
- `WorkspacePage`: 메인 워크스페이스
- `ServiceConnectionCard`: 서비스 연동 상태 카드
- `SyncStatusMonitor`: 동기화 상태 모니터링
- `SyncLogsList`: 동기화 로그 목록

**상태 관리:**

- Context API 또는 Zustand 사용
- OAuth 토큰 상태 관리
- 동기화 상태 관리

### 3.2 백엔드 (Supabase)

**데이터베이스 테이블:**

- `profiles`: 사용자 프로필 (확장)
- `oauth_tokens`: OAuth 토큰 저장
- `sync_logs`: 동기화 로그

**Edge Functions:**

- `google-oauth-callback`: Google OAuth 콜백 처리
- `notion-oauth-callback`: Notion OAuth 콜백 처리
- `sync-google-contacts`: Google Contacts 동기화 실행

### 3.3 외부 API 연동

**Google APIs:**

- Google OAuth 2.0
- Google People API (Contacts)

**Notion API:**

- Notion OAuth
- Notion Pages/Database API

## 4. 테스트 계획

### 4.1 단위 테스트

- OAuth 토큰 관리 함수
- 동기화 로직 함수
- UI 컴포넌트 테스트

### 4.2 통합 테스트

- Google OAuth 플로우
- Notion OAuth 플로우
- 전체 동기화 프로세스

### 4.3 사용자 테스트

- 실제 사용자 계정으로 동기화 테스트
- 에러 상황 대응 테스트

## 5. 배포 계획

### 5.1 개발 환경

- **Frontend**: Vercel Preview
- **Backend**: Supabase Dev Project

### 5.2 프로덕션 환경

- **Domain**: nocioun.kaonmir.com
- **Frontend**: Vercel
- **Backend**: Supabase Production

### 5.3 CI/CD

- GitHub Actions 사용
- 자동 테스트 및 배포
- 환경변수 관리

## 6. 보안 고려사항

### 6.1 OAuth 토큰 보안

- 토큰 암호화 저장
- 토큰 만료 시간 관리
- Refresh Token 자동 갱신

### 6.2 데이터 보안

- RLS 정책 적용
- API 요청 검증
- 사용자 데이터 분리

## 7. 성능 최적화

### 7.1 프론트엔드

- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략

### 7.2 백엔드

- 데이터베이스 인덱스 최적화
- API 응답 시간 최적화
- 동시 요청 처리

## 8. 모니터링 및 로깅

### 8.1 에러 모니터링

- Supabase 로그 활용
- 클라이언트 에러 추적

### 8.2 성능 모니터링

- API 응답 시간 측정
- 동기화 성공률 추적
- 사용자 활동 분석
