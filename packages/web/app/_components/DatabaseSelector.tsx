"use client";

import { useState, useEffect, useRef } from "react";
import { NotionDatabase } from "@/types/notion";

import { DatabaseIcon } from "./DatabaseIcon";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ReloadIcon, ChevronRightIcon } from "@radix-ui/react-icons";

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
      <Card className="border-none">
        <CardContent className="text-center py-8">
          <ReloadIcon className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">데이터베이스를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-none">
        <CardContent className="text-center py-8 space-y-4">
          <div className="text-red-500 text-4xl">❌</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              오류 발생
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
          <Button onClick={fetchDatabases} variant="default">
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none">
      <CardHeader className="text-center">
        <CardTitle>데이터베이스 선택</CardTitle>
        <CardDescription>
          카카오맵 장소를 저장할 Notion 데이터베이스를 선택하세요
        </CardDescription>
        <p className="text-sm text-gray-500 mt-1">
          최근 수정된 데이터베이스 20개를 불러옵니다.
        </p>
      </CardHeader>

      <CardContent>
        {databases.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-gray-400 text-6xl">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                데이터베이스가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                Notion에서 먼저 데이터베이스를 생성해주세요.
              </p>
            </div>
            <Button asChild className="bg-black hover:bg-gray-800">
              <a
                href="https://www.notion.so"
                target="_blank"
                rel="noopener noreferrer"
              >
                Notion에서 데이터베이스 만들기 →
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {databases.map((database) => (
              <Card
                key={database.id}
                className="cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                onClick={() => handleDatabaseSelect(database)}
              >
                <CardContent className="p-4">
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
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={fetchDatabases}
            className="text-blue-600 hover:text-blue-800"
          >
            <ReloadIcon className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
