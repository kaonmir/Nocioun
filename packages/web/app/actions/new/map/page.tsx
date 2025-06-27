"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { DatabaseSelectorDialog } from "@/components/notion/DatabaseSelectorDialog";
import { FieldMappingCard } from "@/components/cards/FieldMappingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { ReloadIcon, CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  CompletedFieldMapping,
  CreateFieldMappingRequest,
} from "@/types/action";
import {
  createAction,
  createFieldMappings,
  activateAction,
} from "@/lib/actions";
import { DatabaseIcon } from "@/components/notion/DatabaseIcon";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { MAP_MAPPING_FIELDS } from "@nocioun/core";

type Step = "database" | "mapping";

export default function NewMapActionPage() {
  const router = useRouter();
  const [selectedDatabase, setSelectedDatabase] =
    useState<DatabaseObjectResponse | null>(null);
  const [fieldMappings, setFieldMappings] = useState<CompletedFieldMapping[]>(
    []
  );
  const [creating, setCreating] = useState(false);
  const [isDatabaseDialogOpen, setIsDatabaseDialogOpen] = useState(false);

  const handleDatabaseSelected = (database: DatabaseObjectResponse) => {
    setSelectedDatabase(database);
    setIsDatabaseDialogOpen(false);
  };

  const handleMappingComplete = useCallback(
    (mappings: CompletedFieldMapping[]) => {
      setFieldMappings(mappings);
    },
    []
  );

  const handleCreateAction = async () => {
    if (!selectedDatabase || fieldMappings.length === 0) return;

    try {
      setCreating(true);

      // 1. Action 생성 (draft 상태)
      const action = await createAction({
        name: `카카오맵 연동 - ${
          selectedDatabase.title?.[0]?.plain_text || selectedDatabase.id
        }`,
        description: "카카오맵 장소 정보를 Notion 데이터베이스에 저장하는 액션",
        action_type: "map",
        target_type: "database",
        target_id: selectedDatabase.id,
      });

      // 2. Field Mappings 생성
      const mappingRequests: CreateFieldMappingRequest[] = fieldMappings
        .filter((mapping) => mapping.notionPropertyId) // notion property가 있는 것만
        .map((mapping) => ({
          action_field_key: mapping.actionFieldKey,
          notion_property_id: mapping.notionPropertyId!,
        }));

      if (mappingRequests.length > 0) {
        await createFieldMappings(action.id, mappingRequests);
      }

      // 3. Action 활성화
      await activateAction(action.id);

      router.push(`/actions`);
    } catch (error) {
      console.error("Action creation failed:", error);
      alert("액션 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCreating(false);
    }
  };

  const getStepNumber = (step: Step): number => {
    const steps = ["database", "mapping"];
    return steps.indexOf(step);
  };

  const getStepStatus = (step: Step) => {
    switch (step) {
      case "database":
        return selectedDatabase ? "completed" : "active";
      case "mapping":
        return fieldMappings.length > 0
          ? "completed"
          : selectedDatabase
          ? "active"
          : "pending";
      default:
        return "pending";
    }
  };

  const getStepIcon = (step: Step) => {
    const status = getStepStatus(step);
    if (status === "completed") {
      return <CheckIcon className="w-5 h-5 text-green-600" />;
    }
    return (
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
          status === "active"
            ? "border-blue-500 bg-blue-500 text-white"
            : "border-gray-300 text-gray-400"
        }`}
      >
        {getStepNumber(step) + 1}
      </div>
    );
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case "database":
        return "데이터베이스 선택";
      case "mapping":
        return "필드 매핑";
      default:
        return "";
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case "database":
        return "카카오맵 정보를 저장할 Notion 데이터베이스를 선택하세요";
      case "mapping":
        return "카카오맵 필드와 Notion 속성을 연결하세요";
      default:
        return "";
    }
  };

  if (creating) return <LoadingCard message="액션을 생성 중..." />;

  return (
    <>
      <PageMeta
        title="카카오맵 연동 설정"
        description="카카오맵에서 장소 정보를 가져올 설정을 진행해주세요"
      />

      {/* 1단계: 데이터베이스 선택 */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStepIcon("database")}
              <div>
                <CardTitle className="text-lg">
                  {getStepTitle("database")}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {getStepDescription("database")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedDatabase ? (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setIsDatabaseDialogOpen(true)}
                  className="flex items-center space-x-1"
                >
                  <DatabaseIcon
                    icon={selectedDatabase.icon}
                    className="bg-white"
                  />
                  <span className="text-base font-medium">
                    {selectedDatabase.title?.[0]?.plain_text || ""}
                  </span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setIsDatabaseDialogOpen(true)}
                >
                  선택하기
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 2단계: 필드 매핑 */}
      <Card
        className={`border-2 ${
          selectedDatabase ? "border-gray-200" : "border-gray-100"
        }`}
      >
        <CardHeader className={selectedDatabase ? "" : "opacity-50"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStepIcon("mapping")}
              <div>
                <CardTitle className="text-lg">
                  {getStepTitle("mapping")}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {getStepDescription("mapping")}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        {selectedDatabase && (
          <CardContent>
            <FieldMappingCard
              database={selectedDatabase}
              actionFields={[...MAP_MAPPING_FIELDS]}
              onMappingComplete={handleMappingComplete}
            />
          </CardContent>
        )}
      </Card>

      {/* 액션 생성 버튼 */}
      <div className="mt-4 text-center">
        <Button
          size="lg"
          onClick={handleCreateAction}
          disabled={creating || !selectedDatabase || fieldMappings.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-center"
        >
          {creating ? (
            <>
              <ReloadIcon className="animate-spin mr-2 h-4 w-4" />
              액션 생성 중...
            </>
          ) : (
            <>
              <PlusIcon className="mr-2 h-4 w-4" />
              액션 생성하기
            </>
          )}
        </Button>
      </div>

      {/* 디버그 정보 (개발용) */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>
            Selected DB: {selectedDatabase?.title?.[0]?.plain_text || "None"}
          </p>
          <p>Field Mappings: {fieldMappings.length}</p>
          <pre className="mt-2 text-xs">
            {JSON.stringify(fieldMappings, null, 2)}
          </pre>
        </div>
      )} */}

      {/* 데이터베이스 선택 다이얼로그 */}
      <DatabaseSelectorDialog
        open={isDatabaseDialogOpen}
        onOpenChange={setIsDatabaseDialogOpen}
        onDatabaseSelected={handleDatabaseSelected}
        title="데이터베이스 선택"
        description="카카오맵 정보를 저장할 Notion 데이터베이스를 선택해주세요."
        limit={20}
      />
    </>
  );
}
