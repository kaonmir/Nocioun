"use client";

import { useState } from "react";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { DatabaseIcon } from "../../../../components/notion/DatabaseIcon";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CheckIcon, ReloadIcon, ExternalLinkIcon } from "@radix-ui/react-icons";

interface AddToNotionProps {
  database: DatabaseObjectResponse;
  url: string;
  placeInfo: any; // @result.json 참고
  onPlaceAdded: () => void;
  onBack: () => void;
  onAddMore: () => void;
  onChangeDatabase: () => void;
  hideBackButton?: boolean;
  compact?: boolean;
}

export function AddToNotion({
  database,
  url,
  placeInfo,
  onPlaceAdded,
  onBack,
  onAddMore,
  onChangeDatabase,
  hideBackButton = false,
  compact = false,
}: AddToNotionProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleAddToNotion = async () => {
    try {
      setAdding(true);
      setError("");

      const response = await fetch("/api/notion/add-place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeInfo,
          databaseId: database.id,
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "장소 추가에 실패했습니다.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setAdding(false);
    }
  };

  if (success) {
    return (
      <Card className={compact ? "border-none shadow-none" : "border-none"}>
        <CardContent className="text-center py-8 space-y-6">
          <div className="text-green-500 text-6xl">🎉</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              성공적으로 추가되었습니다!
            </h3>
            <p className="text-gray-600">
              <span className="font-semibold">{placeInfo.summary.name}</span>
              이(가) Notion 데이터베이스에 저장되었습니다.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onAddMore}>더 추가하기</Button>
            <Button asChild variant="secondary">
              <a
                href={`https://notion.so/${database.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Notion에서 보기
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? "border-none shadow-none" : "border-none"}>
      {!compact && (
        <CardHeader className="text-center">
          <CardTitle>Notion에 추가하기</CardTitle>
          <CardDescription>
            장소를 확인하고 Notion 데이터베이스에 저장하세요
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 장소 미리보기 */}
        <Card className="bg-gray-50">
          <CardContent className="px-6 py-4">
            <h4 className="font-medium mb-4 text-gray-900 flex items-center">
              <span className="mr-2">📍</span>
              장소 미리보기
            </h4>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                  장소명:
                </div>
                <div className="flex-1 text-sm text-gray-900 font-medium">
                  {placeInfo.summary.name}
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                  주소:
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {placeInfo.summary.address.disp}
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                  링크:
                </div>
                <div className="flex-1 text-sm text-blue-600 font-mono break-all">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {url}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 저장할 데이터베이스 */}
        <Card className="mb-6 hover:border-blue-300 transition duration-200">
          <CardContent className="px-6 py-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              저장할 데이터베이스
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DatabaseIcon icon={database.icon} className="mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {database.title?.[0]?.plain_text}
                  </p>
                  <p className="text-sm text-gray-500">
                    {database.description?.[0]?.plain_text}
                  </p>
                </div>
              </div>
              <a
                href={`https://notion.so/${database.id.replace(/-/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                title="데이터베이스 열기"
              >
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div
          className={`flex space-x-3 ${hideBackButton ? "justify-center" : ""}`}
        >
          <Button
            onClick={handleAddToNotion}
            disabled={adding}
            className={hideBackButton ? "" : "flex-1"}
          >
            {adding ? (
              <>
                <ReloadIcon className="animate-spin h-4 w-4 mr-2" />
                Notion에 추가 중...
              </>
            ) : (
              "Notion에 추가하기"
            )}
          </Button>

          {!hideBackButton && (
            <Button onClick={onBack} disabled={adding} variant="outline">
              뒤로가기
            </Button>
          )}
        </div>

        {/* 참고 사항 */}
        <div className="text-center text-xs text-gray-500">
          <p>
            데이터가 추가되면 Notion 데이터베이스에서 바로 확인할 수 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
