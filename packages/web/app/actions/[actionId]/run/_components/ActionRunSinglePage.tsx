"use client";

import { useState, useEffect, useCallback } from "react";
import { UrlInput } from "../../_components/UrlInput";
import { AddToNotion } from "../../_components/AddToNotion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getActionById } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface NotionDatabase {
  id: string;
  title: string;
  // 기타 Notion 데이터베이스 속성들
  [key: string]: any;
}

interface ActionData {
  id: string;
  type: string;
  name: string;
  databaseId: string;
  config: {
    database: NotionDatabase;
  };
}

interface ActionRunSinglePageProps {
  actionId: string;
}

export function ActionRunSinglePage({ actionId }: ActionRunSinglePageProps) {
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [validatedUrl, setValidatedUrl] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<any>(null);

  useEffect(() => {
    fetchActionData();
  }, [actionId]);

  const fetchActionData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const action = await getActionById(actionId);
      setActionData(action);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [actionId]);

  const handleUrlValidated = (url: string, placeInfo: any) => {
    setValidatedUrl(url);
    setPlaceInfo(placeInfo);
  };

  const handlePlaceAdded = () => {
    // 성공 후 URL과 장소 정보를 초기화해서 다시 추가할 수 있도록 함
    setValidatedUrl("");
    setPlaceInfo(null);
  };

  const handleResetForm = () => {
    setValidatedUrl("");
    setPlaceInfo(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <ReloadIcon className="animate-spin h-12 w-12 mx-auto text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                액션을 불러오고 있습니다...
              </h2>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-6xl">❌</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                오류 발생
              </h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!actionData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <Link href={`/actions/${actionId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {actionData.name} 실행
          </h1>
          <p className="text-gray-600">
            {actionData.config.database.title}에 카카오맵 장소를 저장합니다
          </p>
        </div>
      </div>

      {/* URL 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>카카오맵 URL 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <UrlInput
            onUrlValidated={handleUrlValidated}
            onBack={() => window.history.back()}
            hideBackButton={true}
            compact={true}
          />
        </CardContent>
      </Card>

      {/* Notion 추가 섹션 */}
      {validatedUrl && placeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Notion에 저장</span>
              <Button variant="outline" size="sm" onClick={handleResetForm}>
                다시 입력
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddToNotion
              database={actionData.config.database}
              url={validatedUrl}
              placeInfo={placeInfo}
              onPlaceAdded={handlePlaceAdded}
              onBack={handleResetForm}
              onAddMore={handleResetForm}
              onChangeDatabase={() => window.history.back()}
              hideBackButton={true}
              compact={true}
            />
          </CardContent>
        </Card>
      )}

      {/* 디버그 정보 (개발용) */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Action ID: {actionId}</p>
            <p>Action Type: {actionData?.type}</p>
            <p>Database: {actionData?.config.database.title}</p>
            <p>Validated URL: {validatedUrl || "None"}</p>
            <p>Place Info: {placeInfo ? "Loaded" : "None"}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
