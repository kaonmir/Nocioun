import { PlaceData } from "./types";

/**
 * getPlaceInfo 결과를 Notion에 저장할 수 있는 PlaceData 형태로 변환합니다.
 *
 * 이 함수는 mock 구현입니다. 실제 구현에서는 카카오맵 API 응답을 파싱해서
 * Notion 데이터베이스에 저장할 수 있는 형태로 변환해야 합니다.
 *
 * @param placeInfo - getPlaceInfo에서 반환된 장소 정보
 * @param originalUrl - 원본 카카오맵 URL
 * @returns Notion에 저장할 PlaceData
 */
export function convertPlaceInfoToNotionData(
  placeInfo: any,
  originalUrl: string
): PlaceData {
  // TODO: 실제 구현에서는 placeInfo의 구조를 분석해서 필요한 데이터를 추출

  // Mock 구현 - 실제로는 placeInfo에서 데이터를 추출해야 함
  const mockData: PlaceData = {
    name: placeInfo?.summary?.name || "장소명 없음",
    address: placeInfo?.summary?.address?.disp || "주소 정보 없음",
    homepage: placeInfo?.summary?.homepages?.[0] || "",
    phone_number: placeInfo?.summary?.phone_numbers?.[0]?.tel || "",
    link: originalUrl,
  };

  return mockData;
}

/**
 * 장소 정보를 Notion 페이지에 추가할 블록들을 생성합니다.
 *
 * 이 함수도 mock 구현입니다. 실제로는 더 풍부한 콘텐츠를 생성할 수 있습니다.
 * 예: 사진, 리뷰, 영업시간, 방문자 통계 등
 *
 * @param placeInfo - getPlaceInfo에서 반환된 장소 정보
 * @returns Notion 블록 배열
 */
export function createNotionBlocks(placeInfo: any): any[] {
  // TODO: 실제 구현에서는 다양한 Notion 블록 타입을 활용
  // - heading 블록으로 장소명
  // - paragraph 블록으로 설명
  // - image 블록으로 사진
  // - table 블록으로 정보 요약
  // - 등등...

  const blocks = [
    {
      object: "block",
      type: "heading_1",
      heading_1: {
        rich_text: [
          {
            type: "text",
            text: {
              content: placeInfo?.summary?.name || "장소명",
            },
          },
        ],
      },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: `주소: ${
                placeInfo?.summary?.address?.disp || "주소 정보 없음"
              }`,
            },
          },
        ],
      },
    },
    // 더 많은 블록들을 추가할 수 있습니다
  ];

  return blocks;
}
