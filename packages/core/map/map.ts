/**
 * 카카오맵 URL에서 장소를 가져오는 모듈
 */

// ========== 타입 정의 ==========

/** 지원되는 카카오맵 URL 타입 */
export type KakaoMapUrlType = "place" | "short" | "mobile" | "legacy";

// ========== 상수 정의 ==========

/** 지원되는 카카오맵 호스트명 */
const SUPPORTED_HOSTS = [
  "place.map.kakao.com",
  "kko.kakao.com",
  "m.place.map.kakao.com",
  "map.kakao.com",
] as const;

/** 카카오맵 API 기본 URL */
const KAKAO_PLACE_API_BASE = "https://place-api.map.kakao.com/places/panel3";

/** URL 패턴 정규식 */
const URL_PATTERN = /https?:\/\/[^\s]+/g;

/** 각 호스트별 경로 패턴 */
const PATH_PATTERNS = {
  "place.map.kakao.com": /^\/(\d+)\/?$/,
  "kko.kakao.com": /^\/[a-zA-Z0-9_-]+\/?$/,
  "m.place.map.kakao.com": /^\/(\d+)\/?$/,
  "map.kakao.com": /^\//,
} as const;

// ========== 커스텀 에러 클래스 ==========

/** 카카오맵 관련 에러 */
export class KakaoMapError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "KakaoMapError";
  }
}

/** URL 파싱 에러 */
export class UrlParsingError extends KakaoMapError {
  constructor(message: string) {
    super(message, "URL_PARSING_ERROR");
  }
}

/** API 요청 에러 */
export class ApiRequestError extends KakaoMapError {
  constructor(message: string, public status?: number) {
    super(message, "API_REQUEST_ERROR");
  }
}

// ========== 유틸리티 함수 ==========

/**
 * 안전하게 URL 객체를 생성합니다
 */
function createSafeUrl(url: string): URL {
  try {
    return new URL(url);
  } catch (error) {
    throw new UrlParsingError(`잘못된 URL 형식: ${url}`);
  }
}

/**
 * 호스트명이 지원되는지 확인합니다
 */
function isSupportedHost(
  hostname: string
): hostname is (typeof SUPPORTED_HOSTS)[number] {
  return SUPPORTED_HOSTS.includes(hostname as any);
}

// ========== 메인 함수들 ==========

/**
 * 입력 문자열에서 URL을 추출합니다
 * @param input - 텍스트 입력 (예: "[카카오맵] 백현중학교 https://kko.kakao.com/jI38cVt8Lj")
 * @returns 추출된 URL
 * @throws UrlParsingError - URL을 찾을 수 없는 경우
 */
function extractUrlFromInput(input: string): string {
  const matches = input.match(URL_PATTERN);

  if (!matches || matches.length === 0) {
    throw new UrlParsingError("입력 문자열에서 URL을 찾을 수 없습니다");
  }

  return matches[0];
}

/**
 * 특정 호스트의 URL 유효성을 검증합니다
 */
function validateHostSpecificUrl(urlObj: URL): {
  isValid: boolean;
  type?: "place" | "short" | "mobile" | "legacy";
  error?: string;
} {
  const { hostname, pathname, searchParams } = urlObj;

  switch (hostname) {
    case "place.map.kakao.com":
      if (!PATH_PATTERNS["place.map.kakao.com"].test(pathname)) {
        return {
          isValid: false,
          error: "잘못된 place.map.kakao.com 형식입니다. 예: /숫자ID",
        };
      }
      return { isValid: true, type: "place" };

    case "kko.kakao.com":
      if (!PATH_PATTERNS["kko.kakao.com"].test(pathname)) {
        return {
          isValid: false,
          error: "잘못된 kko.kakao.com 형식입니다. 예: /단축코드",
        };
      }
      return { isValid: true, type: "short" };

    case "m.place.map.kakao.com":
      if (!PATH_PATTERNS["m.place.map.kakao.com"].test(pathname)) {
        return {
          isValid: false,
          error: "잘못된 m.place.map.kakao.com 형식입니다. 예: /숫자ID",
        };
      }
      return { isValid: true, type: "mobile" };

    case "map.kakao.com":
      const itemId = searchParams.get("itemId");
      if (!itemId || !/^\d+$/.test(itemId)) {
        return {
          isValid: false,
          error: "잘못된 map.kakao.com 형식입니다. 예: ?itemId=숫자",
        };
      }
      return { isValid: true, type: "legacy" };

    default:
      return {
        isValid: false,
        error: `예상치 못한 호스트명: ${hostname}`,
      };
  }
}

/**
 * 입력된 URL이 유효한 카카오맵 URL인지 판별합니다
 * @param url - 검증할 URL
 * @returns 유효성 검증 결과
 */
