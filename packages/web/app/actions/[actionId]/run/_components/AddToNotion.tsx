"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, ReloadIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { getActionById, getFieldMappingsByActionId } from "@/lib/actions";
import { Action, FieldMapping } from "@/types/action";
import { PlaceData, PlaceMapper } from "@/core";
import { getNotionClient } from "@/lib/notion";
import { Client } from "@notionhq/client";
import { APIResponseError, APIErrorCode } from "@notionhq/client";
import { proxyFetchAsBrowser } from "@/lib/utils";

interface AddToNotionProps {
  actionId: string;
  url: string;
  placeInfo: PlaceData;
  onPlaceAdded: () => void;
  onBack: () => void;
  onAddMore: () => void;
  onChangeDatabase: () => void;
  hideBackButton?: boolean;
  compact?: boolean;
}

export function AddToNotion({
  actionId,
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
  const [action, setAction] = useState<Action | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [loading, setLoading] = useState(true);

  // Notion 클라이언트 관련 상태 추가
  const [notionClient, setNotionClient] = useState<Client | null>(null);
  const [notionLoading, setNotionLoading] = useState(true);
  const [notionError, setNotionError] = useState<string>("");

  // Notion 클라이언트 초기화
  useEffect(() => {
    const initNotionClient = async () => {
      try {
        setNotionLoading(true);
        setNotionError("");
        const client = await getNotionClient();
        setNotionClient(client);
      } catch (err) {
        setNotionError(
          err instanceof Error ? err.message : "Notion 연결에 실패했습니다."
        );
      } finally {
        setNotionLoading(false);
      }
    };

    initNotionClient();
  }, []);

  // 액션과 필드 매핑 정보 가져오기
  useEffect(() => {
    if (!actionId) return;

    const fetchActionData = async () => {
      try {
        setLoading(true);
        setError("");
        const [actionData, mappings] = await Promise.all([
          getActionById(actionId),
          getFieldMappingsByActionId(actionId),
        ]);
        setAction(actionData);
        setFieldMappings(mappings);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "액션 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActionData();
  }, [actionId]);

  const handleAddToNotion = async () => {
    if (!action || !notionClient) return;

    try {
      setAdding(true);
      setError("");

      // API를 통해 URL 검증 및 장소 정보 가져오기
      const placeMapper = await PlaceMapper.create(url, proxyFetchAsBrowser);
      const pageParameters = await placeMapper.getPageParameters(
        action.target_id || "",
        fieldMappings
          .map((field) => ({
            field_key: field.action_field_key,
            notion_key: field.notion_property_id || "",
          }))
          .filter((field) => field.notion_key !== "")
      );

      await notionClient.pages.create(pageParameters);

      setSuccess(true);
      onPlaceAdded();
    } catch (err) {
      // Notion API 에러 처리
      if (err instanceof APIResponseError) {
        switch (err.code) {
          case APIErrorCode.ObjectNotFound:
            setError(
              "데이터베이스를 찾을 수 없습니다. 데이터베이스가 삭제되었거나 권한이 없을 수 있습니다."
            );
            break;
          case APIErrorCode.Unauthorized:
            setError("Notion 접근 권한이 없습니다. 다시 로그인해주세요.");
            break;
          case APIErrorCode.ValidationError:
            setError("입력 데이터가 유효하지 않습니다.");
            break;
          case APIErrorCode.RateLimited:
            setError("너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.");
            break;
          default:
            setError(`Notion API 오류: ${err.message}`);
        }
      } else {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading || notionLoading) {
    return (
      <Card className={compact ? "border-none shadow-none" : "border-none"}>
        <CardContent className="text-center py-8">
          <ReloadIcon className="animate-spin h-8 w-8 mx-auto text-blue-500" />
          <p className="text-gray-600 mt-2">
            {loading ? "액션 정보를 불러오는 중..." : "Notion 연결 중..."}
          </p>
        </CardContent>
      </Card>
    );
  }

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
              <span className="font-semibold">{placeInfo?.name || "장소"}</span>
              이(가) Notion 데이터베이스에 저장되었습니다.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onAddMore}>더 추가하기</Button>
            <Button asChild variant="secondary">
              <a
                href={`https://notion.so/${
                  action?.target_id?.replace(/-/g, "") || ""
                }`}
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
      <CardContent className="space-y-6">
        {(error || notionError) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <p className="text-red-700 text-sm">{error || notionError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!notionClient && !notionLoading && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <p className="text-yellow-700 text-sm">
                  Notion에 연결되지 않았습니다. 다시 로그인해주세요.
                </p>
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
                  {placeInfo?.name || "장소명 없음"}
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                  주소:
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {placeInfo?.address || "주소 없음"}
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

        {/* 액션 정보 */}
        {action && (
          <Card className="mb-6 hover:border-blue-300 transition duration-200">
            <CardContent className="px-6 py-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                액션 정보
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {action.name || "카카오맵 연동 액션"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {action.description || "카카오맵 장소를 Notion에 저장"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      필드 매핑: {fieldMappings.length}개
                    </p>
                  </div>
                </div>
                <a
                  href={`https://notion.so/${
                    action.target_id?.replace(/-/g, "") || ""
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                >
                  <ExternalLinkIcon className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-center space-x-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleAddToNotion}
              disabled={adding || !action || !notionClient}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {adding ? (
                <>
                  <ReloadIcon className="animate-spin mr-2 h-4 w-4" />
                  추가하는 중...
                </>
              ) : (
                <>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Notion에 추가하기
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
