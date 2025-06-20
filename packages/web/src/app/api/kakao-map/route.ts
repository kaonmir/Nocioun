import { NextRequest, NextResponse } from "next/server";
import { getPlaceInfo, isValidKakaoMapUrl } from "../../../../../core/map/map";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    // URL 형식 검증
    const validation = isValidKakaoMapUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "올바른 카카오맵 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 장소 정보 가져오기
    const placeInfo = await getPlaceInfo(url);
    return NextResponse.json(placeInfo);
  } catch (error) {
    console.error("카카오맵 API 호출 오류:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "장소 정보를 가져올 수 없습니다.",
      },
      { status: 500 }
    );
  }
}
