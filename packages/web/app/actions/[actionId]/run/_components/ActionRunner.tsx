"use client";

import { useState, useEffect, useCallback } from "react";
import { UrlInput } from "./UrlInput";
import { AddToNotion } from "./AddToNotion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getActionById } from "@/lib/actions";
import { Action } from "@/types/action";
import { PlaceData } from "@/core";

type Step = "url" | "add";

interface ActionRunnerProps {
  actionId: string;
}

export function ActionRunner({ actionId }: ActionRunnerProps) {
  const [currentStep, setCurrentStep] = useState<Step>("url");
  const [actionData, setActionData] = useState<Action | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [validatedUrl, setValidatedUrl] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<PlaceData | null>(null);

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

  useEffect(() => {
    fetchActionData();
  }, [fetchActionData]);

  const handleUrlValidated = (url: string, placeInfo: PlaceData) => {
    if (!placeInfo) {
      setError("유효하지 않은 장소 정보입니다. 다시 시도해주세요.");
      return;
    }
    setValidatedUrl(url);
    setPlaceInfo(placeInfo);
    setCurrentStep("add");
  };

  const handlePlaceAdded = () => {
    // 성공 후 다시 URL 입력으로 돌아가서 더 추가할 수 있도록 함
  };

  const handleAddMore = () => {
    setValidatedUrl("");
    setPlaceInfo(null);
    setCurrentStep("url");
  };

  const handleBackToUrl = () => {
    setValidatedUrl("");
    setPlaceInfo(null);
    setCurrentStep("url");
  };

  const getStepNumber = (step: Step): number => {
    const steps = ["url", "add"];
    return steps.indexOf(step);
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
    <div className="break-keep">
      <div className="bg-white rounded-lg shadow-lg">
        {/* 액션 정보 */}
        <div className="px-6 pt-6 pb-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {actionData.name || "액션"}
            </h1>
            <p className="text-gray-600">
              {actionData.description ||
                "카카오맵 장소 정보를 Notion에 저장합니다"}
            </p>
          </div>
        </div>

        {currentStep === "url" && (
          <UrlInput onUrlValidated={handleUrlValidated} />
        )}

        {currentStep === "add" &&
          validatedUrl &&
          placeInfo &&
          actionData &&
          placeInfo && (
            <AddToNotion
              actionId={actionId}
              url={validatedUrl}
              placeInfo={placeInfo}
              onPlaceAdded={handlePlaceAdded}
              onBack={handleBackToUrl}
              onAddMore={handleAddMore}
              onChangeDatabase={() => window.history.back()}
            />
          )}
      </div>

      {/* 디버그 정보 (개발용) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Action ID: {actionId}</p>
          <p>Current Step: {currentStep}</p>
          <p>Action Type: {actionData?.action_type}</p>
          <p>Target Type: {actionData?.target_type}</p>
          <p>Target ID: {actionData?.target_id}</p>
          <p>Status: {actionData?.status}</p>
          <p>Field Mappings: {actionData?.field_mappings?.length || 0}</p>
          <p>Validated URL: {validatedUrl || "None"}</p>
        </div>
      )}
    </div>
  );
}
