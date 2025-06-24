"use client";

import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { DatabaseSelectedCard } from "@/components/notion/DatabaseSelectedCard";

// FieldMapping 타입 정의
interface FieldMapping {
  actionFieldKey: string;
  notionPropertyId?: string;
  notionPropertyName?: string;
  isNewProperty?: boolean;
  status?: "existing" | "new" | "auto_title";
}

interface ActionConfirmProps {
  selectedDatabase: DatabaseObjectResponse;
  onBack: () => void;
  onConfirm: () => void;
  creating: boolean;
}

export function ActionConfirm({
  selectedDatabase,
  onBack,
  onConfirm,
  creating,
}: ActionConfirmProps) {
  return (
    <Card className="max-w-4xl mx-auto border-none">
      <CardHeader className="text-center">
        <CardTitle>설정 확인</CardTitle>
        <CardDescription>
          액션 설정을 확인하고 생성을 완료하세요
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* 선택된 데이터베이스 정보 */}
        <DatabaseSelectedCard
          database={selectedDatabase}
          onChangeDatabase={onBack}
        />

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← 이전 단계
          </Button>
          <Button onClick={onConfirm} disabled={creating} className="flex-1">
            {creating ? "생성 중..." : "액션 생성하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
