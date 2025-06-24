"use client";

import { useState, useEffect } from "react";
import { NotionOAuth } from "./NotionOAuth";
import { DatabaseSelector } from "./DatabaseSelector";
import { ColumnChecker } from "./ColumnChecker";
import { UrlInput } from "./UrlInput";
import { AddToNotion } from "./AddToNotion";
import { Progress } from "@/components/ui/Progress";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { NotionDatabase } from "@/types/notion";
import { CheckIcon, ReloadIcon } from "@radix-ui/react-icons";

type Step = "oauth" | "database" | "columns" | "url" | "add";

export function MainApp() {
  const [currentStep, setCurrentStep] = useState<Step>("oauth");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedDatabase, setSelectedDatabase] =
    useState<NotionDatabase | null>(null);
  const [hasAllColumns, setHasAllColumns] = useState(false);
  const [validatedUrl, setValidatedUrl] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<any>(null);

  useEffect(() => {
    // 페이지 로드 시 인증 상태 확인
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success") === "true";
    const hasError = urlParams.get("error");

    if (isSuccess) {
      setIsAuthenticated(true);
      setCurrentStep("database");
      setCheckingAuth(false);
      // URL에서 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname);
    } else if (hasError) {
      console.error("OAuth error:", hasError);
      setCheckingAuth(false);
      // 에러 메시지를 표시할 수 있음
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      // 이미 인증된 상태인지 체크
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setCheckingAuth(true);
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        setIsAuthenticated(true);
        setCurrentStep("database");
      }
    } catch (error) {
      // 인증되지 않은 상태, 로그인 필요
      console.log("Not authenticated");
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleOAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentStep("database");
  };

  const handleDatabaseSelected = (database: NotionDatabase) => {
    setSelectedDatabase(database);
    setCurrentStep("columns");
  };

  const handleColumnsReady = () => {
    setHasAllColumns(true);
    setCurrentStep("url");
  };

  const handleUrlValidated = (url: string, placeInfo: any) => {
    setValidatedUrl(url);
    setPlaceInfo(placeInfo);
    setCurrentStep("add");
  };

  const handlePlaceAdded = () => {
    // 성공 후 자동으로 이동하지 않음 - 사용자가 직접 선택하도록 함
    // setValidatedUrl("");
    // setUrlValidationData(null);
    // setCurrentStep("url");
  };

  const handleAddMore = () => {
    // "더 추가하기" 버튼을 눌렀을 때 URL 입력 단계로 이동
    setValidatedUrl("");
    setPlaceInfo(null);
    setCurrentStep("url");
  };

  const handleBackToDatabase = () => {
    setSelectedDatabase(null);
    setHasAllColumns(false);
    setValidatedUrl("");
    setPlaceInfo(null);
    setCurrentStep("database");
  };

  const handleBackToUrl = () => {
    setValidatedUrl("");
    setPlaceInfo(null);
    setCurrentStep("url");
  };

  const handleChangeDatabase = () => {
    setCurrentStep("database");
  };

  const getStepNumber = (step: Step): number => {
    const steps = ["oauth", "database", "columns", "url", "add"];
    return steps.indexOf(step);
  };

  const isStepCompleted = (step: Step): boolean => {
    return getStepNumber(step) < getStepNumber(currentStep);
  };

  const isCurrentStep = (step: Step): boolean => {
    return step === currentStep;
  };

  return (
    <div className="break-keep">
      {/* 단계별 컴포넌트 */}
      <div className="bg-white rounded-lg shadow-lg">
        {checkingAuth ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <ReloadIcon className="animate-spin h-12 w-12 mx-auto text-blue-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Notion 연결 상태 확인 중...
                  </h2>
                  <p className="text-gray-600">
                    잠시만 기다려주세요. 인증 상태를 확인하고 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 진행 상태 표시 */}
            {/* 프로그레스 바 */}
            <div className="flex flex-col gap-2 px-6 pt-4">
              <Progress
                value={((getStepNumber(currentStep) + 1) / 5) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>진행률</span>
                <span>{getStepNumber(currentStep) + 1}/5 단계</span>
              </div>
            </div>
            {currentStep === "oauth" && (
              <NotionOAuth onSuccess={handleOAuthSuccess} />
            )}

            {currentStep === "database" && (
              <DatabaseSelector onDatabaseSelected={handleDatabaseSelected} />
            )}

            {currentStep === "columns" && selectedDatabase && (
              <ColumnChecker
                database={selectedDatabase}
                onColumnsReady={handleColumnsReady}
                onBack={handleBackToDatabase}
              />
            )}

            {currentStep === "url" && (
              <UrlInput
                onUrlValidated={handleUrlValidated}
                onBack={handleBackToDatabase}
              />
            )}

            {currentStep === "add" &&
              selectedDatabase &&
              validatedUrl &&
              placeInfo && (
                <AddToNotion
                  database={selectedDatabase}
                  url={validatedUrl}
                  placeInfo={placeInfo}
                  onPlaceAdded={handlePlaceAdded}
                  onBack={handleBackToUrl}
                  onAddMore={handleAddMore}
                  onChangeDatabase={handleChangeDatabase}
                />
              )}
          </>
        )}
      </div>

      {/* 디버그 정보 (개발용) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Current Step: {currentStep}</p>
          <p>Checking Auth: {checkingAuth ? "Yes" : "No"}</p>
          <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
          <p>Selected DB: {selectedDatabase?.title || "None"}</p>
          <p>Has All Columns: {hasAllColumns ? "Yes" : "No"}</p>
          <p>Validated URL: {validatedUrl || "None"}</p>
        </div>
      )}
    </div>
  );
}
