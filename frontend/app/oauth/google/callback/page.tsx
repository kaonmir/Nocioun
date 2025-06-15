"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseOAuthState } from "../../../lib/oauth";

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

        // 서버 사이드 API Route로 토큰 교환 요청
        const tokenResponse = await fetch("/api/oauth/google/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            state,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || "토큰 교환에 실패했습니다.");
        }

        const result = await tokenResponse.json();

        if (!result.success) {
          throw new Error(result.error || "토큰 처리에 실패했습니다.");
        }

        setStatus("success");
        setMessage(result.message || "Google 계정 연결이 완료되었습니다!");

        // 부모 창에 성공 메시지 전송 (팝업인 경우)
        if (window.opener) {
          window.opener.postMessage(
            { type: "GOOGLE_OAUTH_SUCCESS" },
            window.location.origin
          );
          // 3초 후 창 닫기
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          // 일반 창인 경우 워크스페이스로 리다이렉트
          setTimeout(() => {
            router.replace("/workspace");
          }, 3000);
        }
      } catch (error) {
        console.error("OAuth Callback Error:", error);

        setStatus("error");
        setMessage(
          error instanceof Error
            ? `연결 실패: ${error.message}`
            : "알 수 없는 오류가 발생했습니다."
        );

        // 부모 창에 에러 메시지 전송 (팝업인 경우)
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_OAUTH_ERROR",
              error: error instanceof Error ? error.message : "알 수 없는 오류",
            },
            window.location.origin
          );
        }
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
    if (window.opener) {
      window.close();
    } else {
      router.replace("/workspace");
    }
  };

  const handleCloseWindow = () => {
    if (window.opener) {
      window.close();
    } else {
      router.replace("/workspace");
    }
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
                {window.opener
                  ? "3초 후 창이 자동으로 닫힙니다."
                  : "3초 후 워크스페이스로 자동 이동합니다."}
              </div>
              <button
                onClick={handleReturnToWorkspace}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                {window.opener ? "창 닫기" : "지금 워크스페이스로 이동"}
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4">
              <button
                onClick={handleCloseWindow}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors mr-2"
              >
                {window.opener ? "창 닫기" : "워크스페이스로 돌아가기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
