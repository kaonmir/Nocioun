"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReloadIcon, CheckIcon, ClipboardIcon } from "@radix-ui/react-icons";
import { PlaceData, PlaceMapper } from "@/core";
import { proxyFetchAsBrowser } from "@/lib/utils";

interface UrlInputProps {
  onUrlValidated: (url: string, validationData: PlaceData) => void;
  compact?: boolean;
}

export function UrlInput({ onUrlValidated, compact = false }: UrlInputProps) {
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

      // API를 통해 URL 검증 및 장소 정보 가져오기
      const placeMapper = await PlaceMapper.create(url, proxyFetchAsBrowser);
      const placeData = await placeMapper.getData();

      onUrlValidated(url, placeData);
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
    <>
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
    </>
  );
}
