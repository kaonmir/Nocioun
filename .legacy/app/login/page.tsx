"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "notion" | null>(null);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user && !error) {
        // 이미 로그인된 사용자는 워크스페이스로 리다이렉트
        router.replace("/workspace");
        return;
      }
    } catch (error) {
      console.error("User check error:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/workspace`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage(error.message || "Google 로그인 중 오류가 발생했습니다.");
      setLoading(null);
    }
  };

  const handleNotionLogin = async () => {
    setLoading("notion");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "notion",
        options: {
          redirectTo: `${window.location.origin}/workspace`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage(error.message || "Notion 로그인 중 오류가 발생했습니다.");
      setLoading(null);
    }
  };

  // 사용자 상태 확인 중이면 로딩 표시
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            로그인 상태를 확인하는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Nocioun
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            로그인
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            선호하는 계정으로 간편하게 로그인하세요
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Message */}
          {message && (
            <div className="mb-6 p-3 rounded-lg text-sm bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {message}
            </div>
          )}

          <div className="space-y-4">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading !== null}
              className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {loading === "google" ? "Google 로그인 중..." : "Google로 로그인"}
            </button>

            {/* Notion Login Button */}
            <button
              onClick={handleNotionLogin}
              disabled={loading !== null}
              className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "notion" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
              ) : (
                <div className="w-5 h-5 mr-3 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold text-xs">
                    N
                  </span>
                </div>
              )}
              {loading === "notion"
                ? "Notion 로그인 중..."
                : "Notion으로 로그인"}
            </button>
          </div>

          {/* Security Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 안전한 OAuth를 통해 로그인합니다.
              <br />
              귀하의 비밀번호는 저장되지 않습니다.
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              로그인하면{" "}
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                서비스 약관
              </a>
              과{" "}
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                개인정보 처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
