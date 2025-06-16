import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { supabaseServer } from "../../../../supabase/supabase-server";

export async function GET(request: NextRequest) {
  try {
    // URL에서 파라미터 추출
    const userId = request.nextUrl.searchParams.get("userId");
    const databaseId = request.nextUrl.searchParams.get("databaseId");

    if (!userId || !databaseId) {
      return NextResponse.json(
        { error: "사용자 ID와 데이터베이스 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase에서 Notion 토큰 조회
    const { data: tokenData, error } = await supabaseServer
      .from("oauth_tokens")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "notion")
      .single();

    if (error || !tokenData) {
      return NextResponse.json(
        { error: "Notion 토큰을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Notion 클라이언트 생성
    const notion = new Client({
      auth: tokenData.access_token,
    });

    // 데이터베이스 속성 조회
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });

    return NextResponse.json({
      success: true,
      properties: response.properties,
    });
  } catch (error) {
    console.error("Notion database properties API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `데이터베이스 속성 조회 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
