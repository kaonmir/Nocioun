import { ActionField } from "@/types/action";

// 카카오맵 액션의 필드 정의
export const MAP_ACTION_FIELDS: ActionField[] = [
  {
    key: "name",
    name: "장소명",
    description: "카카오맵에서 가져온 장소의 이름",
    notionPropertyType: "title",
    defaultNotionPropertyName: "장소명",
  },
  {
    key: "address",
    name: "주소",
    description: "장소의 전체 주소 정보",
    notionPropertyType: "rich_text",
    defaultNotionPropertyName: "주소",
  },
  {
    key: "phone",
    name: "전화번호",
    description: "장소의 연락처 정보",
    notionPropertyType: "phone_number",
    defaultNotionPropertyName: "전화번호",
  },
  {
    key: "category",
    name: "카테고리",
    description: "장소의 업종/카테고리",
    notionPropertyType: "select",
    defaultNotionPropertyName: "카테고리",
  },
  {
    key: "url",
    name: "카카오맵 URL",
    description: "카카오맵에서의 장소 링크",
    notionPropertyType: "url",
    defaultNotionPropertyName: "카카오맵 URL",
  },
  {
    key: "rating",
    name: "평점",
    description: "장소의 평점 정보",
    notionPropertyType: "number",
    defaultNotionPropertyName: "평점",
  },
];

// 액션 타입별 필드 매핑
export const ACTION_FIELDS_MAP: Record<string, ActionField[]> = {
  map: MAP_ACTION_FIELDS,
  // 향후 다른 액션 타입들 추가 가능
  // example: EXAMPLE_ACTION_FIELDS,
};

// 액션 타입별 필드를 가져오는 헬퍼 함수
export const getActionFields = (actionType: string): ActionField[] => {
  return ACTION_FIELDS_MAP[actionType] || [];
};
