import { supabase } from "../../supabase/supabase";

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

// OAuth 토큰 조회 (자동 refresh 포함)
export const getOAuthToken = async (provider: string) => {
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("*")
    .eq("provider", provider)
    .single();

  if (error) {
    throw error;
  }

  // 토큰 만료 확인 (5분 여유를 두고 체크)
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (expiresAt <= fiveMinutesFromNow && data.refresh_token) {
    // 토큰이 만료되었거나 곧 만료될 예정이면 refresh
    try {
      const refreshedToken = await refreshOAuthToken(
        provider,
        data.refresh_token,
        data.user_id
      );
      return refreshedToken;
    } catch (refreshError) {
      console.error("토큰 갱신 실패:", refreshError);
      throw new Error(
        "토큰이 만료되었고 갱신에 실패했습니다. 다시 연결해주세요."
      );
    }
  }

  return data;
};

// OAuth 토큰 갱신 (서버 API 호출)
export const refreshOAuthToken = async (
  provider: string,
  refreshToken: string,
  userId: string
) => {
  const response = await fetch("/api/oauth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider,
      refreshToken,
      userId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "토큰 갱신에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
};

// Google Contacts API 호출
export const getGoogleContacts = async (accessToken: string) => {
  const response = await fetch(
    // addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined
    "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&sortOrder=LAST_MODIFIED_DESCENDING&pageSize=1000",
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

// Notion OAuth 로그인 시작
export const initiateNotionOAuth = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("사용자 인증이 필요합니다.");
  }

  // 환경변수에서 Notion OAuth 설정 가져오기
  const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID!;
  const redirectUri = `${window.location.origin}/oauth/notion/callback`;

  // 사용자 ID를 state에 포함
  const state = generateOAuthState(data.user.id);

  const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("owner", "user");
  authUrl.searchParams.set("state", state);

  // 새 탭에서 OAuth 진행
  window.open(authUrl.toString(), "_blank");

  // Promise를 반환하여 호출자가 처리할 수 있도록 함
  return Promise.resolve({ success: true });
};

// Notion 데이터베이스 목록 조회 (백엔드 API 호출)
export const getNotionDatabases = async (userId: string) => {
  try {
    const response = await fetch(
      `/api/notion/databases?userId=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "데이터베이스 목록 조회에 실패했습니다."
      );
    }

    const data = await response.json();
    return data.databases;
  } catch (error) {
    console.error("Notion database search error:", error);
    throw new Error("Notion 데이터베이스 목록을 가져오는데 실패했습니다.");
  }
};

// Notion 데이터베이스 속성 가져오기 (백엔드 API 호출)
export const getNotionDatabaseProperties = async (
  userId: string,
  databaseId: string
) => {
  try {
    const response = await fetch(
      `/api/notion/database-properties?userId=${encodeURIComponent(
        userId
      )}&databaseId=${encodeURIComponent(databaseId)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "데이터베이스 속성 조회에 실패했습니다."
      );
    }

    const data = await response.json();
    return data.properties;
  } catch (error) {
    console.error("Notion database properties error:", error);
    throw new Error("Notion 데이터베이스 속성을 가져오는데 실패했습니다.");
  }
};
