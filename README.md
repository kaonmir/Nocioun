# nocioun Monorepo

Google Contacts와 Notion을 연동하는 도구들의 모노레포입니다.

[![CI](https://github.com/kaonmir/nocioun/actions/workflows/ci.yml/badge.svg)](https://github.com/kaonmir/nocioun/actions/workflows/ci.yml)
[![nocioun CLI](https://badge.fury.io/js/nocioun.svg)](https://badge.fury.io/js/nocioun)
[![n8n-nodes-nocioun](https://badge.fury.io/js/n8n-nodes-nocioun.svg)](https://badge.fury.io/js/n8n-nodes-nocioun)

## 패키지

### 📦 [nocioun CLI](./packages/cli/)

Google Contacts와 Notion을 동기화하는 CLI 도구

```bash
# 설치 없이 바로 사용
npx nocioun --help

# 전역 설치
npm install -g nocioun
```

### 🔧 [n8n-nodes-nocioun](./packages/n8n-nodes/)

n8n용 Google Contacts와 Notion 커스텀 노드

```bash
# n8n에 설치
npm install n8n-nodes-nocioun
```

## 빠른 시작

### CLI 사용법

```bash
# Google 인증
npx nocioun auth google

# Notion 인증
npx nocioun auth notion

# 연락처 목록 조회
npx nocioun contacts list

# Google 연락처를 Notion과 동기화
npx nocioun contacts sync
```

### n8n 노드 사용법

1. n8n에서 `n8n-nodes-nocioun` 설치
2. Google Contacts API 및 Notion API 인증 설정
3. 워크플로우에서 노드 사용

## 로컬 개발 설치

1. 의존성 설치:

```bash
npm install
```

2. TypeScript 컴파일:

```bash
npm run build:cli
```

## Google API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. People API 활성화
4. OAuth 2.0 클라이언트 ID 생성 (데스크톱 애플리케이션)
5. `credentials.json` 파일을 프로젝트 루트에 저장

## 사용법

### 개발 모드

```bash
npm run dev
```

### 빌드 후 실행

```bash
npm start
```

### 전역 설치 후 사용

```bash
npm install -g .
contacts
```

## 프로젝트 구조

```
src/
├── index.ts              # 메인 CLI 애플리케이션
├── auth/
│   └── googleAuth.ts     # Google OAuth 인증
├── services/
│   └── contactsService.ts # People API 연결
└── types/
    └── contact.ts        # 타입 정의
```

## 주요 라이브러리

- **inquirer**: 대화형 CLI 인터페이스
- **googleapis**: Google APIs 클라이언트
- **chalk**: 터미널 텍스트 색상
- **ora**: 로딩 스피너

## 배포

### 자동 배포 (GitHub Actions)

이 프로젝트는 GitHub Actions를 통해 자동 배포됩니다:

1. **CI 워크플로우**: 모든 푸시와 PR에 대해 테스트 및 빌드 실행
2. **릴리스 워크플로우**: `v*` 태그 푸시 시 자동으로 npm에 배포
3. **수동 릴리스**: GitHub Actions에서 수동으로 릴리스 트리거 가능

### 수동 릴리스 방법

1. GitHub 저장소의 "Actions" 탭으로 이동
2. "Manual Release" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 버전 번호 입력 또는 릴리스 타입 선택 (patch/minor/major)
5. 워크플로우 실행

### 태그 기반 릴리스

```bash
# 새 버전 태그 생성 및 푸시
git tag v1.0.1
git push origin v1.0.1
```

### 필요한 GitHub Secrets

배포를 위해 다음 secrets를 GitHub 저장소에 설정해야 합니다:

- `NPM_TOKEN`: npm 배포를 위한 토큰 ([npm 토큰 생성 방법](https://docs.npmjs.com/creating-and-viewing-access-tokens))

## 라이센스

MIT
