import { PlaceData } from "./types";

/**
 * Notion 데이터베이스에서 사용하는 컬럼 정의
 */
export const REQUIRED_COLUMNS = [
  "address",
  "homepage",
  "phone_number",
  "link",
  "nav_link",
] as const;

export type RequiredColumnName = (typeof REQUIRED_COLUMNS)[number];

/**
 * 각 컬럼의 Notion 속성 타입 정의
 */
export const COLUMN_TYPE_MAP: Record<RequiredColumnName, any> = {
  address: { rich_text: {} },
  homepage: { url: {} },
  phone_number: { phone_number: {} },
  link: { url: {} },
  nav_link: { url: {} },
};

/**
 * 컬럼 타입 검증을 위한 예상 타입 맵
 */
export const EXPECTED_COLUMN_TYPES: Record<RequiredColumnName, string> = {
  address: "rich_text",
  homepage: "url",
  phone_number: "phone_number",
  link: "url",
  nav_link: "url",
};

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

  // 주소
  if (placeData.address) {
    properties.address = {
      rich_text: [
        {
          text: {
            content: placeData.address,
          },
        },
      ],
    };
  }

  // 홈페이지
  if (placeData.homepage) {
    properties.homepage = {
      url: placeData.homepage,
    };
  }

  // 전화번호
  if (placeData.phone_number) {
    properties.phone_number = {
      phone_number: placeData.phone_number,
    };
  }

  // 링크
  if (placeData.link) {
    properties.link = {
      url: placeData.link,
    };
  }

  // 네비게이션 링크
  if (placeData.nav_link) {
    properties.nav_link = {
      url: placeData.nav_link,
    };
  }

  return properties;
}

/**
 * 데이터베이스에 추가할 컬럼들의 속성 정의를 생성
 */
export function generateColumnProperties(
  columnsToAdd: string[]
): Record<string, any> {
  const properties: Record<string, any> = {};

  columnsToAdd.forEach((column) => {
    if (column in COLUMN_TYPE_MAP) {
      properties[column] = COLUMN_TYPE_MAP[column as RequiredColumnName];
    }
  });

  return properties;
}

/**
 * 누락된 컬럼 찾기
 */
export function findMissingColumns(existingColumns: string[]): string[] {
  return REQUIRED_COLUMNS.filter((col) => !existingColumns.includes(col));
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

  Object.entries(EXPECTED_COLUMN_TYPES).forEach(
    ([columnName, expectedType]) => {
      const property = properties[columnName];
      if (property && property.type !== expectedType) {
        invalidColumns.push({
          name: columnName,
          currentType: property.type,
          expectedType: expectedType,
        });
      }
    }
  );

  return {
    isValid: invalidColumns.length === 0,
    invalidColumns,
  };
}
