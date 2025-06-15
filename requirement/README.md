# Nocioun 프로젝트 요구사항 문서

이 폴더에는 nocioun 프로젝트의 모든 요구사항과 설계 문서가 포함되어 있습니다.

## 📁 문서 구조

### 📋 [01-project-overview.md](./01-project-overview.md)

프로젝트의 전체적인 개요와 목표를 정리한 문서입니다.

- 프로젝트 정보 (서비스명, 도메인, 목적)
- 프로젝트 목표 및 주요 특징
- 개발 단계별 계획 개요

### ⚙️ [02-functional-requirements.md](./02-functional-requirements.md)

시스템이 제공해야 하는 기능들을 상세히 정리한 문서입니다.

- 사용자 인증 및 관리 기능
- 워크스페이스 관리 기능
- Action Templates 기능
- 서버리스 기능

### 🛠️ [03-technical-requirements.md](./03-technical-requirements.md)

기술적 요구사항과 아키텍처를 정리한 문서입니다.

- 전체 아키텍처 설계
- 인증 및 보안 요구사항
- 데이터베이스 및 외부 API 연동 요구사항
- 배포 및 성능 요구사항

### 👤 [04-user-stories.md](./04-user-stories.md)

사용자 관점에서의 요구사항을 Epic과 User Story 형태로 정리한 문서입니다.

- Epic 1: 사용자 온보딩
- Epic 2: 워크스페이스 관리
- Epic 3: Action Template 선택
- Epic 4: OAuth 인증
- Epic 5: 더미 기능

### 🗄️ [05-data-models.md](./05-data-models.md)

데이터베이스 스키마와 데이터 모델을 정리한 문서입니다.

- 사용자 관리 테이블
- Actions 관리 테이블
- OAuth 토큰 관리 테이블
- 실행 로그 테이블
- 데이터 관계도 및 샘플 데이터

### 🎨 [06-ui-flow.md](./06-ui-flow.md)

UI/UX 플로우와 화면 구성을 정리한 문서입니다.

- 전체 화면 구조 및 페이지 구성
- 화면별 상세 플로우
- 상태별 UI 변화
- 반응형 디자인 요구사항
- 사용자 상호작용 패턴

### 🔌 [07-api-specifications.md](./07-api-specifications.md)

API 명세서와 외부 서비스 연동 방법을 정리한 문서입니다.

- Supabase 클라이언트 API
- Supabase Edge Functions
- 외부 API 연동 (Google, Notion)
- 프론트엔드 API 호출 방법
- 에러 처리 방법

### 📅 [08-development-plan.md](./08-development-plan.md)

개발 계획과 마일스톤을 정리한 문서입니다.

- 개발 단계별 상세 일정
- 기술 스택 상세 정보
- 개발 환경 설정 방법
- 테스트 계획
- 배포 전 체크리스트
- 향후 확장 계획

### ⚛️ [09-frontend-tech-stack.md](./09-frontend-tech-stack.md)

Vite + React 기반 프론트엔드 기술 스택을 상세히 정리한 문서입니다.

- 핵심 기술 스택 (Vite, React 18, TypeScript)
- 상태 관리 (Zustand, React Query)
- 프로젝트 구조 및 설계 원칙
- 개발 환경 및 도구 설정
- 성능 최적화 및 테스팅 전략

## 🚀 시작하기

### 1. 프로젝트 이해하기

먼저 `01-project-overview.md`를 읽어서 프로젝트의 전체적인 목표와 방향성을 파악하세요.

### 2. 기능 요구사항 확인하기

`02-functional-requirements.md`와 `04-user-stories.md`를 통해 구현해야 할 기능들을 상세히 파악하세요.

### 3. 기술적 설계 검토하기

`03-technical-requirements.md`, `05-data-models.md`, `07-api-specifications.md`를 통해 기술적 구현 방법을 확인하세요.

### 4. UI/UX 설계 검토하기

`06-ui-flow.md`를 통해 사용자 인터페이스와 사용자 경험 설계를 확인하세요.

### 5. 개발 계획 확인하기

`08-development-plan.md`를 통해 구체적인 개발 일정과 마일스톤을 확인하세요.

### 6. 프론트엔드 기술 스택 검토하기

`09-frontend-tech-stack.md`를 통해 Vite + React 기반의 상세한 기술 스택과 개발 설정을 확인하세요.

## 📝 문서 업데이트

이 문서들은 프로젝트 진행 과정에서 계속 업데이트될 수 있습니다. 변경사항이 있을 때마다 관련 문서를 함께 업데이트해 주세요.

## 🎯 핵심 목표

**nocioun**은 다양한 외부 서비스를 노션과 쉽게 연동할 수 있는 플랫폼을 구축하는 것이 목표입니다.

현재 단계에서는:

- ✅ 기본 인프라 구축 (소개 페이지, 로그인, 워크스페이스)
- ✅ Google Contact과 Notion OAuth 인증 연동
- ✅ 인증 결과를 사용자에게 표시
- ✅ Naver Map 더미 템플릿 제공

향후 확장을 통해 실제 데이터 동기화 기능과 더 많은 서비스 연동을 추가할 예정입니다.
