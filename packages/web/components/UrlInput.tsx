"use client";

import { useState } from "react";

interface UrlInputProps {
  onUrlValidated: (url: string, validationData: any) => void;
  onBack: () => void;
}

// 카카오맵 URL을 추출하는 함수
function extractKakaoMapUrl(input: string): string | null {
  // 입력에서 불순물을 제거하고 URL 패턴을 찾는 regex들
  const urlPatterns = [
    // 일반 카카오맵 URL
    /https?:\/\/place\.map\.kakao\.com\/\d+/g,
    // 카카오 단축 URL
    /https?:\/\/kko\.kakao\.com\/[a-zA-Z0-9]+/g,
    // 모바일 카카오맵 URL
    /https?:\/\/m\.place\.map\.kakao\.com\/\d+/g,
    // map.kakao.com itemId 형식 URL
    /https?:\/\/map\.kakao\.com\/[^?\s]*\?[^?\s]*itemId=\d+[^?\s]*/g,
  ];

  for (const pattern of urlPatterns) {
    const matches = input.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }

  return null;
}

// API route를 통해 URL 검증 및 장소를 가져오는 함수
// Result Type은 @result.json 참고
async function getPlaceInfo(url: string): Promise<any> {
  try {
    const response = await fetch("/api/kakao-map", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        isValid: false,
        error: data.error || "서버에서 오류가 발생했습니다.",
      };
    }

    return data;
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "네트워크 오류가 발생했습니다.",
    };
  }
}

export function UrlInput({ onUrlValidated, onBack }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string>("");

  const handleValidate = async () => {
    if (!url.trim()) {
      setError("URL을 입력해주세요.");
      return;
    }

    try {
      setValidating(true);
      setError("");

      // 입력에서 카카오맵 URL 추출
      const extractedUrl = extractKakaoMapUrl(url.trim());

      if (!extractedUrl) {
        throw new Error(
          "카카오맵 URL을 찾을 수 없습니다. 올바른 URL을 입력해주세요."
        );
      }

      // URL 유효성 검증 및 실제 장소 가져오기
      const placeInfo = await getPlaceInfo(extractedUrl);

      if (placeInfo && placeInfo.summary) {
        onUrlValidated(extractedUrl, placeInfo);
      } else {
        throw new Error("URL이 유효하지 않습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !validating) {
      handleValidate();
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  const examples = [
    {
      type: "일반 링크",
      url: "https://place.map.kakao.com/2035117814",
      description: "두부공방",
    },
    {
      type: "지도 링크",
      url: "https://map.kakao.com/?map_type=TYPE_MAP&itemId=1452114214&urlLevel=3",
      description: "밥식구",
    },
    {
      type: "단축 링크",
      url: "https://kko.kakao.com/RuZUTLJ96t",
      description: "하노이스토리",
    },
    {
      type: "공유 링크",
      url: "[카카오맵] 모던샤브하우스 센트럴시티점 https://kko.kakao.com/lQsjQ16u3V",
      description: "모던샤브하우스 센트럴시티점",
    },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          카카오맵 링크 입력하기
        </h2>
        <p className="text-gray-600">
          저장할 장소의 카카오맵 링크를 입력해 주세요.
        </p>
        <p className="text-gray-600">
          앱에서 <b>공유 {">"} URL 복사</b>를 눌러 링크를 붙여넣어 주세요!
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          카카오맵 URL
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://place.map.kakao.com/... 또는 https://kko.kakao.com/..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={validating}
          />
          <button
            onClick={handleValidate}
            disabled={validating || !url.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {validating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                검증 중...
              </span>
            ) : (
              "검증하기"
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">예시 URL:</h3>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <div
              key={index}
              onClick={() => handleExampleClick(example.url)}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition duration-200 group overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 flex-shrink-0">
                      {example.type}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {example.description}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-gray-700 group-hover:text-blue-700 break-all leading-relaxed">
                    {example.url}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
        >
          ← 이전으로
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          지원되는 URL 형식:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 일반 카카오맵 링크: https://place.map.kakao.com/숫자ID</li>
          <li>• 카카오 단축 링크: https://kko.kakao.com/단축코드</li>
          <li>• map.kakao.com 링크: https://map.kakao.com/?itemId=숫자ID</li>
          <li>
            • 텍스트에 포함된 링크: &quot;[카카오맵] 장소명 https://...&quot;
          </li>
        </ul>
      </div>
    </div>
  );
}
