"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  PlusIcon,
  PersonIcon,
  ExitIcon,
  ActivityLogIcon,
  GearIcon,
  CheckIcon,
  TableIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase";

interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: string[];
}

export default function ActionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [databasesLoading, setDatabasesLoading] = useState(false);
  const [databasesError, setDatabasesError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      // 사용자가 로그인된 경우 데이터베이스 목록 가져오기
      if (user) {
        await fetchNotionDatabases();
      }
    };

    getUser();
  }, [supabase.auth]);

  const fetchNotionDatabases = async () => {
    setDatabasesLoading(true);
    setDatabasesError(null);

    try {
      const response = await fetch("/api/notion/databases");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "데이터베이스를 가져오는데 실패했습니다."
        );
      }

      setDatabases(data.databases || []);
    } catch (error) {
      console.error("Error fetching databases:", error);
      setDatabasesError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setDatabasesLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              안녕하세요, {user?.user_metadata?.name || "사용자"}님! 👋
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Notion과 연결된 Actions를 관리하고 새로운 기능을 추가하세요.
            </p>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <PersonIcon className="w-4 h-4" />
              <span>{user?.user_metadata?.name || user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <ExitIcon className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                새로운 Action 만들기
              </CardTitle>
              <CardDescription>
                새로운 Notion 연동 기능을 추가해보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/actions/new">
                <Button className="w-full">Action 추가하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GearIcon className="w-5 h-5 mr-2" />내 Actions
              </CardTitle>
              <CardDescription>
                현재 활성화된 Actions를 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                곧 출시 예정
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notion 데이터베이스 목록 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TableIcon className="w-5 h-5 mr-2" />내 Notion 데이터베이스
              </CardTitle>
              <CardDescription>
                연결된 Notion 워크스페이스의 데이터베이스 목록입니다.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotionDatabases}
              disabled={databasesLoading}
            >
              {databasesLoading ? "새로고침 중..." : "새로고침"}
            </Button>
          </CardHeader>
          <CardContent>
            {databasesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent mr-3"></div>
                <span className="text-muted-foreground">
                  데이터베이스 목록을 불러오는 중...
                </span>
              </div>
            ) : databasesError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{databasesError}</p>
                <Button variant="outline" onClick={fetchNotionDatabases}>
                  다시 시도
                </Button>
              </div>
            ) : databases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>연결된 Notion 데이터베이스가 없습니다.</p>
                <p className="text-sm mt-2">
                  Notion 워크스페이스를 먼저 연결해주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {databases.map((database) => (
                  <div
                    key={database.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <TableIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {database.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>속성 {database.properties.length}개</span>
                          <span>
                            업데이트: {formatDate(database.last_edited_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(database.url, "_blank")}
                      >
                        <ExternalLinkIcon className="w-4 h-4 mr-1" />
                        열기
                      </Button>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Action 생성
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ActivityLogIcon className="w-5 h-5 mr-2" />
              최근 활동
            </CardTitle>
            <CardDescription>
              최근 실행된 Actions 및 동기화 내역을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>아직 활동 내역이 없습니다.</p>
              <p className="text-sm mt-2">첫 번째 Action을 만들어보세요!</p>
            </div>
          </CardContent>
        </Card>

        {/* 연결된 서비스 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GearIcon className="w-5 h-5 mr-2" />
              연결된 서비스
            </CardTitle>
            <CardDescription>
              Notion 및 기타 연결된 서비스들을 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center border">
                    <span className="text-sm font-semibold">N</span>
                  </div>
                  <div>
                    <p className="font-medium">Notion</p>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      {user?.user_metadata?.notion_access_token ? (
                        <>
                          <CheckIcon className="w-3 h-3 text-green-600" />
                          <span>워크스페이스 연결됨</span>
                        </>
                      ) : (
                        <>
                          <ExitIcon className="w-3 h-3 text-orange-600" />
                          <span>연결 필요</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <GearIcon className="w-4 h-4 mr-1" />
                  설정
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
