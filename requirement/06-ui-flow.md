# UI 플로우 (UI Flow)

## 1. 전체 화면 구조

### 1.1 페이지 구성

```
nocioun.kaonmir.com
├── / (소개 페이지)
├── /login (로그인 페이지)
├── /workspace (워크스페이스 - 로그인 필요)
├── /actions/new (Action Template 선택)
├── /actions/setup/:template (Action 설정)
└── /actions/:id (Action 상세보기 - 향후 확장)
```

## 2. 화면별 상세 플로우

### 2.1 소개 페이지 (/)

```
[Header: Nocioun 로고]
[Hero Section]
├── 서비스 제목: "nocioun"
├── 서비스 설명: "노션과 다양한 서비스를 연동하세요"
├── 주요 기능 소개
│   ├── Google Contact 싱크
│   ├── 더 많은 서비스 연동 예정
└── [로그인 버튼] → /login 이동

[Features Section]
├── 기능 1: 쉬운 연동
├── 기능 2: 자동 동기화
└── 기능 3: 안전한 인증

[Footer]
```

### 2.2 로그인 페이지 (/login)

```
[Header: Nocioun 로고]
[Login Section]
├── 제목: "로그인"
├── 설명: "Supabase 계정으로 로그인하세요"
├── [Supabase OAuth 로그인 버튼]
│   ├── 성공 시 → /workspace 이동
│   └── 실패 시 → 오류 메시지 표시
└── [뒤로가기 버튼] → / 이동
```

### 2.3 워크스페이스 (/workspace)

```
[Header]
├── Nocioun 로고
├── 사용자 정보
└── [로그아웃 버튼]

[Main Content]
├── 제목: "내 워크스페이스"
├── [Add Action 버튼] → /actions/new 이동
└── [Actions 테이블]
    ├── 컬럼: Action 이름 | 상태 | 마지막 실행
    ├── 각 행: Action 정보 표시
    ├── 상태 표시: 활성(녹색) | 비활성(회색) | 오류(빨간색)
    └── 실시간 업데이트
```

### 2.4 Action Template 선택 (/actions/new)

```
[Header: 워크스페이스와 동일]

[Main Content]
├── 제목: "새 Action 추가"
├── 설명: "연동할 서비스를 선택하세요"
└── [Template 카드들]
    ├── [Google Contact 싱크 카드]
    │   ├── 아이콘: Google 로고
    │   ├── 제목: "Google Contact 싱크"
    │   ├── 설명: "Google 연락처를 Notion과 동기화"
    │   └── [선택 버튼] → /actions/setup/google-contact
    └── [Naver Map 카드] (더미)
        ├── 아이콘: Naver 로고
        ├── 제목: "Naver Map 추가"
        ├── 설명: "네이버 지도 정보를 Notion에 저장"
        ├── [준비 중 배지]
        └── [선택 버튼] → "준비 중" 알림
```

### 2.5 Google Contact Action 설정 (/actions/setup/google-contact)

```
[Header: 워크스페이스와 동일]

[Main Content]
├── 제목: "Google Contact 싱크 설정"
├── 설명: "Google과 Notion 계정을 연결하세요"
└── [인증 섹션]
    ├── [Google OAuth 섹션]
    │   ├── 제목: "Google 계정 연결"
    │   ├── 상태 표시: 미연결 | 연결됨 | 오류
    │   ├── [Google 로그인 버튼]
    │   └── 연결 결과 표시 영역
    │       ├── 성공: "✓ example@gmail.com으로 연결됨"
    │       └── 실패: "✗ 연결 실패: [오류 메시지]"
    ├── [Notion OAuth 섹션]
    │   ├── 제목: "Notion 워크스페이스 연결"
    │   ├── 상태 표시: 미연결 | 연결됨 | 오류
    │   ├── [Notion 로그인 버튼]
    │   └── 연결 결과 표시 영역
    │       ├── 성공: "✓ [워크스페이스명]에 연결됨"
    │       └── 실패: "✗ 연결 실패: [오류 메시지]"
    └── [하단 버튼]
        ├── [뒤로가기] → /actions/new
        └── [완료] (두 인증 모두 성공 시 활성화)
```

## 3. 상태별 UI 변화

### 3.1 로딩 상태

```
- OAuth 로그인 진행 중: 버튼에 스피너 표시
- 테이블 로딩 중: 스켈레톤 UI 표시
- 페이지 전환: 로딩 인디케이터
```

### 3.2 오류 상태

```
- 로그인 실패: 빨간색 경고 메시지
- OAuth 인증 실패: 각 섹션에 오류 표시
- 네트워크 오류: 재시도 버튼과 함께 오류 메시지
```

### 3.3 성공 상태

```
- OAuth 인증 성공: 녹색 체크마크와 연결 정보
- Action 추가 성공: 성공 토스트 메시지
- 데이터 동기화 완료: 테이블 업데이트 애니메이션
```

## 4. 반응형 디자인

### 4.1 모바일 (< 768px)

```
- 헤더: 햄버거 메뉴로 축소
- Actions 테이블: 카드 형태로 변경
- Template 선택: 세로 스택 배치
- OAuth 버튼: 전체 너비 사용
```

### 4.2 태블릿 (768px - 1024px)

```
- 2열 그리드 레이아웃
- 사이드바 일부 축소
- 테이블 스크롤 가능
```

### 4.3 데스크톱 (> 1024px)

```
- 풀 레이아웃 사용
- 사이드바 완전 표시
- 테이블 전체 표시
```

## 5. 사용자 상호작용 패턴

### 5.1 첫 방문자 플로우

```
홈페이지 → 로그인 → 워크스페이스 (빈 상태) → Action 추가 → 설정 → 완료
```

### 5.2 기존 사용자 플로우

```
로그인 → 워크스페이스 (기존 Actions 표시) → 새 Action 추가 또는 기존 관리
```

### 5.3 OAuth 인증 플로우

```
설정 페이지 → OAuth 버튼 클릭 → 팝업 인증 → 결과 표시 → 다음 단계
```
