"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ArrowRightIcon } from "@radix-ui/react-icons";

interface NotionOAuthProps {
  onSuccess: () => void;
}

export function NotionOAuth({ onSuccess }: NotionOAuthProps) {
  const handleOAuthClick = () => {
    // Notion OAuth 시작
    window.location.href = "/api/auth/notion";
  };

  return (
    <Card className="max-w-md mx-auto border-none">
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
          <img src="/icons/notion.svg" alt="Notion" className="w-16 h-16" />
        </div>
        <CardTitle>Notion과 연결하기</CardTitle>
        <CardDescription>
          카카오맵 장소를 저장할 Notion 워크스페이스에 연결하세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Button
          onClick={handleOAuthClick}
          className="w-full bg-black hover:bg-gray-800"
          size="lg"
        >
          <ArrowRightIcon className="w-5 h-5 mr-2" />
          Notion으로 로그인
        </Button>

        <div className="text-sm text-gray-500 text-center">
          <p>연결 후 다음 권한이 필요합니다:</p>
          <ul className="mt-2 space-y-1">
            <li>• 데이터베이스 읽기 및 쓰기</li>
            <li>• 페이지 생성</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
