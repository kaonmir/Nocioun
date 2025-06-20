"use client";

import { useState, useEffect } from "react";
import { NotionOAuth } from "./NotionOAuth";
import { DatabaseSelector } from "./DatabaseSelector";
import { ColumnChecker } from "./ColumnChecker";
import { UrlInput } from "./UrlInput";
import { AddToNotion } from "./AddToNotion";
import { NotionDatabase } from "@/types/notion";

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
      // 쿠키 확인으로 이미 인증된 상태인지 체크
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 진행 상태 표시 */}
      <div className="mb-8">
        {/* 데스크톱용 가로 레이아웃 */}
        <div className="hidden md:flex items-center justify-between mb-4">
          {[
            { key: "oauth" as Step, label: "Notion 연결", icon: "1" },
            { key: "database" as Step, label: "DB 선택", icon: "2" },
            { key: "columns" as Step, label: "컬럼 확인", icon: "3" },
            { key: "url" as Step, label: "URL 입력", icon: "4" },
            { key: "add" as Step, label: "추가", icon: "5" },
          ].map((step, index) => (
            <div
              key={step.key}
              className={`flex items-center ${index < 4 ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCurrentStep(step.key)
                    ? "bg-blue-500 text-white"
                    : isStepCompleted(step.key)
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {isStepCompleted(step.key) ? "✓" : step.icon}
              </div>
              <div className="ml-2">
                <span className="text-sm font-medium text-gray-700">
                  {step.label}
                </span>
              </div>
              {index < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    isStepCompleted(step.key) ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* 모바일용 세로 레이아웃 */}
        <div className="md:hidden space-y-3 mb-4">
          {[
            { key: "oauth" as Step, label: "Notion 연결", icon: "1" },
            { key: "database" as Step, label: "DB 선택", icon: "2" },
            { key: "columns" as Step, label: "컬럼 확인", icon: "3" },
            { key: "url" as Step, label: "URL 입력", icon: "4" },
            { key: "add" as Step, label: "추가", icon: "5" },
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0 ${
                  isCurrentStep(step.key)
                    ? "bg-blue-500 text-white"
                    : isStepCompleted(step.key)
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {isStepCompleted(step.key) ? "✓" : step.icon}
              </div>
              <div className="ml-3 flex-1">
                <span
                  className={`text-sm font-medium ${
                    isCurrentStep(step.key)
                      ? "text-blue-700"
                      : isStepCompleted(step.key)
                      ? "text-green-700"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {isCurrentStep(step.key) && (
                <div className="text-blue-500 text-xs font-medium">진행 중</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 단계별 컴포넌트 */}
      <div className="bg-white rounded-lg shadow-lg">
        {checkingAuth ? (
          <div className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Notion 연결 상태 확인 중...
              </h2>
              <p className="text-gray-600">
                잠시만 기다려주세요. 인증 상태를 확인하고 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentStep === "oauth" && (
              <div className="p-8">
                <NotionOAuth onSuccess={handleOAuthSuccess} />
              </div>
            )}

            {currentStep === "database" && (
              <div className="p-8">
                <DatabaseSelector onDatabaseSelected={handleDatabaseSelected} />
              </div>
            )}

            {currentStep === "columns" && selectedDatabase && (
              <div className="p-8">
                <ColumnChecker
                  database={selectedDatabase}
                  onColumnsReady={handleColumnsReady}
                  onBack={handleBackToDatabase}
                />
              </div>
            )}

            {currentStep === "url" && (
              <div className="p-8">
                <UrlInput
                  onUrlValidated={handleUrlValidated}
                  onBack={handleBackToDatabase}
                />
              </div>
            )}

            {currentStep === "add" &&
              selectedDatabase &&
              validatedUrl &&
              placeInfo && (
                <div className="p-8">
                  <AddToNotion
                    database={selectedDatabase}
                    url={validatedUrl}
                    placeInfo={placeInfo}
                    onPlaceAdded={handlePlaceAdded}
                    onBack={handleBackToUrl}
                    onAddMore={handleAddMore}
                  />
                </div>
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
