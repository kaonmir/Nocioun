import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { supabaseServer } from "../../../../supabase/supabase-server";

export async function GET(request: NextRequest) {
  try {
    // URL에서 userId 추출
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
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

    // 데이터베이스 목록 조회
    const response = await notion.search({
      filter: {
        property: "object",
        value: "database",
      },
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    // 응답 데이터 포맷팅
    const formattedDatabases = response.results.map((db: any) => ({
      id: db.id,
      title:
        db.title?.length > 0
          ? db.title.map((t: any) => t.plain_text).join("")
          : "Untitled",
      url: db.url,
      last_edited_time: db.last_edited_time,
      created_time: db.created_time,
    }));

    return NextResponse.json({
      success: true,
      databases: formattedDatabases,
    });
  } catch (error) {
    console.error("Notion databases API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `데이터베이스 목록 조회 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
