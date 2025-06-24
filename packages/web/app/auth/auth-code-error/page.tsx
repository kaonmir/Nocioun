"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">인증 오류</CardTitle>
            <CardDescription className="text-gray-600">
              로그인 과정에서 오류가 발생했습니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Notion 인증 과정에서 문제가 발생했습니다. 다시 시도해주시거나
                잠시 후에 다시 시도해주세요.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                다시 로그인하기
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                홈으로 돌아가기
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                문제가 지속되면{" "}
                <a
                  href="mailto:support@example.com"
                  className="text-blue-600 hover:underline"
                >
                  고객지원
                </a>
                으로 문의해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
