/**
 * 카카오맵 URL에서 장소를 가져오는 모듈
 */

// ========== 상수 정의 ==========

/** 카카오맵 API 기본 URL */
const KAKAO_PLACE_API_BASE = "https://place-api.map.kakao.com/places/panel3";

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

// ========== 카카오맵 서비스 클래스 ==========

export class KakaoMapService {
  constructor(
    private readonly fetchFn: (
      url: string,
      init?: RequestInit
    ) => Promise<Response>
  ) {}

  /**
   * 단축 URL을 해결합니다
   */
  private async resolveShortUrl(url: string): Promise<string> {
    try {
      const response = await this.fetchFn(url, {
        method: "GET",
        redirect: "manual",
      });

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
  private async extractPlaceIdFromUrl(url: string): Promise<string> {
    const urlObj = new URL(url);

    // kko.kakao.com 단축 URL인 경우 리다이렉트 URL로 변환
    if (urlObj.hostname === "kko.kakao.com") {
      const resolvedUrl = await this.resolveShortUrl(url);
      return this.extractPlaceIdFromUrl(resolvedUrl);
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
   * 카카오맵 API에서 장소를 가져옵니다
   * @param placeId - 장소 ID
   * @returns API 응답 데이터
   * @throws ApiRequestError - API 요청 실패 시
   */
  private async fetchPlaceInfo(placeId: string): Promise<any> {
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
      const response = await this.fetchFn(apiUrl, {
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
  public async getPlaceInfo(input: string): Promise<any> {
    try {
      const matches = input.match(/https?:\/\/[^\s]+/g);
      if (!matches || matches.length === 0) {
        throw new UrlParsingError("입력 문자열에서 URL을 찾을 수 없습니다");
      }

      const url = matches[0];
      const placeId = await this.extractPlaceIdFromUrl(url);
      return await this.fetchPlaceInfo(placeId);
    } catch (error) {
      if (error instanceof KakaoMapError) {
        throw error;
      }
      throw new UrlParsingError(`URL 파싱 실패: ${input}`);
    }
  }
}
