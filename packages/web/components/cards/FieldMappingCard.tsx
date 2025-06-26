"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import {
  ActionField,
  LocalFieldMapping,
  CompletedFieldMapping,
} from "@/types/action";
import { CreateFieldMap } from "@/core";

interface NotionProperty {
  id: string;
  name: string;
  type: string;
}

interface FieldMappingCardProps {
  database: DatabaseObjectResponse;
  actionFields: CreateFieldMap[];
  onMappingComplete: (mappings: CompletedFieldMapping[]) => void;
  initialMappings?: CompletedFieldMapping[];
}

export function FieldMappingCard({
  database,
  actionFields,
  onMappingComplete,
  initialMappings,
}: FieldMappingCardProps) {
  const [notionProperties, setNotionProperties] = useState<NotionProperty[]>(
    []
  );
  const [mappings, setMappings] = useState<LocalFieldMapping[]>([]);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDialogField, setActiveDialogField] = useState<string | null>(
    null
  );
  const hasCompletedRef = useRef(false);

  // 데이터베이스의 프로퍼티 정보 가져오기
  useEffect(() => {
    const properties: NotionProperty[] = [];

    if (database.properties) {
      Object.entries(database.properties).forEach(([name, property]) => {
        properties.push({
          id: name,
          name: name,
          type: (property as any).type,
        });
      });
    }

    setNotionProperties(properties);

    // 초기 매핑 설정
    let mappingsToSet: LocalFieldMapping[];

    if (initialMappings && initialMappings.length > 0) {
      // initialMappings가 제공된 경우 기존 매핑을 복원
      mappingsToSet = actionFields.map((field) => {
        const existingMapping = initialMappings.find(
          (mapping) => mapping.actionFieldKey === field.key
        );

        if (existingMapping) {
          return {
            actionFieldKey: field.key,
            notionPropertyId: existingMapping.notionPropertyId,
            notionPropertyName: existingMapping.notionPropertyName,
            isNewProperty: existingMapping.isNewProperty || false,
            status: existingMapping.status || "existing",
          };
        } else {
          // 매핑이 없는 필드는 기본 설정 적용
          return createDefaultMapping(field, properties);
        }
      });
    } else {
      // 새로 생성하는 경우 기본 매핑 설정
      mappingsToSet = actionFields.map((field) =>
        createDefaultMapping(field, properties)
      );
    }

    setMappings(mappingsToSet);
  }, [database, actionFields, initialMappings]);

  // 기본 매핑 생성 함수
  const createDefaultMapping = (
    field: any,
    properties: NotionProperty[]
  ): LocalFieldMapping => {
    // title 타입은 항상 자동으로 첫 번째 title 프로퍼티와 매핑
    if (field.propertyType === "title") {
      const titleProperty = properties.find((prop) => prop.type === "title");
      return {
        actionFieldKey: field.key,
        notionPropertyId: titleProperty?.id,
        notionPropertyName: titleProperty?.name,
        isNewProperty: false,
        status: "auto_title",
      };
    }

    // 기본 프로퍼티명으로 기존 프로퍼티 찾기
    const existingProperty = properties.find(
      (prop) => prop.name === field.defaultPropertyName
    );

    if (existingProperty) {
      // 기존 프로퍼티가 있는 경우 타입 확인
      if (existingProperty.type === field.propertyType) {
        // 타입이 일치하는 경우
        return {
          actionFieldKey: field.key,
          notionPropertyId: existingProperty.id,
          notionPropertyName: existingProperty.name,
          isNewProperty: false,
          status: "existing",
        };
      } else {
        // 타입이 일치하지 않는 경우 - 빈칸으로 표시
        return {
          actionFieldKey: field.key,
          notionPropertyId: undefined,
          notionPropertyName: undefined,
          isNewProperty: false,
        };
      }
    } else {
      // 기존 프로퍼티가 없는 경우 - 신규 생성
      return {
        actionFieldKey: field.key,
        notionPropertyId: undefined,
        notionPropertyName: field.defaultPropertyName,
        isNewProperty: true,
        status: "new",
      };
    }
  };

  // 특정 액션 필드에 매핑 가능한 노션 프로퍼티 필터링
  const getCompatibleProperties = (actionFieldKey: string) => {
    const actionField = actionFields.find((f) => f.key === actionFieldKey);
    if (!actionField) return [];

    let compatible = notionProperties.filter(
      (prop) => prop.type === actionField.propertyType
    );

    // 검색어로 필터링
    if (searchTerm) {
      compatible = compatible.filter((prop) =>
        prop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return compatible;
  };

  // 프로퍼티가 다른 필드에서 이미 사용되었는지 확인
  const isPropertyUsedElsewhere = (
    propertyId: string,
    currentFieldKey: string
  ) => {
    return mappings.some(
      (mapping) =>
        mapping.actionFieldKey !== currentFieldKey &&
        mapping.notionPropertyId === propertyId
    );
  };

  // 매핑 업데이트
  const updateMapping = (
    actionFieldKey: string,
    update: Partial<LocalFieldMapping>
  ) => {
    setMappings((prev) =>
      prev.map((mapping) =>
        mapping.actionFieldKey === actionFieldKey
          ? { ...mapping, ...update }
          : mapping
      )
    );
  };

  // 새 프로퍼티 생성 선택
  const selectNewProperty = (actionFieldKey: string, propertyName: string) => {
    updateMapping(actionFieldKey, {
      notionPropertyId: undefined,
      notionPropertyName: propertyName,
      isNewProperty: true,
      status: "new",
    });
    setActiveDialogField(null);
    setSearchTerm("");
  };

  // 기존 프로퍼티 선택
  const selectExistingProperty = (
    actionFieldKey: string,
    property: NotionProperty
  ) => {
    updateMapping(actionFieldKey, {
      notionPropertyId: property.id,
      notionPropertyName: property.name,
      isNewProperty: false,
      status: "existing",
    });
    setActiveDialogField(null);
    setSearchTerm("");
  };

  // 상태 뱃지 렌더링
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "auto_title":
        return (
          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
            자동 매핑
          </span>
        );
      case "existing":
        return (
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
            기존
          </span>
        );
      case "new":
        return (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
            신규 생성
          </span>
        );
      default:
        return null;
    }
  };

  // 모든 필드가 매핑되었는지 확인
  const isAllFieldsMapped = mappings.every(
    (mapping) => mapping.notionPropertyId || mapping.isNewProperty
  );

  // 자동 완료 처리 - 모든 필드가 매핑되면 자동으로 완료 처리
  useEffect(() => {
    const handleComplete = async () => {
      if (
        !isAllFieldsMapped ||
        mappings.length === 0 ||
        processing ||
        hasCompletedRef.current
      ) {
        return;
      }

      hasCompletedRef.current = true;
      setProcessing(true);

      try {
        // 새로 생성할 프로퍼티들 확인
        const newProperties = mappings.filter(
          (mapping) => mapping.isNewProperty
        );

        if (newProperties.length > 0) {
          // 새 프로퍼티 생성 API 호출
          const response = await fetch(
            `/api/notion/databases/${database.id}/properties`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                properties: newProperties.map((mapping) => {
                  const actionField = actionFields.find(
                    (f) => f.key === mapping.actionFieldKey
                  );
                  return {
                    name: mapping.notionPropertyName,
                    type: actionField?.propertyType,
                  };
                }),
              }),
            }
          );

          if (!response.ok) {
            throw new Error("프로퍼티 생성에 실패했습니다.");
          }
        }

        // 완성된 매핑 정보를 생성
        const finalMappings: CompletedFieldMapping[] = mappings.map(
          (mapping) => {
            const actionField = actionFields.find(
              (f) => f.key === mapping.actionFieldKey
            );

            if (!actionField) {
              throw new Error(
                `Action field not found: ${mapping.actionFieldKey}`
              );
            }

            return {
              actionFieldKey: mapping.actionFieldKey,
              actionFieldName: actionField.name,
              actionFieldDescription: actionField.description,
              notionPropertyId: mapping.notionPropertyId,
              notionPropertyName: mapping.notionPropertyName,
              notionPropertyType: actionField.propertyType,
              isNewProperty: mapping.isNewProperty || false,
              status: mapping.status,
            };
          }
        );

        // 완성된 매핑 정보 전달
        onMappingComplete(finalMappings);
      } catch (error) {
        console.error("Field mapping error:", error);
        alert("필드 매핑 처리 중 오류가 발생했습니다.");
        hasCompletedRef.current = false; // 에러 시 다시 시도 가능하도록
      } finally {
        setProcessing(false);
      }
    };

    handleComplete();
  }, [
    isAllFieldsMapped,
    mappings,
    processing,
    database.id,
    actionFields,
    onMappingComplete,
  ]);

  return (
    <Card className="border-none shadow-none">
      <CardContent>
        {/* 필드 매핑 목록 */}
        <div className="space-y-4">
          {actionFields.map((actionField) => {
            const mapping = mappings.find(
              (m) => m.actionFieldKey === actionField.key
            );
            const compatibleProperties = getCompatibleProperties(
              actionField.key
            );

            return (
              <Card
                key={actionField.key}
                className={`${
                  !mapping?.notionPropertyId &&
                  !mapping?.isNewProperty &&
                  actionField.propertyType !== "title"
                    ? "border-red-500"
                    : ""
                }`}
              >
                <CardContent className="p-4 flex justify-between flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {actionField.name}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {actionField.propertyType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {actionField.description}
                      </p>
                    </div>
                    <div className="flex-1 max-w-sm ml-4">
                      {actionField.propertyType === "title" ? (
                        // Title 프로퍼티는 비활성화된 상태로 표시
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-between text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">
                              {mapping?.notionPropertyName || "Title 프로퍼티"}
                            </span>
                            {renderStatusBadge(mapping?.status)}
                          </div>
                        </div>
                      ) : (
                        <Dialog.Root
                          open={activeDialogField === actionField.key}
                          onOpenChange={(open) => {
                            if (open) {
                              setActiveDialogField(actionField.key);
                              setSearchTerm("");
                            } else {
                              setActiveDialogField(null);
                              setSearchTerm("");
                            }
                          }}
                        >
                          <Dialog.Trigger asChild>
                            <button
                              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between text-left ${
                                !mapping?.notionPropertyId &&
                                !mapping?.isNewProperty
                                  ? "border-2  bg-red-50"
                                  : "border border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900">
                                  {mapping?.notionPropertyName ||
                                    "프로퍼티 선택..."}
                                </span>
                                {renderStatusBadge(mapping?.status)}
                              </div>
                              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
                              <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <Dialog.Title className="text-lg font-medium text-gray-900">
                                    프로퍼티 선택
                                  </Dialog.Title>
                                  <Dialog.Close asChild>
                                    <button className="p-1 rounded-md hover:bg-gray-100">
                                      <Cross2Icon className="w-4 h-4" />
                                    </button>
                                  </Dialog.Close>
                                </div>
                                <div className="relative">
                                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    placeholder="프로퍼티 검색..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                      setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                {compatibleProperties.length > 0 && (
                                  <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                                      기존 프로퍼티
                                    </div>
                                    {compatibleProperties.map((property) => {
                                      const isUsed = isPropertyUsedElsewhere(
                                        property.id,
                                        actionField.key
                                      );
                                      return (
                                        <button
                                          key={property.id}
                                          className={`w-full px-3 py-2 text-left text-sm rounded-md flex items-center justify-between ${
                                            isUsed
                                              ? "text-gray-400 cursor-not-allowed bg-gray-50"
                                              : "text-gray-900 hover:bg-gray-100 cursor-pointer"
                                          }`}
                                          disabled={isUsed}
                                          onClick={() => {
                                            if (!isUsed) {
                                              selectExistingProperty(
                                                actionField.key,
                                                property
                                              );
                                            }
                                          }}
                                        >
                                          <span className="flex items-center gap-2">
                                            {property.name}
                                            {isUsed && (
                                              <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                                                사용중
                                              </span>
                                            )}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {property.type}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {searchTerm && (
                                  <div className="p-2 border-t border-gray-100">
                                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                                      새 프로퍼티
                                    </div>
                                    {(() => {
                                      // 이미 존재하는 프로퍼티 이름과 중복되는지 확인
                                      const isNameExists =
                                        notionProperties.some(
                                          (prop) =>
                                            prop.name.toLowerCase() ===
                                            searchTerm.toLowerCase()
                                        );

                                      if (isNameExists) {
                                        return (
                                          <div className="w-full px-3 py-2 text-left text-sm text-gray-500 rounded-md bg-gray-50 flex items-center">
                                            <span>
                                              &quot;{searchTerm}&quot; 이름이
                                              이미 존재합니다
                                            </span>
                                          </div>
                                        );
                                      }

                                      return (
                                        <button
                                          className="w-full px-3 py-2 text-left text-sm text-blue-600 rounded-md hover:bg-blue-50 flex items-center"
                                          onClick={() =>
                                            selectNewProperty(
                                              actionField.key,
                                              searchTerm
                                            )
                                          }
                                        >
                                          <span>
                                            + &quot;{searchTerm}&quot; 생성
                                          </span>
                                        </button>
                                      );
                                    })()}
                                  </div>
                                )}
                                {compatibleProperties.length === 0 &&
                                  !searchTerm && (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                      호환되는 프로퍼티가 없습니다. 원하는
                                      프로퍼티를 입력해 생성해주세요.
                                    </div>
                                  )}
                              </div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
