"use client";

import { useState, useEffect } from "react";
import { NotionDatabase } from "@/types/notion";

interface ColumnCheckerProps {
  database: NotionDatabase;
  onColumnsReady: () => void;
  onBack: () => void;
}

const REQUIRED_COLUMNS = [
  {
    key: "address",
    label: "주소",
    type: "rich_text",
    description: "장소의 상세 주소",
  },
  {
    key: "homepage",
    label: "홈페이지",
    type: "url",
    description: "장소 공식 웹사이트 URL",
  },
  {
    key: "phone_number",
    label: "전화번호",
    type: "phone_number",
    description: "연락처 정보",
  },
  {
    key: "link",
    label: "지도 링크",
    type: "url",
    description: "카카오맵 원본 링크",
  },
];

export function ColumnChecker({
  database,
  onColumnsReady,
  onBack,
}: ColumnCheckerProps) {
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string>("");
  const [showColumnTypeModal, setShowColumnTypeModal] = useState(false);
  const [invalidColumns, setInvalidColumns] = useState<
    Array<{ name: string; currentType: string; expectedType: string }>
  >([]);

  useEffect(() => {
    checkColumns();
  }, [database]);

  const checkColumns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/notion/databases/${database.id}`);

      if (!response.ok) {
        throw new Error("데이터베이스 정보를 불러올 수 없습니다.");
      }

      const data = await response.json();
      setMissingColumns(data.missingColumns || []);

      // 컬럼 타입 검증
      if (data.columnTypeValidation && !data.columnTypeValidation.isValid) {
        setInvalidColumns(data.columnTypeValidation.invalidColumns || []);
        setShowColumnTypeModal(true);
        return;
      }

      if (data.hasAllRequiredColumns && data.columnTypeValidation.isValid) {
        onColumnsReady();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumns = async () => {
    try {
      setAdding(true);
      setError("");

      const response = await fetch(`/api/notion/databases/${database.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnsToAdd: missingColumns,
        }),
      });

      if (!response.ok) {
        throw new Error("컬럼 추가에 실패했습니다.");
      }

      // 컬럼 추가 후 다시 확인
      await checkColumns();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleSkip = () => {
    onColumnsReady();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">데이터베이스 구조를 확인하는 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 컬럼 타입 불일치 모달 */}
      {showColumnTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900">
                컬럼 타입이 일치하지 않습니다
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                다음 컬럼들의 타입이 예상과 다릅니다:
              </p>

              <div className="space-y-2">
                {invalidColumns.map((column, index) => (
                  <div
                    key={index}
                    className="bg-red-50 p-3 rounded border border-red-200"
                  >
                    <div className="font-medium text-red-900">
                      {column.name}
                    </div>
                    <div className="text-sm text-red-700">
                      현재:{" "}
                      <span className="font-mono">{column.currentType}</span> →
                      필요:{" "}
                      <span className="font-mono">{column.expectedType}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>해결 방법:</strong>
                  <br />
                  1. Notion에서 해당 컬럼을 삭제하거나
                  <br />
                  2. 컬럼 타입을 변경한 후<br />
                  3. 다시 시도해주세요.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowColumnTypeModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                확인
              </button>
              <a
                href={`https://notion.so/${database.id.replace(/-/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-200 text-center"
              >
                Notion에서 수정하기
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            데이터베이스 컬럼 확인
          </h2>
          <p className="text-gray-600">
            카카오맵 정보를 저장하기 위해 필요한 컬럼들을 확인합니다.
          </p>
        </div>

        {/* Title property 안내 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-500 text-xl">✓</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-800">장소명</h4>
              <p className="text-sm text-green-700">
                기존 Title 컬럼에 장소명이 저장됩니다.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {missingColumns.length > 0 ? (
          <div>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⚠️ 필요한 컬럼이 없습니다
              </h3>
              <p className="text-yellow-700 text-sm">
                다음 컬럼들이 데이터베이스에 없어서 추가가 필요합니다.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {missingColumns.map((columnKey) => {
                const column = REQUIRED_COLUMNS.find(
                  (c) => c.key === columnKey
                );
                if (!column) return null;

                return (
                  <div
                    key={columnKey}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {column.label} ({column.key})
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {column.description}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {column.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddColumns}
                disabled={adding}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {adding ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    컬럼 추가 중...
                  </span>
                ) : (
                  "컬럼 자동 추가하기"
                )}
              </button>

              <button
                onClick={handleSkip}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                그냥 진행
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← 다른 데이터베이스 선택
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              완벽합니다!
            </h3>
            <p className="text-gray-600 mb-6">
              필요한 모든 컬럼이 데이터베이스에 있습니다.
            </p>

            <div className="space-y-2 mb-6">
              {REQUIRED_COLUMNS.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center justify-center text-sm text-gray-600"
                >
                  <span className="text-green-500 mr-2">✓</span>
                  {column.label} ({column.key})
                </div>
              ))}
            </div>

            <button
              onClick={onColumnsReady}
              className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-200"
            >
              다음 단계로 계속
            </button>

            <div className="mt-4">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← 다른 데이터베이스 선택
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
