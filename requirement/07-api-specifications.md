# API 명세서 (API Specifications)

## 1. Supabase 클라이언트 API

### 1.1 인증 API

```typescript
// Supabase Auth 로그인
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "github", // 또는 다른 OAuth 프로바이더
  options: {
    redirectTo: `${window.location.origin}/workspace`,
  },
});

// 로그아웃
const { error } = await supabase.auth.signOut();

// 현재 사용자 정보
const {
  data: { user },
} = await supabase.auth.getUser();
```

### 1.2 Actions 관리 API

```typescript
// Actions 목록 조회
const { data: actions, error } = await supabase
  .from("actions")
  .select("*")
  .order("created_at", { ascending: false });

// Action 생성
const { data, error } = await supabase.from("actions").insert([
  {
    name: "Google Contact 싱크",
    template_type: "google_contact_sync",
    status: "inactive",
    config: {},
  },
]);

// Action 업데이트
const { data, error } = await supabase
  .from("actions")
  .update({
    status: "active",
    last_executed_at: new Date().toISOString(),
  })
  .eq("id", actionId);
```

### 1.3 OAuth 토큰 관리 API

```typescript
// OAuth 토큰 저장
const { data, error } = await supabase.from("oauth_tokens").insert([
  {
    action_id: actionId,
    provider: "google",
    access_token: encryptedToken,
    refresh_token: encryptedRefreshToken,
    expires_at: expiresAt,
    scope: "https://www.googleapis.com/auth/contacts.readonly",
  },
]);

// OAuth 토큰 조회
const { data: tokens, error } = await supabase
  .from("oauth_tokens")
  .select("*")
  .eq("action_id", actionId)
  .eq("provider", "google");
```

## 2. Supabase Edge Functions

### 2.1 Google OAuth 콜백 처리

```typescript
// /functions/oauth/google/callback.ts
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { code, state } = await req.json();

  try {
    // Google OAuth 토큰 교환
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        redirect_uri: Deno.env.get("GOOGLE_REDIRECT_URI")!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    // 사용자 정보 조회
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const userInfo = await userResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        user: userInfo,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 2.2 Notion OAuth 콜백 처리

```typescript
// /functions/oauth/notion/callback.ts
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { code, state } = await req.json();

  try {
    // Notion OAuth 토큰 교환
    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(
          `${Deno.env.get("NOTION_CLIENT_ID")}:${Deno.env.get(
            "NOTION_CLIENT_SECRET"
          )}`
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: Deno.env.get("NOTION_REDIRECT_URI")!,
      }),
    });

    const tokens = await tokenResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        tokens: {
          access_token: tokens.access_token,
          workspace_name: tokens.workspace_name,
          workspace_id: tokens.workspace_id,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

## 3. 외부 API 연동

### 3.1 Google Contacts API

```typescript
// Google Contacts 목록 조회
const contactsResponse = await fetch(
  "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);

const contactsData = await contactsResponse.json();
```

### 3.2 Notion API

```typescript
// Notion 데이터베이스에 페이지 생성
const notionResponse = await fetch("https://api.notion.com/v1/pages", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${notionToken}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  },
  body: JSON.stringify({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: contactName } }],
      },
      Email: {
        email: contactEmail,
      },
      Phone: {
        phone_number: contactPhone,
      },
    },
  }),
});
```

## 4. 프론트엔드 API 호출

### 4.1 OAuth 로그인 처리

```typescript
// Google OAuth 로그인
const initiateGoogleOAuth = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/oauth/google/callback`;
  const scope = "https://www.googleapis.com/auth/contacts.readonly";

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${generateRandomState()}`;

  window.open(authUrl, "google-oauth", "width=500,height=600");
};

// Notion OAuth 로그인
const initiateNotionOAuth = () => {
  const clientId = import.meta.env.VITE_NOTION_CLIENT_ID;
  const redirectUri = `${window.location.origin}/oauth/notion/callback`;

  const authUrl =
    `https://api.notion.com/v1/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `owner=user&` +
    `state=${generateRandomState()}`;

  window.open(authUrl, "notion-oauth", "width=500,height=600");
};
```

### 4.2 실시간 업데이트

```typescript
// Supabase Realtime으로 Actions 테이블 구독
const subscription = supabase
  .channel("actions-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "actions",
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      console.log("Action updated:", payload);
      // UI 업데이트 로직
      updateActionsTable(payload);
    }
  )
  .subscribe();
```

## 5. 에러 처리

### 5.1 API 에러 코드

```typescript
enum ApiErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMITED = 429,
  INTERNAL_ERROR = 500,
  OAUTH_ERROR = "OAUTH_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_SCOPE = "INVALID_SCOPE",
}
```

### 5.2 에러 처리 로직

```typescript
const handleApiError = (error: any) => {
  switch (error.code) {
    case ApiErrorCode.UNAUTHORIZED:
      // 로그인 페이지로 리다이렉트
      navigate("/login");
      break;
    case ApiErrorCode.TOKEN_EXPIRED:
      // 토큰 갱신 시도
      refreshToken();
      break;
    case ApiErrorCode.OAUTH_ERROR:
      // OAuth 에러 메시지 표시
      showErrorMessage("인증에 실패했습니다. 다시 시도해주세요.");
      break;
    default:
      showErrorMessage("알 수 없는 오류가 발생했습니다.");
  }
};
```
