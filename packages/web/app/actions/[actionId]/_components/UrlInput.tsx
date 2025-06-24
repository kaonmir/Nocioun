"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReloadIcon, CheckIcon, ClipboardIcon } from "@radix-ui/react-icons";

interface UrlInputProps {
  onUrlValidated: (url: string, validationData: any) => void;
  onBack: () => void;
  hideBackButton?: boolean;
  compact?: boolean;
}

// 카카오맵 URL을 추출하는 함수
function extractKakaoMapUrl(input: string): string | null {
  // 입력에서 불순물을 제거하고 URL 패턴을 찾는 regex들
  const urlPatterns = [
    // 일반 카카오맵 URL
    /https?:\/\/place\.map\.kakao\.com\/\d+/g,
    // 카카오 단축 URL
    /https?:\/\/kko\.kakao\.com\/[a-zA-Z0-9_-]+/g,
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

export function UrlInput({
  onUrlValidated,
  onBack,
  hideBackButton = false,
  compact = false,
}: UrlInputProps) {
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
    <Card className={compact ? "border-none shadow-none" : "border-none"}>
      {!compact && (
        <CardHeader className="text-center">
          <CardTitle>카카오맵 링크 입력하기</CardTitle>
          <CardDescription>
            저장할 장소의 카카오맵 링크를 입력해 주세요.
          </CardDescription>
          <p className="text-gray-600 text-sm">
            앱에서 <b>공유 {">"} URL 복사</b>를 눌러 링크를 붙여넣어 주세요!
          </p>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label htmlFor="url">카카오맵 URL</Label>
          <div className="flex space-x-3">
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://place.map.kakao.com/... 또는 https://kko.kakao.com/..."
              disabled={validating}
              className="flex-1"
            />
            <Button
              onClick={handleValidate}
              disabled={validating || !url.trim()}
              className="whitespace-nowrap flex-shrink-0"
            >
              {validating ? (
                <>
                  <ReloadIcon className="animate-spin h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">검증 중...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">검증하기</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {!compact && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">예시 URL:</h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors group overflow-hidden"
                  onClick={() => handleExampleClick(example.url)}
                >
                  <CardContent className="p-3">
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
                      <ClipboardIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!hideBackButton && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onBack}>
              ← 이전으로
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
