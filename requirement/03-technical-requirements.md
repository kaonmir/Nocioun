# 기술 요구사항 (Technical Requirements)

## 1. 아키텍처

### 1.1 전체 아키텍처

- **TR-001**: 서버리스 아키텍처 기반 설계
- **TR-002**: Frontend + Supabase Backend 구조
- **TR-003**: 마이크로서비스 패턴의 Action Template 구조

### 1.2 백엔드

- **TR-004**: Supabase를 백엔드 서비스로 사용
- **TR-005**: Supabase Auth를 이용한 사용자 인증
- **TR-006**: Supabase Database (PostgreSQL) 사용
- **TR-007**: Supabase Edge Functions를 이용한 서버리스 함수 구현

### 1.3 프론트엔드

- **TR-008**: Vite + React 18 사용
- **TR-009**: 반응형 웹 디자인 적용
- **TR-010**: SPA (Single Page Application) 구조
- **TR-011**: React Router를 이용한 클라이언트 사이드 라우팅

## 2. 인증 및 보안

### 2.1 OAuth 인증

- **TR-011**: Supabase OAuth 프로바이더 설정
- **TR-012**: Google OAuth 2.0 연동
- **TR-013**: Notion OAuth 연동
- **TR-014**: JWT 토큰 기반 세션 관리

### 2.2 보안

- **TR-015**: HTTPS 강제 사용
- **TR-016**: CORS 정책 설정
- **TR-017**: API 키 및 시크릿 관리 (환경변수)
- **TR-018**: Rate Limiting 적용

## 3. 데이터베이스

### 3.1 데이터 모델

- **TR-019**: 사용자 테이블 (users)
- **TR-020**: Actions 테이블 (actions)
- **TR-021**: OAuth 토큰 저장 테이블 (oauth_tokens)
- **TR-022**: Action 실행 로그 테이블 (action_logs)

### 3.2 데이터베이스 관리

- **TR-023**: Supabase 자동 백업 활용
- **TR-024**: Row Level Security (RLS) 정책 적용
- **TR-025**: 데이터베이스 마이그레이션 관리

## 4. 외부 API 연동

### 4.1 Google API

- **TR-026**: Google Contacts API 연동
- **TR-027**: Google OAuth 2.0 클라이언트 설정
- **TR-028**: API 요청 제한 및 에러 핸들링

### 4.2 Notion API

- **TR-029**: Notion API v1 연동
- **TR-030**: Notion OAuth 설정
- **TR-031**: 페이지 및 데이터베이스 API 활용

## 5. 배포 및 인프라

### 5.1 도메인 및 호스팅

- **TR-032**: 도메인: nocioun.kaonmir.com
- **TR-033**: SSL 인증서 자동 갱신
- **TR-034**: CDN 활용 (선택사항)

### 5.2 환경 관리

- **TR-035**: 개발/프로덕션 환경 분리
- **TR-036**: 환경변수 관리
- **TR-037**: CI/CD 파이프라인 구축 (선택사항)

## 6. 성능 및 모니터링

### 6.1 성능

- **TR-038**: 페이지 로딩 시간 3초 이내
- **TR-039**: API 응답 시간 1초 이내
- **TR-040**: 이미지 최적화 및 레이지 로딩

### 6.2 모니터링

- **TR-041**: Supabase Dashboard 활용
- **TR-042**: 에러 로깅 및 추적
- **TR-043**: 사용자 활동 로깅
