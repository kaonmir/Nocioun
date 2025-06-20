import { NextRequest, NextResponse } from "next/server";
import { NotionService } from "@/lib/notion";
import { convertPlaceInfoToNotionData } from "../../../../../core/map/properties/place-converter";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("notion_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { placeInfo, databaseId, url } = await request.json();

    if (!placeInfo || !databaseId) {
      return NextResponse.json(
        { error: "장소 정보와 데이터베이스 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 장소 정보를 Notion 데이터 형태로 변환
    const placeData = convertPlaceInfoToNotionData(placeInfo, url);

    // Notion 데이터베이스에 추가
    const notionService = new NotionService(accessToken);
    await notionService.addPlaceToDatabase(databaseId, placeData);

    return NextResponse.json({
      success: true,
      message: "장소가 성공적으로 추가되었습니다.",
      placeData,
    });
  } catch (error) {
    console.error("Error adding place:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "장소 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
