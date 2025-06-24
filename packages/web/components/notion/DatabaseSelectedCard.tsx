import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { DatabaseIcon } from "./DatabaseIcon";

interface DatabaseSelectedCardProps {
  database: {
    icon?: any;
    title?: Array<{ plain_text: string }>;
    description?: Array<{ plain_text: string }>;
  };
  onChangeDatabase?: () => void;
}

export function DatabaseSelectedCard({
  database,
  onChangeDatabase,
}: DatabaseSelectedCardProps) {
  return (
    <Card className="bg-blue-50 mb-6 border-blue-100 hover:border-blue-200 hover:bg-blue-100 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DatabaseIcon icon={database.icon} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {database.title?.[0]?.plain_text || "제목 없음"}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {database.description?.[0]?.plain_text || "노션 데이터베이스"}
              </p>
            </div>
          </div>
          {onChangeDatabase && (
            <Button onClick={onChangeDatabase} variant="outline" size="sm">
              변경하기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
