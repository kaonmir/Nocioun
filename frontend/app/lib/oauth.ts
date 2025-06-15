import { supabase } from "./supabase";

// OAuth 상태 생성 함수
export const generateOAuthState = (userId: string) => {
  return btoa(JSON.stringify({ userId, timestamp: Date.now() }));
};

// OAuth 상태 파싱 함수
export const parseOAuthState = (state: string) => {
  try {
    return JSON.parse(atob(state));
  } catch {
    return null;
  }
};

// Google OAuth 로그인 시작
export const initiateGoogleOAuth = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("사용자 인증이 필요합니다.");
  }

  // 환경변수에서 Google OAuth 설정 가져오기
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/oauth/google/callback`;
  const scope = "https://www.googleapis.com/auth/contacts.readonly";

  // 사용자 ID를 state에 포함
  const state = generateOAuthState(data.user.id);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  // 새 탭에서 OAuth 진행
  window.open(authUrl.toString(), "_blank");

  // Promise를 반환하여 호출자가 처리할 수 있도록 함
  return Promise.resolve({ success: true });
};

// OAuth 토큰 조회
export const getOAuthToken = async (provider: string) => {
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("*")
    .eq("provider", provider)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// OAuth 토큰 갱신
export const refreshOAuthToken = async (tokenId: string) => {
  const { data: token } = await supabase
    .from("oauth_tokens")
    .select("*")
    .eq("id", tokenId)
    .single();

  if (!token?.refresh_token) {
    throw new Error("리프레시 토큰이 없습니다.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    }),
  });

  const newTokens = await response.json();

  if (!newTokens.access_token) {
    throw new Error("토큰 갱신에 실패했습니다.");
  }

  // 새 토큰으로 업데이트
  const { error } = await supabase
    .from("oauth_tokens")
    .update({
      access_token: newTokens.access_token,
      expires_at: new Date(
        Date.now() + newTokens.expires_in * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenId);

  if (error) {
    throw error;
  }

  return newTokens.access_token;
};

// Google Contacts API 호출
export const getGoogleContacts = async (accessToken: string) => {
  const response = await fetch(
    "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Google Contacts API 호출에 실패했습니다.");
  }

  const data = await response.json();
  return data.connections || [];
};
