import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

    // 요청 body에서 properties 가져오기
    const { properties } = await request.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json(
        { error: "추가할 프로퍼티 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // Notion 클라이언트 초기화
    const notion = new Client({
      auth: notionAccessToken,
    });

    // 새 프로퍼티들을 Notion API 형식으로 변환
    const notionProperties: Record<string, any> = {};

    for (const property of properties) {
      if (!property.name || !property.type) {
        return NextResponse.json(
          { error: "프로퍼티 이름과 타입이 필요합니다." },
          { status: 400 }
        );
      }

      // 프로퍼티 타입별로 구조 생성
      switch (property.type) {
        case "title":
          notionProperties[property.name] = { title: {} };
          break;
        case "rich_text":
          notionProperties[property.name] = { rich_text: {} };
          break;
        case "number":
          notionProperties[property.name] = { number: {} };
          break;
        case "select":
          notionProperties[property.name] = {
            select: {
              options: [],
            },
          };
          break;
        case "url":
          notionProperties[property.name] = { url: {} };
          break;
        case "phone_number":
          notionProperties[property.name] = { phone_number: {} };
          break;
        default:
          return NextResponse.json(
            { error: `지원하지 않는 프로퍼티 타입: ${property.type}` },
            { status: 400 }
          );
      }
    }

    // 데이터베이스 업데이트
    const response = await notion.databases.update({
      database_id: params.id,
      properties: notionProperties,
    });

    return NextResponse.json({
      success: true,
      message: "프로퍼티가 성공적으로 추가되었습니다.",
      properties: response.properties,
    });
  } catch (error) {
    console.error("Notion properties creation error:", error);

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
      { error: "프로퍼티 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
