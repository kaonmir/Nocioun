"use client";

import { useState, useEffect, useRef } from "react";
import { NotionDatabase } from "@/types/notion";
import { DatabaseIcon } from "./DatabaseIcon";

interface DatabaseSelectorProps {
  onDatabaseSelected: (database: NotionDatabase) => void;
}

export function DatabaseSelector({
  onDatabaseSelected,
}: DatabaseSelectorProps) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchDatabases();
    }
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notion/databases");

      if (!response.ok) {
        throw new Error("데이터베이스를 불러올 수 없습니다.");
      }

      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = (database: NotionDatabase) => {
    onDatabaseSelected(database);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">데이터베이스를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">❌</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">오류 발생</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDatabases}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          데이터베이스 선택
        </h2>
        <p className="text-gray-600">
          카카오맵 장소를 저장할 Notion 데이터베이스를 선택하세요
        </p>
        <p className="text-sm text-gray-500 mt-1">
          최근 수정된 데이터베이스 20개를 불러옵니다.
        </p>
      </div>

      {databases.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            데이터베이스가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            Notion에서 먼저 데이터베이스를 생성해주세요.
          </p>
          <a
            href="https://www.notion.so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
          >
            Notion에서 데이터베이스 만들기 →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {databases.map((database) => (
            <div
              key={database.id}
              onClick={() => handleDatabaseSelect(database)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <DatabaseIcon
                    database={database}
                    className="mr-3 group-hover:bg-blue-100 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                      {database.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {database.description}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={fetchDatabases}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  );
}
