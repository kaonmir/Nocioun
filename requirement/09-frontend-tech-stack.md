# 프론트엔드 기술 스택 (Frontend Tech Stack)

## 1. 핵심 기술 스택

### 1.1 빌드 도구 및 개발 환경

```json
{
  "build-tool": "Vite 5.x",
  "package-manager": "pnpm",
  "dev-server": "Vite Dev Server",
  "hot-reload": "Vite HMR (Hot Module Replacement)",
  "bundling": "Rollup (Production)"
}
```

### 1.2 프레임워크 및 언어

```json
{
  "framework": "React 18",
  "language": "TypeScript 5.x",
  "jsx": "React JSX Transform",
  "strict-mode": true
}
```

### 1.3 라우팅

```json
{
  "router": "React Router v6",
  "features": [
    "클라이언트 사이드 라우팅",
    "Protected Routes",
    "Nested Routes",
    "Query Parameters"
  ]
}
```

### 1.4 스타일링 및 UI

```json
{
  "css-framework": "Tailwind CSS 3.x",
  "ui-components": "Headless UI",
  "icons": "Heroicons",
  "responsive": "Mobile-first 디자인"
}
```

## 2. 상태 관리

### 2.1 전역 상태 관리

```typescript
// Zustand 사용 (권장)
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### 2.2 서버 상태 관리

```typescript
// Supabase Client로 서버 상태 관리
import { useQuery, useMutation } from "@tanstack/react-query";

const useActions = () => {
  return useQuery({
    queryKey: ["actions"],
    queryFn: () => supabase.from("actions").select("*"),
  });
};
```

## 3. 프로젝트 구조

### 3.1 폴더 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트 (Button, Input 등)
│   ├── layout/         # 레이아웃 컴포넌트
│   └── features/       # 기능별 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티 및 설정
│   ├── supabase.ts     # Supabase 클라이언트
│   ├── auth.ts         # 인증 관련 유틸
│   └── utils.ts        # 일반 유틸리티
├── store/              # 상태 관리 (Zustand)
├── types/              # TypeScript 타입 정의
├── styles/             # 글로벌 스타일
└── App.tsx             # 메인 앱 컴포넌트
```

### 3.2 컴포넌트 설계 원칙

```typescript
// HOC 패턴 예시 - Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

## 4. 개발 도구

### 4.1 코드 품질

```json
{
  "linting": "ESLint + @typescript-eslint",
  "formatting": "Prettier",
  "pre-commit": "Husky + lint-staged",
  "type-checking": "TypeScript strict mode"
}
```

### 4.2 개발 편의성

```json
{
  "hot-reload": "Vite HMR",
  "dev-tools": "React Developer Tools",
  "path-mapping": "@/ 절대 경로",
  "env-validation": "환경변수 타입 검증"
}
```

## 5. 환경 설정

### 5.1 환경변수 (.env)

```bash
# 개발 환경
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_NOTION_CLIENT_ID=your_notion_client_id
```

### 5.2 Vite 설정 (vite.config.ts)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

### 5.3 Tailwind 설정 (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 정의
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
```

## 6. 라우팅 구조

### 6.1 라우터 설정

```typescript
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "workspace",
        element: (
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "actions",
        children: [
          { path: "new", element: <ActionTemplatePage /> },
          { path: "setup/:template", element: <ActionSetupPage /> },
        ],
      },
    ],
  },
]);
```

## 7. 성능 최적화

### 7.1 번들 최적화

```json
{
  "code-splitting": "React.lazy + Suspense",
  "tree-shaking": "Vite 자동 처리",
  "chunk-splitting": "Vendor/App 분리",
  "preloading": "중요한 리소스 preload"
}
```

### 7.2 런타임 최적화

```typescript
// React.memo 사용
const ActionCard = React.memo<ActionCardProps>(({ action }) => {
  return <div className="action-card">{/* 컴포넌트 내용 */}</div>;
});

// useMemo로 비싼 계산 최적화
const filteredActions = useMemo(() => {
  return actions.filter((action) => action.status === "active");
}, [actions]);
```

## 8. 테스팅

### 8.1 테스트 도구

```json
{
  "unit-testing": "Vitest (Vite 네이티브)",
  "component-testing": "@testing-library/react",
  "e2e-testing": "Playwright",
  "coverage": "Vitest Coverage"
}
```

### 8.2 테스트 설정 (vitest.config.ts)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
```

## 9. 배포

### 9.1 빌드 최적화

```bash
# 최적화된 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

### 9.2 배포 옵션

- **Vercel**: 자동 배포 및 CDN
- **Netlify**: 간편한 정적 사이트 호스팅
- **GitHub Pages**: 무료 호스팅 옵션

## 10. 개발 워크플로우

### 10.1 개발 시작

```bash
# 프로젝트 클론 후
pnpm install
pnpm dev
```

### 10.2 코드 품질 체크

```bash
# 린트 체크
pnpm lint

# 타입 체크
pnpm type-check

# 테스트 실행
pnpm test
```
