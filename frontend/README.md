# Nocioun Frontend

Google Contacts와 Notion을 연결하여 연락처를 자동으로 동기화하는 웹 애플리케이션입니다.

## 기술 스택

- ⚡️ [Next.js 15](https://nextjs.org/) - React 프레임워크
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- 🔐 [Supabase](https://supabase.com/) - 백엔드 및 인증
- 📱 TypeScript - 타입 안전성
- 🎯 App Router - Next.js 최신 라우팅 시스템

## 기능

- 🔐 Google/Notion OAuth 인증
- 📇 Google Contacts 연락처 가져오기
- 🔄 Notion 데이터베이스와 동기화
- 📊 실시간 동기화 상태 모니터링
- 🌙 다크 모드 지원

## 시작하기

### 의존성 설치

```bash
pnpm install
# 또는
npm install
# 또는
yarn install
```

### 환경변수 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 개발 서버 실행

```bash
pnpm dev
# 또는
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 빌드

프로덕션 빌드를 생성하려면:

```bash
pnpm build
# 또는
npm run build
# 또는
yarn build
```

프로덕션 서버를 실행하려면:

```bash
pnpm start
# 또는
npm start
# 또는
yarn start
```

## 배포

### Vercel (권장)

1. [Vercel](https://vercel.com)에 프로젝트를 연결
2. 환경변수 설정
3. 자동 배포 완료

### Docker

```bash
# 이미지 빌드
docker build -t nocioun-frontend .

# 컨테이너 실행
docker run -p 3000:3000 nocioun-frontend
```

### 기타 플랫폼

- Netlify
- AWS Amplify
- Railway
- Fly.io

## 프로젝트 구조

```
frontend/
├── app/                    # Next.js App Router
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── lib/               # 유틸리티 및 설정
│   ├── login/             # 로그인 페이지
│   ├── workspace/         # 워크스페이스 페이지
│   ├── oauth/             # OAuth 콜백 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx          # 홈페이지
│   └── globals.css       # 전역 스타일
├── public/               # 정적 파일
├── next.config.js       # Next.js 설정
├── tailwind.config.js   # Tailwind CSS 설정
└── tsconfig.json       # TypeScript 설정
```

## 주요 페이지

- `/` - 홈페이지 (제품 소개)
- `/login` - 로그인 페이지
- `/workspace` - 메인 워크스페이스
- `/oauth/google/callback` - Google OAuth 콜백

---

Built with ❤️ using Next.js.
