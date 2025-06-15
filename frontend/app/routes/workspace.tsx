import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/workspace";
import { supabase } from "../lib/supabase";
import {
  initiateGoogleOAuth,
  getOAuthToken,
  getGoogleContacts,
} from "../lib/oauth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "워크스페이스 - Nocioun" },
    {
      name: "description",
      content: "Google Contacts와 Notion을 연결하고 동기화를 관리하세요.",
    },
  ];
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface ConnectionStatus {
  google: boolean;
  notion: boolean;
}

interface OAuthToken {
  id: string;
  provider: string;
  access_token: string;
  expires_at: string;
  created_at: string;
}

export default function Workspace() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionStatus>({
    google: false,
    notion: false,
  });
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [contactsCount, setContactsCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  // 페이지가 다시 포커스될 때 연결 상태 확인 (OAuth 완료 후 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        checkConnectionStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/login");
        return;
      }
      setUser(user);
    } catch (error) {
      console.error("User check error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      // Google 연결 상태 확인
      const googleToken = await getOAuthToken("google").catch(() => null);

      // Notion 연결 상태 확인 (아직 구현되지 않음)
      // const notionToken = await getOAuthToken("notion").catch(() => null);

      const isGoogleConnected =
        !!googleToken && new Date(googleToken.expires_at) > new Date();

      setConnections({
        google: isGoogleConnected,
        notion: false, // TODO: 아직 구현되지 않음
      });

      // Google이 연결되어 있으면 연락처 수 가져오기
      if (isGoogleConnected && googleToken) {
        try {
          const contacts = await getGoogleContacts(googleToken.access_token);
          setContactsCount(contacts.length);
        } catch (error) {
          console.error("Failed to fetch contacts count:", error);
          setContactsCount(0);
        }
      } else {
        setContactsCount(0);
      }
    } catch (error) {
      console.error("Connection status check error:", error);
      setConnections({
        google: false,
        notion: false,
      });
      setContactsCount(0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleConnectGoogle = async () => {
    try {
      setMessage(
        "Google 인증 페이지를 새 탭에서 열었습니다. 인증을 완료해주세요."
      );

      // Google OAuth 플로우 시작 (새 탭에서)
      await initiateGoogleOAuth();

      // 메시지 5초 후 클리어
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error) {
      console.error("Google OAuth Error:", error);
      setMessage(
        error instanceof Error
          ? `Google 연결 실패: ${error.message}`
          : "Google 연결 중 오류가 발생했습니다."
      );

      // 에러 메시지 5초 후 클리어
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      setMessage("Google 연결을 해제하는 중...");

      // 데이터베이스에서 Google 토큰 삭제
      const { error } = await supabase
        .from("oauth_tokens")
        .delete()
        .eq("provider", "google");

      if (error) {
        throw error;
      }

      setMessage("Google 연결이 해제되었습니다.");

      // 연결 상태 다시 확인
      await checkConnectionStatus();

      // 성공 메시지 3초 후 클리어
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Google Disconnect Error:", error);
      setMessage("Google 연결 해제 중 오류가 발생했습니다.");

      // 에러 메시지 5초 후 클리어
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleConnectNotion = async () => {
    setMessage("Notion 연결 기능을 준비 중입니다...");
    // TODO: Notion API 연동 구현
  };

  const handleSync = async () => {
    if (!connections.google) {
      setMessage("먼저 Google을 연결해주세요.");
      return;
    }

    setSyncStatus("syncing");
    setMessage("Google Contacts 데이터를 가져오는 중...");

    try {
      // Google 토큰 가져오기
      const googleToken = await getOAuthToken("google");
      if (!googleToken) {
        throw new Error("Google 토큰을 찾을 수 없습니다.");
      }

      // Google Contacts 데이터 가져오기
      const contacts = await getGoogleContacts(googleToken.access_token);

      // 동기화 로그 저장
      const { error: logError } = await supabase.from("sync_logs").insert({
        provider: "google",
        service_type: "contacts",
        status: "success",
        message: `${contacts.length}개의 연락처를 성공적으로 가져왔습니다.`,
        synced_count: contacts.length,
      });

      if (logError) {
        console.error("Failed to save sync log:", logError);
      }

      setSyncStatus("success");
      setMessage(
        `동기화가 완료되었습니다! ${contacts.length}개의 연락처를 가져왔습니다.`
      );
      setContactsCount(contacts.length);
      setLastSyncTime(new Date().toLocaleString("ko-KR"));

      // 성공 메시지 5초 후 클리어
      setTimeout(() => {
        setMessage("");
        setSyncStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Sync error:", error);

      // 동기화 실패 로그 저장
      const { error: logError } = await supabase.from("sync_logs").insert({
        provider: "google",
        service_type: "contacts",
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "동기화 중 오류가 발생했습니다.",
        error_details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        synced_count: 0,
      });

      if (logError) {
        console.error("Failed to save error log:", logError);
      }

      setSyncStatus("error");
      setMessage(
        error instanceof Error
          ? `동기화 실패: ${error.message}`
          : "동기화 중 오류가 발생했습니다."
      );

      // 에러 메시지 5초 후 클리어
      setTimeout(() => {
        setMessage("");
        setSyncStatus("idle");
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full px-4 py-6 mx-auto max-w-7xl">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Nocioun
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user?.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </nav>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            워크스페이스
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Google Contacts와 Notion을 연결하여 연락처를 자동으로 동기화하세요
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-lg text-center ${
              message.includes("완료") || message.includes("성공")
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : message.includes("오류") || message.includes("실패")
                ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                : "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Google Contacts Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
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
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Google Contacts
                </h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  connections.google
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {connections.google ? "연결됨" : "연결 안됨"}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Google Contacts에서 연락처를 가져와 Notion과 동기화합니다.
            </p>

            {connections.google ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">연결 완료</span>
                </div>
                <button
                  onClick={handleDisconnectGoogle}
                  className="w-full py-2 px-4 rounded-lg font-medium text-red-600 border border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 transition-colors"
                >
                  연결 해제
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Google 연결하기
              </button>
            )}
          </div>

          {/* Notion Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold text-lg">
                    N
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notion
                </h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  connections.notion
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {connections.notion ? "연결됨" : "연결 안됨"}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Notion 데이터베이스에 연락처 정보를 저장하고 관리합니다.
            </p>

            <button
              onClick={handleConnectNotion}
              disabled={connections.notion}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                connections.notion
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              }`}
            >
              {connections.notion ? "연결 완료" : "Notion 연결하기"}
            </button>
          </div>
        </div>

        {/* Sync Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            동기화 실행
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Google Contacts의 연락처를 Notion 데이터베이스로 동기화합니다.
          </p>

          {syncStatus === "syncing" && (
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-600 dark:text-blue-400">
                동기화 진행 중...
              </span>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={!connections.google || syncStatus === "syncing"}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
              !connections.google || syncStatus === "syncing"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {syncStatus === "syncing"
              ? "동기화 중..."
              : "Google Contacts 가져오기"}
          </button>

          {!connections.google && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              동기화를 실행하려면 먼저 Google을 연결해주세요.
            </p>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {contactsCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Google Contacts 수
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
              {lastSyncTime || "없음"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              마지막 동기화
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div
              className={`text-2xl font-bold mb-2 ${
                syncStatus === "success"
                  ? "text-green-600 dark:text-green-400"
                  : syncStatus === "error"
                  ? "text-red-600 dark:text-red-400"
                  : syncStatus === "syncing"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {syncStatus === "success"
                ? "✓"
                : syncStatus === "error"
                ? "✗"
                : syncStatus === "syncing"
                ? "⟳"
                : "—"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              동기화 상태
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
