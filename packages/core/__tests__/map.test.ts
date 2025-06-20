import { getPlaceInfo } from "../map/map";

// fetch를 모킹합니다
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Response 헬퍼 함수
const createMockResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers({ "Content-Type": "application/json" }),
    statusText: status === 200 ? "OK" : "Error",
  } as Response);
};

const createMockErrorResponse = (status: number) => {
  return Promise.resolve({
    ok: false,
    status,
    headers: new Headers(),
    statusText: "Error",
  } as Response);
};

// 리다이렉트 응답 헬퍼 함수
const createMockRedirectResponse = (location: string, status = 302) => {
  const headers = new Headers();
  headers.set("location", location);
  return Promise.resolve({
    ok: false,
    status,
    headers,
    statusText: "Found",
  } as Response);
};

describe("카카오맵 모듈 테스트", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("URL 파싱 테스트", () => {
    test("올바른 카카오맵 URL에서 place_id를 추출해야 한다", async () => {
      // Mock API 응답
      const mockResponse = {
        basicInfo: {
          placenamefull: "테스트 장소",
          address: {
            newaddr: {
              newaddrfull: "서울특별시 강남구 테스트로 123",
            },
          },
        },
      };

      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      const result = await getPlaceInfo("https://place.map.kakao.com/26573290");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://place-api.map.kakao.com/places/panel3/26573290",
        {
          method: "GET",
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,ko;q=0.8",
            dnt: "1",
            origin: "https://place.map.kakao.com",
            pf: "web",
            priority: "u=1, i",
            referer: "https://place.map.kakao.com/",
            "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
          },
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test("다른 숫자 place_id도 올바르게 처리해야 한다", async () => {
      const mockResponse = { test: "data" };
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      await getPlaceInfo("https://place.map.kakao.com/123456789");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://place-api.map.kakao.com/places/panel3/123456789",
        expect.any(Object)
      );
    });
  });

  describe("잘못된 URL 형식 테스트", () => {
    test("place_id가 없는 URL은 에러를 던져야 한다", async () => {
      await expect(
        getPlaceInfo("https://place.map.kakao.com/")
      ).rejects.toThrow(
        "Invalid URL format. Expected format: https://place.map.kakao.com/{place_id}"
      );
    });

    test("place_id가 숫자가 아닌 경우 에러를 던져야 한다", async () => {
      await expect(
        getPlaceInfo("https://place.map.kakao.com/abc123")
      ).rejects.toThrow(
        "Invalid URL format. Expected format: https://place.map.kakao.com/{place_id}"
      );
    });

    test("추가 경로가 있는 URL은 에러를 던져야 한다", async () => {
      await expect(
        getPlaceInfo("https://place.map.kakao.com/123456/details")
      ).rejects.toThrow(
        "Invalid URL format. Expected format: https://place.map.kakao.com/{place_id}"
      );
    });

    test("URL이 포함되지 않은 텍스트는 에러를 던져야 한다", async () => {
      await expect(getPlaceInfo("not-a-url")).rejects.toThrow(
        "No URL found in the input string"
      );
    });

    test("빈 문자열은 에러를 던져야 한다", async () => {
      await expect(getPlaceInfo("")).rejects.toThrow(
        "No URL found in the input string"
      );
    });
  });

  describe("API 호출 테스트", () => {
    test("API 호출 실패시 적절한 에러를 던져야 한다", async () => {
      mockFetch.mockReturnValueOnce(createMockErrorResponse(404));

      await expect(
        getPlaceInfo("https://place.map.kakao.com/123456")
      ).rejects.toThrow("Failed to fetch place info: HTTP error! status: 404");
    });

    test("네트워크 에러시 적절한 에러를 던져야 한다", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        getPlaceInfo("https://place.map.kakao.com/123456")
      ).rejects.toThrow("Failed to fetch place info: Network error");
    });

    test("JSON 파싱 에러시 적절한 에러를 던져야 한다", async () => {
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error("Invalid JSON")),
          headers: new Headers(),
          statusText: "OK",
        } as Response)
      );

      await expect(
        getPlaceInfo("https://place.map.kakao.com/123456")
      ).rejects.toThrow("Failed to fetch place info: Invalid JSON");
    });

    test("알 수 없는 에러시 기본 메시지를 사용해야 한다", async () => {
      mockFetch.mockRejectedValueOnce("Unknown error");

      await expect(
        getPlaceInfo("https://place.map.kakao.com/123456")
      ).rejects.toThrow("Failed to fetch place info: Unknown error");
    });
  });

  describe("통합 테스트", () => {
    test("성공적인 전체 플로우", async () => {
      const mockPlaceData = {
        basicInfo: {
          placenamefull: "스타벅스 강남점",
          address: {
            newaddr: {
              newaddrfull: "서울특별시 강남구 테헤란로 123",
            },
          },
          phonenum: "02-1234-5678",
        },
        menuInfo: {
          menuList: [
            {
              menu: "아메리카노",
              price: "4500",
            },
          ],
        },
      };

      mockFetch.mockReturnValueOnce(createMockResponse(mockPlaceData));

      const result = await getPlaceInfo("https://place.map.kakao.com/26573290");

      expect(result).toEqual(mockPlaceData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("쿼리 파라미터가 있는 URL도 처리해야 한다", async () => {
      const mockResponse = { test: "data" };
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      const result = await getPlaceInfo(
        "https://place.map.kakao.com/123456?tab=comment"
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://place-api.map.kakao.com/places/panel3/123456",
        expect.any(Object)
      );
    });

    test("해시가 있는 URL도 처리해야 한다", async () => {
      const mockResponse = { test: "data" };
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      const result = await getPlaceInfo(
        "https://place.map.kakao.com/789012#section"
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://place-api.map.kakao.com/places/panel3/789012",
        expect.any(Object)
      );
    });
  });

  describe("URL 추출 테스트", () => {
    test("텍스트에서 URL을 추출해야 한다", async () => {
      const mockResponse = { test: "data" };

      // 1. 단축 URL 리다이렉트 모킹
      mockFetch.mockReturnValueOnce(
        createMockRedirectResponse("https://place.map.kakao.com/26573290")
      );

      // 2. 실제 API 호출 모킹
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      await getPlaceInfo(
        "[카카오맵] 백현중학교 https://kko.kakao.com/jI38cVt8Lj"
      );

      // 첫 번째 호출: 단축 URL 해결
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://kko.kakao.com/jI38cVt8Lj",
        {
          method: "HEAD",
          redirect: "manual",
        }
      );

      // 두 번째 호출: 실제 API 호출
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://place-api.map.kakao.com/places/panel3/26573290",
        expect.any(Object)
      );
    });

    test("URL이 포함되지 않은 텍스트는 에러를 던져야 한다", async () => {
      await expect(getPlaceInfo("카카오맵 백현중학교")).rejects.toThrow(
        "No URL found in the input string"
      );
    });

    test("여러 URL이 있는 경우 첫 번째 URL을 사용해야 한다", async () => {
      const mockResponse = { test: "data" };

      // 1. 단축 URL 리다이렉트 모킹
      mockFetch.mockReturnValueOnce(
        createMockRedirectResponse("https://place.map.kakao.com/111111")
      );

      // 2. 실제 API 호출 모킹
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      await getPlaceInfo(
        "첫 번째 https://kko.kakao.com/abc123 두 번째 https://place.map.kakao.com/222222"
      );

      // 첫 번째 URL이 사용되어야 함
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://kko.kakao.com/abc123",
        {
          method: "HEAD",
          redirect: "manual",
        }
      );
    });
  });

  describe("단축 URL 처리 테스트", () => {
    test("kko.kakao.com 단축 URL을 올바르게 처리해야 한다", async () => {
      const mockResponse = { test: "data" };

      // 1. 단축 URL 리다이렉트 모킹
      mockFetch.mockReturnValueOnce(
        createMockRedirectResponse("https://place.map.kakao.com/26573290")
      );

      // 2. 실제 API 호출 모킹
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      await getPlaceInfo("https://kko.kakao.com/jI38cVt8Lj");

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://kko.kakao.com/jI38cVt8Lj",
        {
          method: "HEAD",
          redirect: "manual",
        }
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://place-api.map.kakao.com/places/panel3/26573290",
        expect.any(Object)
      );
    });

    test("리다이렉트 Location 헤더가 없는 경우 에러를 던져야 한다", async () => {
      const headers = new Headers();
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: false,
          status: 302,
          headers,
          statusText: "Found",
        } as Response)
      );

      await expect(
        getPlaceInfo("https://kko.kakao.com/invalid")
      ).rejects.toThrow("No redirect location found in response");
    });

    test("단축 URL 요청 실패시 에러를 던져야 한다", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        getPlaceInfo("https://kko.kakao.com/invalid")
      ).rejects.toThrow("Failed to resolve short URL: Network error");
    });

    test("리다이렉트가 아닌 응답의 경우 원래 URL을 반환해야 한다", async () => {
      const mockResponse = { test: "data" };

      // place.map.kakao.com URL은 단축 URL 해결을 거치지 않고 바로 API 호출
      mockFetch.mockReturnValueOnce(createMockResponse(mockResponse));

      await getPlaceInfo("https://place.map.kakao.com/123456");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://place-api.map.kakao.com/places/panel3/123456",
        expect.any(Object)
      );
    });
  });

  describe("URL 형식 검증 테스트", () => {
    test("지원하지 않는 도메인은 에러를 던져야 한다", async () => {
      await expect(
        getPlaceInfo("https://maps.google.com/place/123456")
      ).rejects.toThrow("Unsupported URL format");
    });

    test("map.kakao.com itemId 형식은 아직 지원하지 않는다는 에러를 던져야 한다", async () => {
      await expect(
        getPlaceInfo("https://map.kakao.com/?itemId=123456")
      ).rejects.toThrow("map.kakao.com itemId format is not yet supported");
    });
  });
});
