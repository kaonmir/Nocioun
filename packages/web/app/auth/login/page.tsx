"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // 이미 로그인된 사용자인지 확인
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace("/actions");
        return;
      }
      setChecking(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  const handleNotionLogin = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "notion",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/actions`,
        },
      });

      if (error) {
        console.error("Login error:", error);
        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        setLoading(false);
      }
      // OAuth 플로우가 시작되면 현재 페이지가 리다이렉트됩니다
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  // 로그인 상태 확인 중이면 로딩 표시
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="text-center">
          <ReloadIcon className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>로그인 상태를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-lg flex items-center justify-center">
              <img
                src="/icons/notion.svg"
                alt="Notion"
                className="w-16 h-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Notion으로 로그인</CardTitle>
            <CardDescription className="text-gray-600">
              Notion 워크스페이스에 연결하여 Actions를 사용하세요.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={handleNotionLogin}
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <ReloadIcon className="animate-spin h-4 w-4 mr-2" />
                  로그인 중...
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <img
                    src="/icons/notion.svg"
                    alt="Notion"
                    className="w-5 h-5 object-contain mr-2"
                  />
                  Notion으로 계속하기
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                로그인하면{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  이용약관
                </a>
                과{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  개인정보처리방침
                </a>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>

            <hr className="my-6" />

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="text-gray-600"
              >
                ← 홈으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내 정보 */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🔒 안전한 연결</h3>
            <p className="text-sm text-blue-700">
              Notion OAuth를 통해 안전하게 연결됩니다. 귀하의 Notion 데이터는
              본인만 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
