import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // 사용자 메타데이터에서 Notion access token 가져오기
    const notionAccessToken = user.user_metadata?.notion_access_token;

    if (!notionAccessToken) {
      return NextResponse.json(
        { error: "Notion 연동이 필요합니다. 다시 로그인해주세요." },
        { status: 400 }
      );
    }

    // Notion 클라이언트 초기화
    const notion = new Client({
      auth: notionAccessToken,
    });

    // 데이터베이스 정보 가져오기
    const response = await notion.databases.retrieve({
      database_id: params.id,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Notion database fetch error:", error);

    // Notion API 에러가 인증 관련인 경우
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        {
          error:
            "Notion 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "데이터베이스 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
