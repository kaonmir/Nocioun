"use client";

import { useState, useEffect, useCallback } from "react";
import { NotionDatabase } from "@/types/notion";
import { REQUIRED_COLUMNS } from "../../core/map/properties/columns";
import { DatabaseIcon } from "./DatabaseIcon";

interface ColumnCheckerProps {
  database: NotionDatabase;
  onColumnsReady: () => void;
  onBack: () => void;
}

type CheckStatus =
  | "loading"
  | "ready"
  | "missing-columns"
  | "invalid-types"
  | "error";

interface ColumnIssue {
  name: string;
  currentType?: string;
  expectedType?: string;
  missing?: boolean;
}

export function ColumnChecker({
  database,
  onColumnsReady,
  onBack,
}: ColumnCheckerProps) {
  const [status, setStatus] = useState<CheckStatus>("loading");
  const [issues, setIssues] = useState<ColumnIssue[]>([]);
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const checkColumns = useCallback(async () => {
    try {
      setStatus("loading");
      setError("");

      const response = await fetch(`/api/notion/databases/${database.id}`);
      if (!response.ok) {
        throw new Error("데이터베이스 정보를 불러올 수 없습니다.");
      }

      const data = await response.json();
      const columnIssues: ColumnIssue[] = [];

      // 누락된 컬럼들 추가
      if (data.missingColumns?.length > 0) {
        data.missingColumns.forEach((columnKey: string) => {
          const column = REQUIRED_COLUMNS.find((c) => c.key === columnKey);
          if (column) {
            columnIssues.push({
              name: column.label,
              missing: true,
              expectedType: column.type,
            });
          }
        });
      }

      // 타입이 잘못된 컬럼들 추가
      if (data.columnTypeValidation?.invalidColumns?.length > 0) {
        data.columnTypeValidation.invalidColumns.forEach((col: any) => {
          columnIssues.push({
            name: col.name,
            currentType: col.currentType,
            expectedType: col.expectedType,
            missing: false,
          });
        });
      }

      setIssues(columnIssues);

      if (columnIssues.length === 0) {
        setStatus("ready");
      } else if (columnIssues.some((issue) => !issue.missing)) {
        setStatus("invalid-types");
      } else {
        setStatus("missing-columns");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setStatus("error");
    }
  }, [database]);

  useEffect(() => {
    checkColumns();
  }, [checkColumns]);

  const handleAddColumns = async () => {
    try {
      setProcessing(true);
      const missingColumns = issues
        .filter((issue) => issue.missing)
        .map((issue) => {
          const column = REQUIRED_COLUMNS.find((c) => c.label === issue.name);
          return column?.key;
        })
        .filter(Boolean);

      const response = await fetch(`/api/notion/databases/${database.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnsToAdd: missingColumns }),
      });

      if (!response.ok) {
        throw new Error("컬럼 추가에 실패했습니다.");
      }

      await checkColumns();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setProcessing(false);
    }
  };

  const renderHeader = () => (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        데이터베이스 컬럼 확인
      </h2>
      <p className="text-gray-600">
        카카오맵 정보를 저장하기 위해 필요한 컬럼들을 확인합니다.
      </p>
    </div>
  );

  const renderDatabaseInfo = () => (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
      <div className="flex items-center">
        <DatabaseIcon database={database} className="mr-3" />
        <div>
          <p className="font-medium text-gray-900">{database.title}</p>
          <p className="text-sm text-gray-500">{database.description}</p>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">데이터베이스 구조를 확인하는 중...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-8">
      <div className="text-red-500 text-4xl mb-4">❌</div>
      <p className="text-red-600 mb-6">{error}</p>
      <div className="space-x-3">
        <button
          onClick={checkColumns}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          다시 시도
        </button>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );

  const renderReady = () => (
    <div className="text-center py-8">
      <div className="text-green-500 text-6xl mb-4">✅</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">완벽합니다!</h3>
      <p className="text-gray-600 mb-6">모든 필요한 컬럼이 준비되었습니다.</p>

      <button
        onClick={onColumnsReady}
        className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
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
  );

  const renderIssues = () => {
    const missingColumns = issues.filter((issue) => issue.missing);
    const invalidColumns = issues.filter((issue) => !issue.missing);
    const canAutoFix = missingColumns.length > 0 && invalidColumns.length === 0;

    return (
      <div>
        {/* 문제 목록 */}
        <div className="space-y-3 mb-6">
          {issues.map((issue, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{issue.name}</h4>
                  <p className="text-sm text-gray-500">
                    {issue.missing
                      ? `누락된 컬럼 (${issue.expectedType})`
                      : `타입 불일치: ${issue.currentType} → ${issue.expectedType}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    issue.missing
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {issue.missing ? "누락" : "타입 오류"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 메시지 */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            canAutoFix
              ? "bg-blue-50 border border-blue-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <p
            className={`text-sm ${
              canAutoFix ? "text-blue-700" : "text-yellow-700"
            }`}
          >
            {canAutoFix
              ? "누락된 컬럼들을 자동으로 추가할 수 있습니다."
              : "Notion에서 직접 수정이 필요한 문제가 있습니다."}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex space-x-3">
          {canAutoFix ? (
            <button
              onClick={handleAddColumns}
              disabled={processing}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {processing ? "컬럼 추가 중..." : "컬럼 자동 추가"}
            </button>
          ) : (
            <button
              onClick={checkColumns}
              disabled={processing}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {processing ? "확인 중..." : "다시 확인"}
            </button>
          )}

          <a
            href={`https://notion.so/${database.id.replace(/-/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors text-center"
          >
            Notion에서 수정
          </a>
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
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {renderHeader()}
      {renderDatabaseInfo()}

      {status === "loading" && renderLoading()}
      {status === "error" && renderError()}
      {status === "ready" && renderReady()}
      {(status === "missing-columns" || status === "invalid-types") &&
        renderIssues()}
    </div>
  );
}
