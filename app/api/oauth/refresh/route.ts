import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../supabase/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { provider, refreshToken, userId } = await request.json();

    if (!provider || !refreshToken || !userId) {
      return NextResponse.json(
        { error: "필수 매개변수가 누락되었습니다." },
        { status: 400 }
      );
    }

    if (provider === "google") {
      // Google 토큰 갱신
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Google token refresh failed:", errorData);
        return NextResponse.json(
          { error: "Google 토큰 갱신에 실패했습니다." },
          { status: 400 }
        );
      }

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        return NextResponse.json(
          { error: "새로운 액세스 토큰을 받지 못했습니다." },
          { status: 400 }
        );
      }

      // 갱신된 토큰을 데이터베이스에 저장
      const { data, error: dbError } = await supabaseServer
        .from("oauth_tokens")
        .update({
          access_token: tokens.access_token,
          expires_at: new Date(
            Date.now() + tokens.expires_in * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("provider", provider)
        .select()
        .single();

      if (dbError) {
        console.error("Database update failed:", dbError);
        return NextResponse.json(
          { error: `갱신된 토큰 저장 실패: ${dbError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "토큰이 성공적으로 갱신되었습니다.",
        data,
      });
    }

    return NextResponse.json(
      { error: `${provider} 토큰 갱신은 아직 지원되지 않습니다.` },
      { status: 400 }
    );
  } catch (error) {
    console.error("OAuth Refresh API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `토큰 갱신 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
