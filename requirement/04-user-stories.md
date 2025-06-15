# 사용자 스토리 (User Stories)

## Epic 1: 사용자 온보딩

### US-001: 서비스 소개 확인

**As a** 새로운 방문자  
**I want to** 서비스 소개 페이지를 보고  
**So that** nocioun이 무엇인지 이해할 수 있다

**Acceptance Criteria:**

- 서비스의 주요 기능이 명확하게 설명되어 있다
- 로그인 버튼이 눈에 잘 띄는 위치에 있다
- 반응형 디자인으로 모바일에서도 잘 보인다

### US-002: 로그인하기

**As a** 서비스 사용자  
**I want to** 간편하게 로그인하고  
**So that** 내 개인 워크스페이스에 접근할 수 있다

**Acceptance Criteria:**

- Supabase OAuth를 통해 로그인할 수 있다
- 로그인 성공 시 자동으로 워크스페이스로 이동한다
- 로그인 실패 시 명확한 오류 메시지를 볼 수 있다

## Epic 2: 워크스페이스 관리

### US-003: Actions 목록 보기

**As a** 로그인한 사용자  
**I want to** 내가 등록한 Actions을 한눈에 보고  
**So that** 각 Action의 상태를 파악할 수 있다

**Acceptance Criteria:**

- Actions 테이블에서 Action 이름을 볼 수 있다
- 각 Action의 현재 상태를 볼 수 있다
- 마지막 실행 시간을 확인할 수 있다
- 테이블이 실시간으로 업데이트된다

### US-004: 새 Action 추가하기

**As a** 로그인한 사용자  
**I want to** "Add Action" 버튼을 클릭하고  
**So that** 새로운 연동 서비스를 추가할 수 있다

**Acceptance Criteria:**

- "Add Action" 버튼이 명확하게 보인다
- 클릭 시 Action Template 선택 페이지로 이동한다
- 사용 가능한 템플릿 목록을 볼 수 있다

## Epic 3: Action Template 선택

### US-005: Action Template 목록 보기

**As a** 사용자  
**I want to** 사용 가능한 Action Template을 보고  
**So that** 내가 원하는 연동 서비스를 선택할 수 있다

**Acceptance Criteria:**

- Google Contact 싱크 템플릿을 볼 수 있다
- Naver Map 추가 템플릿을 볼 수 있다 (더미)
- 각 템플릿의 설명이 명확하다

### US-006: Google Contact Action 설정하기

**As a** 사용자  
**I want to** Google Contact 템플릿을 선택하고  
**So that** Google 연락처와 Notion을 연동할 수 있다

**Acceptance Criteria:**

- Google Contact 템플릿 클릭 시 설정 페이지로 이동한다
- Google OAuth 로그인 옵션을 볼 수 있다
- Notion OAuth 로그인 옵션을 볼 수 있다

## Epic 4: OAuth 인증

### US-007: Google OAuth 로그인

**As a** 사용자  
**I want to** Google 계정으로 인증하고  
**So that** Google Contacts에 접근할 수 있다

**Acceptance Criteria:**

- Google OAuth 팝업이 정상적으로 열린다
- 인증 성공 시 성공 메시지가 표시된다
- 인증 실패 시 오류 메시지가 표시된다
- 인증 결과가 사용자에게 명확하게 보여진다

### US-008: Notion OAuth 로그인

**As a** 사용자  
**I want to** Notion 계정으로 인증하고  
**So that** Notion 워크스페이스에 접근할 수 있다

**Acceptance Criteria:**

- Notion OAuth 팝업이 정상적으로 열린다
- 인증 성공 시 성공 메시지가 표시된다
- 인증 실패 시 오류 메시지가 표시된다
- 인증 결과가 사용자에게 명확하게 보여진다

### US-009: 인증 상태 확인하기

**As a** 사용자  
**I want to** 각 서비스의 인증 상태를 확인하고  
**So that** 연동이 제대로 되었는지 알 수 있다

**Acceptance Criteria:**

- Google 인증 상태가 명확하게 표시된다
- Notion 인증 상태가 명확하게 표시된다
- 인증된 계정 정보가 표시된다 (이메일 등)

## Epic 5: 더미 기능

### US-010: Naver Map 템플릿 확인

**As a** 사용자  
**I want to** Naver Map 템플릿을 클릭하고  
**So that** 향후 기능을 미리 확인할 수 있다

**Acceptance Criteria:**

- Naver Map 템플릿이 목록에 표시된다
- 클릭 시 "준비 중" 메시지가 표시된다
- 사용자가 혼동하지 않도록 명확하게 안내된다