export function isValidKakaoMapUrl(url: string): {
  isValid: boolean;
  type?: "place" | "short" | "mobile" | "legacy";
  error?: string;
} {
  try {
    const urlObj = createSafeUrl(url);

    if (!isSupportedHost(urlObj.hostname)) {
      return {
        isValid: false,
        error: `지원되지 않는 호스트: ${
          urlObj.hostname
        }. 지원되는 호스트: ${SUPPORTED_HOSTS.join(", ")}`,
      };
    }

    return validateHostSpecificUrl(urlObj);
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 단축 URL을 해결합니다
 */
async function resolveShortUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: "GET", redirect: "manual" });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new ApiRequestError("리다이렉트 위치를 찾을 수 없습니다");
      }
      return location;
    } else {
      throw new ApiRequestError("단축 URL을 해결할 수 없습니다");
    }
  } catch (error) {
    if (error instanceof KakaoMapError) {
      throw error;
    }
    throw new ApiRequestError(
      `단축 URL 해결 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * URL에서 place_id를 추출합니다
 */
async function extractPlaceIdFromUrl(url: string): Promise<string> {
  const urlObj = createSafeUrl(url);

  // kko.kakao.com 단축 URL인 경우 리다이렉트 URL로 변환
  if (urlObj.hostname === "kko.kakao.com") {
    const resolvedUrl = await resolveShortUrl(url);
    return extractPlaceIdFromUrl(resolvedUrl);
  }

  // 각 호스트별 place_id 추출
  switch (urlObj.hostname) {
    case "place.map.kakao.com":
    case "m.place.map.kakao.com":
      const match = urlObj.pathname.match(/^\/(\d+)\/?$/);
      if (!match) {
        throw new UrlParsingError(`잘못된 URL 형식: ${url}`);
      }
      return match[1];

    case "map.kakao.com":
      const itemId = urlObj.searchParams.get("itemId");
      if (!itemId || !/^\d+$/.test(itemId)) {
        throw new UrlParsingError("잘못된 map.kakao.com 형식입니다");
      }
      return itemId;

    default:
      throw new UrlParsingError(`지원되지 않는 호스트: ${urlObj.hostname}`);
  }
}

/**
 * 카카오맵 URL에서 place_id를 파싱합니다
 * @param url - 카카오맵 URL
 * @returns place_id
 * @throws UrlParsingError - URL 형식이 올바르지 않은 경우
 */
async function parsePlaceId(url: string): Promise<string> {
  try {
    return await extractPlaceIdFromUrl(url);
  } catch (error) {
    if (error instanceof KakaoMapError) {
      throw error;
    }
    throw new UrlParsingError(`URL 파싱 실패: ${url}`);
  }
}

/**
 * 카카오맵 API에서 장소를 가져옵니다
 * @param placeId - 장소 ID
 * @returns API 응답 데이터
 * @throws ApiRequestError - API 요청 실패 시
 */
async function fetchPlaceInfo(placeId: string): Promise<any> {
  const apiUrl = `${KAKAO_PLACE_API_BASE}/${placeId}`;

  const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    dnt: "1",
    origin: "https://place.map.kakao.com",
    pf: "web",
    priority: "u=1, i",
    referer: "https://place.map.kakao.com/",
    "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new ApiRequestError(
        `HTTP 오류! 상태: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof KakaoMapError) {
      throw error;
    }
    throw new ApiRequestError(
      `장소 가져오기 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * 카카오맵 URL 또는 텍스트 입력을 받아서 장소를 가져오는 메인 함수
 * @param input - 카카오맵 URL 또는 URL이 포함된 텍스트
 * @returns 장소 데이터
 * @throws KakaoMapError - 처리 과정에서 오류 발생 시
 */
export async function getPlaceInfo(input: string): Promise<any> {
  // 입력에서 URL 추출 (URL이 아닌 경우 그대로 사용)
  let url: string;
  try {
    // URL 형식인지 확인
    createSafeUrl(input);
    url = input;
  } catch {
    // URL이 아닌 경우 텍스트에서 URL 추출
    url = extractUrlFromInput(input);
  }

  // place_id 파싱 및 장소 가져오기
  const placeId = await parsePlaceId(url);
  return await fetchPlaceInfo(placeId);
}

/**
 * 사용 예시:
 * ```typescript
 * import { getPlaceInfo, getPlaceSummary, isValidKakaoMapUrl } from './map';
 *
 * try {
 *   // URL 유효성 검증
 *   const validation = isValidKakaoMapUrl('https://place.map.kakao.com/26573290');
 *   if (!validation.isValid) {
 *     console.error('Invalid URL:', validation.error);
 *     return;
 *   }
 *
 *   // 직접 URL 입력
 *   const placeData1 = await getPlaceInfo('https://place.map.kakao.com/26573290');
 *
 *   // 단축 URL 입력
 *   const placeData2 = await getPlaceInfo('https://kko.kakao.com/jI38cVt8Lj');
 *
 *   // 텍스트에 포함된 URL 입력
 *   const placeData3 = await getPlaceInfo('[카카오맵] 백현중학교 https://kko.kakao.com/jI38cVt8Lj');
 *
 *   // 요약 정보만 가져오기
 *   const summary = await getPlaceSummary('https://place.map.kakao.com/26573290');
 *
 *   console.log(placeData1);
 *   console.log(summary);
 * } catch (error) {
 *   if (error instanceof KakaoMapError) {
 *     console.error('카카오맵 오류:', error.message, error.code);
 *   } else {
 *     console.error('예상치 못한 오류:', error);
 *   }
 * }
 * ```
 */
