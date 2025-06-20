// PlaceData 타입을 이 파일에서 정의합니다

/**
 * Notion 데이터베이스에서 사용하는 컬럼 정의
 */
export const REQUIRED_COLUMNS = [
  {
    key: "address",
    label: "주소",
    type: "rich_text",
    description: "장소의 상세 주소",
  },
  {
    key: "homepage",
    label: "홈페이지",
    type: "url",
    description: "장소 공식 웹사이트 URL",
  },
  {
    key: "phone_number",
    label: "전화번호",
    type: "phone_number",
    description: "연락처 정보",
  },
  {
    key: "link",
    label: "지도 링크",
    type: "url",
    description: "카카오맵 원본 링크",
  },
] as const;

/**
 * 장소 데이터 인터페이스
 * REQUIRED_COLUMNS 정의를 기반으로 타입 안전성을 보장합니다.
 */
export interface PlaceData
  extends Record<(typeof REQUIRED_COLUMNS)[number]["key"], any> {
  name: string;
  place_id: string;
  photo_url: string;
}

/**
 * 데이터베이스에 추가할 컬럼들의 속성 정의를 생성
 */
export function generateColumnProperties(
  columnsToAdd: string[]
): Record<string, any> {
  const properties: Record<string, any> = {};

  for (const column of columnsToAdd) {
    const requiredColumn = REQUIRED_COLUMNS.find((col) => col.key === column);
    if (requiredColumn) {
      properties[column] = { [requiredColumn.type]: {} };
    }
  }

  return properties;
}

/**
 * 누락된 컬럼 찾기
 */
export function findMissingColumns(existingColumns: string[]): string[] {
  return REQUIRED_COLUMNS.map((col) => col.key).filter(
    (col) => !existingColumns.includes(col)
  );
}

/**
 * 컬럼 타입 검증
 */
export function validateColumnTypes(
  properties: Record<string, { type: string }>
): {
  isValid: boolean;
  invalidColumns: Array<{
    name: string;
    currentType: string;
    expectedType: string;
  }>;
} {
  const invalidColumns: Array<{
    name: string;
    currentType: string;
    expectedType: string;
  }> = [];
  for (const { key, type } of REQUIRED_COLUMNS) {
    const property = properties[key];
    if (property && property.type !== type) {
      invalidColumns.push({
        name: key,
        currentType: property.type,
        expectedType: type,
      });
    }
  }

  return {
    isValid: invalidColumns.length === 0,
    invalidColumns,
  };
}
