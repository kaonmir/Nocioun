"use client";

import { useState, useEffect, useCallback } from "react";
import { UrlInput } from "./UrlInput";
import { AddToNotion } from "./AddToNotion";
import { Card, CardContent } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Action } from "@/types/action";
import { PlaceData } from "@nocioun/core";
import { ErrorCard } from "@/components/cards/ErrorCard";

type Step = "url" | "add";

interface ActionRunnerProps {
  actionId: string;
  action: Action;
}

export function ActionRunner({ actionId, action }: ActionRunnerProps) {
  const [currentStep, setCurrentStep] = useState<Step>("url");
  const [error, setError] = useState<string>("");
  const [validatedUrl, setValidatedUrl] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<PlaceData | null>(null);

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

  if (error) return <ErrorCard message={error} />;

  return (
    <>
      {currentStep === "url" && (
        <UrlInput onUrlValidated={handleUrlValidated} />
      )}

      {currentStep === "add" &&
        validatedUrl &&
        placeInfo &&
        action &&
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

      {/* 디버그 정보 (개발용) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Action ID: {actionId}</p>
          <p>Current Step: {currentStep}</p>
          <p>Action Type: {action?.action_type}</p>
          <p>Target Type: {action?.target_type}</p>
          <p>Target ID: {action?.target_id}</p>
          <p>Status: {action?.status}</p>
          <p>Field Mappings: {action?.field_mappings?.length || 0}</p>
          <p>Validated URL: {validatedUrl || "None"}</p>
        </div>
      )}
    </>
  );
}
