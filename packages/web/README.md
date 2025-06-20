# Nocioun Web App

카카오맵 장소를 Notion 데이터베이스에 간편하게 저장하는 웹 애플리케이션입니다.

## 기능

1. **Notion OAuth 연결**: Notion 워크스페이스와 안전하게 연결
2. **데이터베이스 선택**: 저장할 Notion 데이터베이스 선택
3. **컬럼 자동 확인/추가**: 필요한 컬럼이 없으면 자동으로 추가
4. **URL 검증**: 카카오맵 URL 형식 및 유효성 검증
5. **장소 저장**: 카카오맵 데이터를 Notion에 구조화하여 저장

## 환경 설정

### 필요한 환경 변수

다음 환경 변수들을 `.env.local` 파일에 설정해야 합니다:

```bash
# Notion OAuth 설정
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback

# Next.js 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Notion OAuth 앱 설정

1. [Notion Developers](https://developers.notion.com/)에서 새 integration 생성
2. OAuth 설정에서 다음 정보 입력:
   - **Redirect URI**: \`http://localhost:3000/api/auth/notion/callback\`
   - **Capabilities**:
     - Read content
     - Update content
     - Insert content
3. Client ID와 Client Secret을 환경 변수에 설정

## 개발 실행

```bash
# 의존성 설치 (프로젝트 루트에서)
pnpm install

# 개발 서버 시작
cd packages/web
pnpm dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 라우트
│   │   ├── auth/notion/ # Notion OAuth
│   │   ├── notion/     # Notion API
│   │   ├── validate-url/ # URL 검증
│   │   └── add-place/  # 장소 추가
│   ├── globals.css     # 전역 스타일
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 홈 페이지
├── components/         # React 컴포넌트
├── lib/               # 유틸리티 함수
│   ├── notion.ts      # Notion API 서비스
│   └── place-converter.ts # 장소 변환 (Mock)
└── types/             # TypeScript 타입 정의
```

## 워크플로우

1. **Notion 연결**: OAuth를 통해 Notion 워크스페이스에 연결
2. **데이터베이스 선택**: 저장할 Notion 데이터베이스 선택
3. **컬럼 확인**: 필요한 컬럼들이 있는지 확인하고, 없으면 추가
4. **URL 입력**: 카카오맵 장소 URL 입력 및 검증
5. **장소 저장**: 검증된 URL에서 장소를 가져와 Notion에 저장

## 필요한 Notion 데이터베이스 컬럼

다음 컬럼들이 자동으로 확인/추가됩니다:

- \`name\` (Title): 장소명
- \`address\` (Rich Text): 주소
- \`homepage\` (Rich Text): 홈페이지 URL
- \`phone_number\` (Rich Text): 전화번호
- \`link\` (Rich Text): 카카오맵 링크

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Notion API**: @notionhq/client
- **Map API**: @nocioun/core (카카오맵 정보 추출)

## 주의사항

- \`place-converter.ts\`는 현재 Mock 구현입니다
- 실제 배포 시에는 환경 변수를 프로덕션 환경에 맞게 설정해야 합니다
- Notion OAuth 앱의 Redirect URI도 프로덕션 도메인으로 업데이트해야 합니다
