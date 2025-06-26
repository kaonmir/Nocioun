"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DatabaseSelectorDialog } from "@/components/notion/DatabaseSelectorDialog";
import { FieldMappingCard } from "@/components/cards/FieldMappingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { ReloadIcon, CheckIcon, ArrowLeftIcon } from "@radix-ui/react-icons";

import { Save } from "lucide-react";
import {
  CompletedFieldMapping,
  CreateFieldMappingRequest,
  Action,
} from "@/types/action";
import {
  getActionById,
  updateAction,
  updateFieldMappings,
} from "@/lib/actions";
import { DatabaseIcon } from "@/components/notion/DatabaseIcon";
import { MAP_MAPPING_FIELDS } from "@/core";
import { getNotionClient } from "@/lib/notion";
import { LoadingCard } from "@/components/cards/LoadingCard";

type Step = "database" | "mapping";

interface EditMapActionPageProps {
  params: {
    actionId: string;
  };
}

export default function EditMapActionPage({ params }: EditMapActionPageProps) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [selectedDatabase, setSelectedDatabase] =
    useState<DatabaseObjectResponse | null>(null);
  const [fieldMappings, setFieldMappings] = useState<CompletedFieldMapping[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDatabaseDialogOpen, setIsDatabaseDialogOpen] = useState(false);

  // 액션 데이터 로드
  useEffect(() => {
    const loadActionData = async () => {
      try {
        setLoading(true);

        // 액션 정보 로드
        const actionData = await getActionById(params.actionId);
        setAction(actionData);

        // 데이터베이스 정보 로드
        if (actionData.target_id) {
          const notionClient = await getNotionClient();
          const databaseData = await notionClient.databases.retrieve({
            database_id: actionData.target_id,
          });
          setSelectedDatabase(databaseData as DatabaseObjectResponse);

          // 기존 필드 매핑을 CompletedFieldMapping 형태로 변환
          if (
            actionData.field_mappings &&
            actionData.field_mappings.length > 0
          ) {
            const mappings: CompletedFieldMapping[] = actionData.field_mappings
              .filter((mapping: any) => mapping.notion_property_id)
              .map((mapping: any) => {
                const actionField = MAP_MAPPING_FIELDS.find(
                  (field) => field.key === mapping.action_field_key
                );

                // 데이터베이스에서 해당 속성 찾기
                const notionProperty = Object.entries(
                  databaseData.properties
                ).find(([id]) => id === mapping.notion_property_id);

                return {
                  actionFieldKey: mapping.action_field_key,
                  actionFieldName:
                    actionField?.name || mapping.action_field_key,
                  actionFieldDescription: actionField?.description || "",
                  notionPropertyId: mapping.notion_property_id,
                  notionPropertyName: notionProperty?.[1]?.name || "",
                  notionPropertyType: notionProperty?.[1]?.type || "",
                  isNewProperty: false,
                  status: "existing" as const,
                };
              });
            setFieldMappings(mappings);
          }
        }
      } catch (error) {
        console.error("Failed to load action data:", error);
        alert("액션 정보를 불러오는데 실패했습니다.");
        router.push("/actions");
      } finally {
        setLoading(false);
      }
    };

    if (params.actionId) {
      loadActionData();
    }
  }, [params.actionId, router]);

  const handleDatabaseSelected = (database: DatabaseObjectResponse) => {
    setSelectedDatabase(database);
    setIsDatabaseDialogOpen(false);
    // 데이터베이스가 변경되면 기존 매핑 리셋
    setFieldMappings([]);
  };

  const handleMappingComplete = useCallback(
    (mappings: CompletedFieldMapping[]) => {
      setFieldMappings(mappings);
    },
    []
  );

  const handleSaveAction = async () => {
    if (!action || !selectedDatabase || fieldMappings.length === 0) return;

    try {
      setSaving(true);

      // 1. 액션 업데이트
      await updateAction(action.id, {
        name: `카카오맵 연동 - ${
          selectedDatabase.title?.[0]?.plain_text || selectedDatabase.id
        }`,
        description: "카카오맵 장소 정보를 Notion 데이터베이스에 저장하는 액션",
        target_id: selectedDatabase.id,
      });

      // 2. 필드 매핑 업데이트
      const mappingRequests: CreateFieldMappingRequest[] = fieldMappings
        .filter((mapping) => mapping.notionPropertyId)
        .map((mapping) => ({
          action_field_key: mapping.actionFieldKey,
          notion_property_id: mapping.notionPropertyId!,
        }));

      await updateFieldMappings(action.id, mappingRequests);

      alert("액션이 성공적으로 저장되었습니다.");
      router.push(`/actions`);
    } catch (error) {
      console.error("Action save failed:", error);
      alert("액션 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
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

  if (loading) return <LoadingCard message="액션 정보를 불러오는 중..." />;
  if (saving) return <LoadingCard message="액션을 저장하는 중..." />;

  return (
    <>
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
          <CardContent className="pt-0">
            <FieldMappingCard
              database={selectedDatabase}
              actionFields={[...MAP_MAPPING_FIELDS]}
              onMappingComplete={handleMappingComplete}
              initialMappings={fieldMappings}
            />
          </CardContent>
        )}
      </Card>

      {/* 액션 저장 버튼 */}
      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleSaveAction}
          disabled={saving || !selectedDatabase || fieldMappings.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          {saving ? (
            <>
              <ReloadIcon className="animate-spin mr-2 h-4 w-4" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              액션 저장하기
            </>
          )}
        </Button>
      </div>

      {/* 디버그 정보 (개발용) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Action ID: {action?.id}</p>
          <p>
            Selected DB: {selectedDatabase?.title?.[0]?.plain_text || "None"}
          </p>
          <p>Field Mappings: {fieldMappings.length}</p>
          <pre className="mt-2 text-xs">
            {JSON.stringify(fieldMappings, null, 2)}
          </pre>
        </div>
      )}
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
