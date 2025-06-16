import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../supabase/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { provider, userId } = await request.json();

    if (!provider || !userId) {
      return NextResponse.json(
        { error: "필수 매개변수가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 데이터베이스에서 OAuth 토큰 삭제
    const { error } = await supabaseServer
      .from("oauth_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider);

    if (error) {
      console.error("OAuth disconnect failed:", error);
      return NextResponse.json(
        { error: `연결 해제 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${provider} 연결이 해제되었습니다.`,
    });
  } catch (error) {
    console.error("OAuth Disconnect API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `연결 해제 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
