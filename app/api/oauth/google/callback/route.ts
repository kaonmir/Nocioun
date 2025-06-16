import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../../supabase/supabase-server";
import { parseOAuthState } from "../../../../../lib/oauth";

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json(
        { error: "필수 매개변수가 누락되었습니다." },
        { status: 400 }
      );
    }

    // state 파싱하여 user_id 추출
    const stateData = parseOAuthState(state);
    if (!stateData || !stateData.userId) {
      return NextResponse.json(
        { error: "잘못된 state 매개변수입니다." },
        { status: 400 }
      );
    }

    // Google OAuth 토큰 교환 - 서버에서만 실행
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!, // NEXT_PUBLIC_ 제거
        redirect_uri: `${
          process.env.NEXTAUTH_URL || `${request.nextUrl.origin}`
        }/oauth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.json(
        { error: "토큰 교환에 실패했습니다." },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.json(
        { error: "액세스 토큰을 받지 못했습니다." },
        { status: 400 }
      );
    }

    // 토큰을 데이터베이스에 저장
    const { error: dbError } = await supabaseServer.from("oauth_tokens").upsert(
      {
        user_id: stateData.userId,
        provider: "google",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(
          Date.now() + tokens.expires_in * 1000
        ).toISOString(),
        token_type: tokens.token_type || "Bearer",
        scope: tokens.scope,
      },
      {
        onConflict: "user_id,provider",
      }
    );

    if (dbError) {
      console.error("Database save failed:", dbError);
      return NextResponse.json(
        { error: `데이터베이스 저장 실패: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google 계정 연결이 완료되었습니다!",
    });
  } catch (error) {
    console.error("OAuth API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `연결 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
