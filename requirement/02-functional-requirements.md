# 기능 요구사항 (Functional Requirements)

## 1. 사용자 인증 및 관리

### 1.1 소개 페이지

- **FR-001**: 서비스 소개 및 주요 기능 설명 페이지 제공
- **FR-002**: 로그인 버튼을 통한 인증 페이지로의 이동

### 1.2 사용자 로그인

- **FR-003**: Supabase OAuth를 이용한 사용자 로그인 기능
- **FR-004**: 로그인 성공 시 개인 워크스페이스로 자동 이동
- **FR-005**: 로그인 실패 시 적절한 오류 메시지 표시

## 2. 워크스페이스 관리

### 2.1 Actions 테이블

- **FR-006**: 사용자가 등록한 Actions 목록을 테이블 형태로 표시
- **FR-007**: 각 Action의 다음 정보 표시
  - Action 이름
  - 현재 상태 (활성/비활성/오류 등)
  - 마지막 실행 시간
- **FR-008**: Actions 테이블의 실시간 업데이트

### 2.2 Action 추가

- **FR-009**: "Add Action" 버튼을 통한 새 Action 추가 페이지로 이동
- **FR-010**: Action Template 선택 페이지 제공

## 3. Action Templates

### 3.1 Google Contact 싱크

- **FR-011**: Google Contact Action Template 선택 기능
- **FR-012**: Google OAuth 로그인 인터페이스 제공
- **FR-013**: Notion OAuth 로그인 인터페이스 제공
- **FR-014**: 각 OAuth 로그인 결과를 사용자에게 표시
- **FR-015**: OAuth 로그인 성공/실패 상태 피드백

### 3.2 Naver Map 추가 (더미)

- **FR-016**: Naver Map Action Template 표시 (기능 미구현)
- **FR-017**: 클릭 시 "준비 중" 메시지 표시

## 4. 서버리스 기능

### 4.1 Action 실행

- **FR-018**: Supabase Edge Functions를 이용한 Action 실행
- **FR-019**: Action 실행 상태 추적 및 로깅
- **FR-020**: Action 실행 결과 저장 및 표시
