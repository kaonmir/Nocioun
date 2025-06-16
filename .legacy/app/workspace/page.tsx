"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabase";
import {
  initiateGoogleOAuth,
  getOAuthToken,
  getGoogleContacts,
  initiateNotionOAuth,
  getNotionDatabases,
  getNotionDatabaseProperties,
} from "../lib/oauth";
import { UserProfile } from "../components/UserProfile";
import { propertyMappings as defaultPropertyMappings } from "../lib/property-mappings";

export default function WorkspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);
  const [checkingNotionConnection, setCheckingNotionConnection] =
    useState(false);
  const [disconnectingNotion, setDisconnectingNotion] = useState(false);
  const [testingContacts, setTestingContacts] = useState(false);
  const [notionDatabases, setNotionDatabases] = useState<any[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>("");
  const [databaseProperties, setDatabaseProperties] = useState<any>({});
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [propertyMappings, setPropertyMappings] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    checkUser();

    // OAuth 팝업에서 오는 메시지 리스너
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_OAUTH_SUCCESS") {
        // Google 연결 성공 시 상태 업데이트
        setGoogleConnected(true);
        setCheckingConnection(false);
      } else if (event.data.type === "GOOGLE_OAUTH_ERROR") {
        // Google 연결 실패 시 에러 처리
        setCheckingConnection(false);
        alert(`Google 연결 실패: ${event.data.error}`);
      } else if (event.data.type === "NOTION_OAUTH_SUCCESS") {
        // Notion 연결 성공 시 상태 업데이트
        setNotionConnected(true);
        setCheckingNotionConnection(false);
      } else if (event.data.type === "NOTION_OAUTH_ERROR") {
        // Notion 연결 실패 시 에러 처리
        setCheckingNotionConnection(false);
        alert(`Notion 연결 실패: ${event.data.error}`);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // notionConnected가 true가 될 때마다 데이터베이스 목록 로드
  useEffect(() => {
    if (notionConnected) {
      loadNotionDatabases();
    }
  }, [notionConnected]);

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);
      await checkGoogleConnection();
      await checkNotionConnection();
    } catch (error) {
      console.error("User check error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const token = await getOAuthToken("google");
      setGoogleConnected(!!token);
    } catch (error) {
      setGoogleConnected(false);
    }
  };

  const checkNotionConnection = async () => {
    try {
      const token = await getOAuthToken("notion");
      const isConnected = !!token;
      setNotionConnected(isConnected);
      return isConnected;
    } catch (error) {
      setNotionConnected(false);
      return false;
    }
  };

  const handleGoogleConnect = async () => {
    setCheckingConnection(true);
    try {
      await initiateGoogleOAuth();
    } catch (error) {
      console.error("Google 연결 오류:", error);
      alert(`Google 연결 중 오류가 발생했습니다: ${error}`);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm("정말로 Google 연결을 해제하시겠습니까?")) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch("/api/oauth/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "google",
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "연결 해제에 실패했습니다.");
      }

      const result = await response.json();

      // 상태 업데이트
      setGoogleConnected(false);
      alert(result.message || "Google 연결이 해제되었습니다.");
    } catch (error) {
      console.error("Google 연결 해제 오류:", error);
      alert(`Google 연결 해제 중 오류가 발생했습니다: ${error}`);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleNotionConnect = async () => {
    setCheckingNotionConnection(true);
    try {
      await initiateNotionOAuth();
    } catch (error) {
      console.error("Notion 연결 오류:", error);
      alert(`Notion 연결 중 오류가 발생했습니다: ${error}`);
    } finally {
      setCheckingNotionConnection(false);
    }
  };

  const handleNotionDisconnect = async () => {
    if (!confirm("정말로 Notion 연결을 해제하시겠습니까?")) {
      return;
    }

    setDisconnectingNotion(true);
    try {
      const response = await fetch("/api/oauth/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "notion",
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "연결 해제에 실패했습니다.");
      }

      const result = await response.json();

      // 상태 업데이트
      setNotionConnected(false);
      alert(result.message || "Notion 연결이 해제되었습니다.");
    } catch (error) {
      console.error("Notion 연결 해제 오류:", error);
      alert(`Notion 연결 해제 중 오류가 발생했습니다: ${error}`);
    } finally {
      setDisconnectingNotion(false);
    }
  };

  const handleTestContacts = async () => {
    if (!googleConnected) {
      alert("Google 연결이 필요합니다.");
      return;
    }

    setTestingContacts(true);
    try {
      // Google OAuth 토큰 가져오기
      const tokenData = await getOAuthToken("google");

      // Google Contacts API 호출
      const contacts = await getGoogleContacts(tokenData.access_token);

      if (contacts && contacts.length > 0) {
        alert(
          `성공! ${contacts.length}개의 연락처를 가져왔습니다. 콘솔을 확인해주세요.`
        );
      } else {
        alert("연락처를 찾을 수 없습니다. 콘솔을 확인해주세요.");
      }
    } catch (error) {
      console.error("Google Contacts API 테스트 오류:", error);
      alert(`API 테스트 실패: ${error}`);
    } finally {
      setTestingContacts(false);
    }
  };

  const loadNotionDatabases = async () => {
    if (!notionConnected || !user) return;

    setLoadingDatabases(true);
    try {
      const databases = await getNotionDatabases(user.id);
      setNotionDatabases(databases);
    } catch (error) {
      console.error("Notion 데이터베이스 로드 오류:", error);
      alert(`데이터베이스 목록을 가져오는데 실패했습니다: ${error}`);
    } finally {
      setLoadingDatabases(false);
    }
  };

  const handleDatabaseSelect = async (databaseId: string) => {
    if (!databaseId) {
      setSelectedDatabaseId("");
      setDatabaseProperties({});
      return;
    }

    if (!user) {
      alert("사용자 정보를 확인할 수 없습니다.");
      return;
    }

    setSelectedDatabaseId(databaseId);

    try {
      const properties = await getNotionDatabaseProperties(user.id, databaseId);
      setDatabaseProperties(properties);
    } catch (error) {
      console.error("데이터베이스 속성 로드 오류:", error);
      alert(`데이터베이스 속성을 가져오는데 실패했습니다: ${error}`);
    }
  };

  const handlePropertyMappingChange = (
    googleProperty: string,
    notionProperty: string
  ) => {
    setPropertyMappings((prev) => ({
      ...prev,
      [googleProperty]: notionProperty,
    }));
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
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Nocioun
            </span>
          </Link>

          <UserProfile user={user} />
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
                  googleConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {googleConnected ? "연결됨" : "연결 안됨"}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Google Contacts에서 연락처를 가져와 Notion과 동기화합니다.
            </p>

            {googleConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
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
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Google 연결이 완료되었습니다
                  </span>
                </div>
                <button
                  onClick={handleGoogleDisconnect}
                  disabled={disconnecting}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed"
                >
                  {disconnecting ? "연결 해제 중..." : "Google 연결 해제"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleConnect}
                disabled={checkingConnection}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  checkingConnection
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {checkingConnection ? "연결 중..." : "Google 연결하기"}
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
                  notionConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {notionConnected ? "연결됨" : "연결 안됨"}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Notion 데이터베이스에 연락처 정보를 저장하고 관리합니다.
            </p>

            {notionConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
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
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Notion 연결이 완료되었습니다
                  </span>
                </div>

                {/* 데이터베이스 선택 드롭다운 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    동기화할 데이터베이스 선택
                  </label>
                  <select
                    value={selectedDatabaseId}
                    onChange={(e) => handleDatabaseSelect(e.target.value)}
                    disabled={loadingDatabases}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">
                      {loadingDatabases
                        ? "데이터베이스 로딩 중..."
                        : "데이터베이스를 선택하세요"}
                    </option>
                    {notionDatabases.map((db) => (
                      <option key={db.id} value={db.id}>
                        {db.title}
                      </option>
                    ))}
                  </select>
                  {loadingDatabases && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        데이터베이스 목록을 불러오는 중...
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNotionDisconnect}
                  disabled={disconnectingNotion}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed"
                >
                  {disconnectingNotion ? "연결 해제 중..." : "Notion 연결 해제"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNotionConnect}
                disabled={checkingNotionConnection}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                  checkingNotionConnection
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                }`}
              >
                {checkingNotionConnection ? "연결 중..." : "Notion 연결하기"}
              </button>
            )}
          </div>
        </div>

        {/* Property Mapping Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            속성 매핑 설정
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            Google Contacts의 속성을 Notion 데이터베이스의 어떤 속성에 매핑할지
            설정하세요.
          </p>

          {!selectedDatabaseId ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                먼저 Notion 데이터베이스를 선택해주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {defaultPropertyMappings.map((group) => (
                <div key={group.id}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div
                      className={`w-2 h-2 bg-${group.color} rounded-full mr-3`}
                    ></div>
                    {group.title}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className={`bg-${group.bgColor}`}>
                          <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                            Google Contacts 속성
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                            Notion 속성
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.properties.map((property) => (
                          <tr
                            key={property.key}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                              <code
                                className={`${group.codeColor} px-2 py-1 rounded text-sm font-mono`}
                              >
                                {property.label}
                              </code>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                              <select
                                value={
                                  propertyMappings[
                                    group.id + "." + property.key
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handlePropertyMappingChange(
                                    group.id + "." + property.key,
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${group.focusColor}`}
                              >
                                <option value="">매핑하지 않음</option>
                                {Object.entries(databaseProperties).map(
                                  ([propKey, propValue]: [string, any]) => {
                                    // 타입 호환성 확인
                                    const isTypeCompatible =
                                      property.notionType === propValue.type ||
                                      (property.notionType === "rich_text" &&
                                        propValue.type === "title");

                                    // 현재 속성에서 선택한 값이거나, 다른 곳에서 선택되지 않은 경우에만 활성화
                                    const isCurrentSelection =
                                      propertyMappings[property.key] ===
                                      propKey;
                                    const isSelectedElsewhere = Object.entries(
                                      propertyMappings
                                    ).some(
                                      ([otherKey, otherValue]) =>
                                        otherKey !== property.key &&
                                        otherValue === propKey
                                    );

                                    // 타입 호환되지 않거나 다른 곳에서 선택된 경우 비활성화
                                    const isDisabled =
                                      !isTypeCompatible ||
                                      (isSelectedElsewhere &&
                                        !isCurrentSelection);

                                    return (
                                      <option
                                        key={propKey}
                                        value={propKey}
                                        disabled={isDisabled}
                                        style={
                                          isDisabled
                                            ? {
                                                color: "#9CA3AF",
                                                backgroundColor: "#F3F4F6",
                                              }
                                            : {}
                                        }
                                      >
                                        {propValue.name} ({propValue.type})
                                        {!isTypeCompatible
                                          ? " (타입 불일치)"
                                          : isSelectedElsewhere
                                          ? " (이미 사용됨)"
                                          : ""}
                                      </option>
                                    );
                                  }
                                )}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                if (!selectedDatabaseId) {
                  alert("먼저 데이터베이스를 선택해주세요.");
                  return;
                }
                alert(
                  `매핑 설정이 저장되었습니다.\n선택된 DB: ${
                    notionDatabases.find((db) => db.id === selectedDatabaseId)
                      ?.title
                  }\n매핑된 속성: ${
                    Object.keys(propertyMappings).filter(
                      (key) => propertyMappings[key]
                    ).length
                  }개`
                );
              }}
              disabled={!selectedDatabaseId}
              className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selectedDatabaseId
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
              }`}
            >
              매핑 설정 저장
            </button>
          </div>
        </div>

        {/* Sync Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            동기화 실행
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Google Contacts의 연락처를 Notion 데이터베이스로 동기화합니다.
          </p>

          {selectedDatabaseId && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                선택된 동기화 설정
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>대상 데이터베이스:</strong>{" "}
                {
                  notionDatabases.find((db) => db.id === selectedDatabaseId)
                    ?.title
                }
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>매핑된 속성:</strong>{" "}
                {
                  Object.keys(propertyMappings).filter(
                    (key) => propertyMappings[key]
                  ).length
                }
                개
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => {
                if (!selectedDatabaseId) {
                  alert("먼저 동기화할 Notion 데이터베이스를 선택해주세요.");
                  return;
                }
                alert("동기화 기능을 구현 중입니다.");
              }}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                googleConnected && notionConnected && selectedDatabaseId
                  ? "bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
              }`}
              disabled={
                !googleConnected || !notionConnected || !selectedDatabaseId
              }
            >
              Google Contacts → Notion 동기화
            </button>

            <button
              onClick={handleTestContacts}
              disabled={testingContacts || !googleConnected}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                testingContacts || !googleConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-green-600 text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              {testingContacts ? "테스트 중..." : "Google Contacts API 테스트"}
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {googleConnected && notionConnected && selectedDatabaseId
              ? "모든 설정이 완료되었습니다. 동기화를 시작할 수 있습니다."
              : googleConnected && notionConnected && !selectedDatabaseId
              ? "동기화할 Notion 데이터베이스를 선택해주세요."
              : !googleConnected && !notionConnected
              ? "동기화를 실행하려면 먼저 Google과 Notion을 모두 연결해주세요."
              : !googleConnected
              ? "Google 연결이 필요합니다."
              : "Notion 연결이 필요합니다."}
          </p>
        </div>
      </main>
    </div>
  );
}
