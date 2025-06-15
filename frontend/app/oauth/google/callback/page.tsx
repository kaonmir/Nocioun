"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseOAuthState } from "../../../lib/oauth";
import { supabase } from "../../../lib/supabase";

export default function GoogleOAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Google 인증을 처리 중입니다...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      try {
        if (error) {
          throw new Error(`OAuth 에러: ${error}`);
        }

        if (!code || !state) {
          throw new Error("필수 매개변수가 누락되었습니다.");
        }

        // state 파싱하여 user_id 추출
        const stateData = parseOAuthState(state);
        if (!stateData || !stateData.userId) {
          throw new Error("잘못된 state 매개변수입니다.");
        }

        setMessage("Google에서 토큰을 가져오는 중...");

        // Google OAuth 토큰 교환
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code,
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
              client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
              redirect_uri: `${window.location.origin}/oauth/google/callback`,
              grant_type: "authorization_code",
            }),
          }
        );

        if (!tokenResponse.ok) {
          throw new Error("토큰 교환에 실패했습니다.");
        }

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
          throw new Error("액세스 토큰을 받지 못했습니다.");
        }

        setMessage("토큰을 데이터베이스에 저장하는 중...");

        // 토큰을 데이터베이스에 저장
        const { error: dbError } = await supabase.from("oauth_tokens").upsert(
          {
            user_id: stateData.userId,
            provider: "google",
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: new Date(
              Date.now() + tokens.expires_in * 1000
            ).toISOString(),
            token_type: tokens.token_type || "Bearer",
            scope: tokens.scope,
          },
          {
            onConflict: "user_id,provider",
          }
        );

        if (dbError) {
          throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
        }

        setStatus("success");
        setMessage("Google 계정 연결이 완료되었습니다!");

        // 3초 후 워크스페이스로 리다이렉트
        setTimeout(() => {
          router.replace("/workspace");
        }, 3000);
      } catch (error) {
        console.error("OAuth Callback Error:", error);

        setStatus("error");
        setMessage(
          error instanceof Error
            ? `연결 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다."
        );
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case "success":
        return (
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "text-gray-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
    }
  };

  const handleReturnToWorkspace = () => {
    router.replace("/workspace");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {getStatusIcon()}

          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Google OAuth 인증
          </h1>

          <p className={`mt-2 text-sm ${getStatusColor()}`}>{message}</p>

          {status === "success" && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-3">
                3초 후 워크스페이스로 자동 이동합니다.
              </div>
              <button
                onClick={handleReturnToWorkspace}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                지금 워크스페이스로 이동
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4">
              <button
                onClick={handleReturnToWorkspace}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                워크스페이스로 돌아가기
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {status === "processing" && (
            <div className="mt-4 text-xs text-gray-500">
              이 과정은 몇 초 정도 소요됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
