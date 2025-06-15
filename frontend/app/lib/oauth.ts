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
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
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
