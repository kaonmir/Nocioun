import { PlaceData, REQUIRED_COLUMNS } from "./columns";

/**
 * getPlaceInfo 결과를 Notion에 저장할 수 있는 PlaceData 형태로 변환합니다.
 *
 * 이 함수는 mock 구현입니다. 실제 구현에서는 카카오맵 API 응답을 파싱해서
 * Notion 데이터베이스에 저장할 수 있는 형태로 변환해야 합니다.
 *
 * @param placeInfo - getPlaceInfo에서 반환된 장소
 * @param originalUrl - 원본 카카오맵 URL
 * @returns Notion에 저장할 PlaceData
 */
export function convertPlaceInfoToNotionData(
  placeInfo: any,
  originalUrl: string
): PlaceData {
  // Mock 구현 - 실제로는 placeInfo에서 데이터를 추출해야 함
  const mockData: PlaceData = {
    name: placeInfo?.summary?.name || "장소명 없음",
    address: placeInfo?.summary?.address?.disp || "주소 정보 없음",
    homepage: placeInfo?.summary?.homepages?.[0] || "",

    // TODO: tel 아니고 다른 거가 올 수도 있음
    phone_number: placeInfo?.summary?.phone_numbers?.[0]?.tel || "",
    link: originalUrl,
    place_id: placeInfo?.summary?.confirm_id || "",
    photo_url: placeInfo?.photos?.photos?.[0]?.url || "",
  };

  return mockData;
}

/**
 * PlaceData를 Notion 속성으로 변환하는 함수
 */
export function convertPlaceDataToNotionProperties(
  placeData: PlaceData,
  titlePropertyName: string
): Record<string, any> {
  const properties: Record<string, any> = {};

  // 장소명 (Title 속성 사용)
  if (placeData.name) {
    properties[titlePropertyName] = {
      title: [
        {
          text: {
            content: placeData.name,
          },
        },
      ],
    };
  }

  // 나머지 속성들
  for (const column of REQUIRED_COLUMNS) {
    if (placeData[column.key]) {
      if (column.type === "rich_text") {
        properties[column.key] = {
          rich_text: [
            {
              text: {
                content: placeData[column.key] || "",
              },
            },
          ],
        };
      } else if (column.type === "url") {
        properties[column.key] = {
          url: placeData[column.key] || "",
        };
      } else if (column.type === "phone_number") {
        properties[column.key] = {
          phone_number: placeData[column.key] || "",
        };
      } else {
        // @ts-ignore
        throw new Error(`Unsupported column type: ${column.type}`);
      }
    }
  }

  return properties;
}

/**
 * 장소를 Notion 페이지에 추가할 블록들을 생성합니다.
 *
 * 이 함수도 mock 구현입니다. 실제로는 더 풍부한 콘텐츠를 생성할 수 있습니다.
 * 예: 사진, 리뷰, 영업시간, 방문자 통계 등
 *
 * @param placeData - getPlaceInfo에서 반환된 장소
 * @returns Notion 블록 배열
 */
export function createNotionBlocks(placeData: PlaceData): any[] {
  const blocks: any[] = [];

  // 카카오맵 링크 임베드 블록 추가
  return blocks;
}
