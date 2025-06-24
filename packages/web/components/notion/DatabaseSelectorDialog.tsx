"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { DatabaseIcon } from "./DatabaseIcon";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ReloadIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";

interface DatabaseSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDatabaseSelected: (database: DatabaseObjectResponse) => void;
  title?: string;
  description?: string;
  limit?: number;
}

export function DatabaseSelectorDialog({
  open,
  onOpenChange,
  onDatabaseSelected,
  title = "데이터베이스 선택",
  description = "카카오맵 정보를 저장할 Notion 데이터베이스를 선택해주세요.",
  limit = 20,
}: DatabaseSelectorDialogProps) {
  const [databases, setDatabases] = useState<DatabaseObjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const hasInitialized = useRef(false);

  const fetchDatabases = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/notion/databases?limit=${limit}`);

      if (!response.ok) {
        throw new Error("데이터베이스를 불러올 수 없습니다.");
      }

      const data = await response.json();
      setDatabases(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (open && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchDatabases();
    }
  }, [open, fetchDatabases]);

  const handleDatabaseSelect = (database: DatabaseObjectResponse) => {
    onDatabaseSelected(database);
    onOpenChange(false);
    setSearchTerm("");
  };

  const filteredDatabases = databases.filter(
    (db) =>
      db.title?.[0]?.plain_text
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      db.description?.[0]?.plain_text
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                <Cross2Icon className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-gray-600 mb-4">
            {description}
          </Dialog.Description>

          {/* 검색 입력 */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="데이터베이스 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 새로고침 버튼 */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              최근 수정된 데이터베이스 {databases.length}개
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDatabases}
              disabled={loading}
            >
              {loading ? (
                <ReloadIcon className="w-4 h-4 animate-spin" />
              ) : (
                <ReloadIcon className="w-4 h-4" />
              )}
              새로고침
            </Button>
          </div>

          {/* 데이터베이스 목록 */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <ReloadIcon className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">데이터베이스를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 space-y-4">
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
              </div>
            ) : filteredDatabases.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                {searchTerm ? (
                  <>
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        검색 결과가 없습니다
                      </h3>
                      <p className="text-gray-600 mb-4">
                        다른 검색어를 시도해보세요.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                      >
                        검색 초기화
                      </Button>
                    </div>
                  </>
                ) : databases.length === 0 ? (
                  <>
                    <div className="text-gray-400 text-6xl">📊</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        데이터베이스가 없습니다
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Notion에서 먼저 데이터베이스를 생성해주세요.
                      </p>
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
                  </>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDatabases.map((database) => (
                  <Card
                    key={database.id}
                    className="cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                    onClick={() => handleDatabaseSelect(database)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DatabaseIcon
                            icon={database.icon}
                            className="mr-3 flex-shrink-0"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {database.title?.[0]?.plain_text || ""}
                            </h3>
                            {database.description && (
                              <p className="text-sm text-gray-500">
                                {database.description?.[0]?.plain_text}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 하단 액션 */}
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Dialog.Close asChild>
              <Button variant="outline">취소</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
