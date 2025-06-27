"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/hooks/usePageMeta";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusIcon,
  PersonIcon,
  ExitIcon,
  ActivityLogIcon,
  GearIcon,
  TableIcon,
  ExternalLinkIcon,
  DotsVerticalIcon,
  PlayIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase";
import { Action } from "@/types/action";
import { getActions, deleteAction } from "@/lib/actions";
import { getNotionClient } from "@/lib/notion";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { DatabaseIcon } from "@/components/notion/DatabaseIcon";
import { DatabaseHeader } from "@/components/notion/DatabaseHeader";

export default function ActionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionMetadata, setActionMetadata] = useState<
    Record<string, DatabaseObjectResponse>
  >({});
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        await fetchActions();
      }
    };

    getUser();
  }, [supabase.auth]);

  const fetchActions = async () => {
    try {
      setActionsLoading(true);
      setActionsError(null);

      const actions = await getActions();

      const notionClient = await getNotionClient();
      const actionMetadata: Record<string, DatabaseObjectResponse> = {};

      // Promise.all을 사용하여 모든 비동기 작업이 완료될 때까지 기다림
      await Promise.all(
        actions.map(async (action) => {
          if (action.target_type === "database") {
            try {
              const databaseData = (await notionClient.databases.retrieve({
                database_id: action.target_id,
              })) as DatabaseObjectResponse;
              actionMetadata[action.id] = databaseData;
            } catch (error) {
              console.error(
                `Database retrieve error for ${action.target_id}:`,
                error
              );
              // 개별 데이터베이스 조회 실패 시에도 다른 액션들은 정상적으로 표시되도록 함
            }
          }
        })
      );

      setActions(actions);
      setActionMetadata(actionMetadata);
    } catch (error) {
      console.error("Actions fetch error:", error);
      setActionsError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setActionsLoading(false);
    }
  };

  const handleDeleteAction = (action: Action) => {
    setActionToDelete(action);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAction = async () => {
    if (!actionToDelete) return;

    try {
      setDeleting(true);
      await deleteAction(actionToDelete.id);

      setActions((prev) =>
        prev.filter((action) => action.id !== actionToDelete.id)
      );
      setDeleteDialogOpen(false);
      setActionToDelete(null);
    } catch (error) {
      console.error("Action delete error:", error);
      alert("액션 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case "map":
        return "카카오맵 연동";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "paused":
        return "일시정지";
      case "error":
        return "오류";
      case "draft":
        return "초안";
      default:
        return status;
    }
  };

  if (loading) return <LoadingCard message="액션 목록을 불러오는 중..." />;
  return (
    <>
      <PageMeta
        title="액션 관리"
        description="생성된 액션들을 확인하고 관리해보세요"
      />

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center ">
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

      {/* 내 Actions 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TableIcon className="w-5 h-5 mr-2" />
              <span>내 Actions</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActions}
              disabled={actionsLoading}
            >
              {actionsLoading ? "새로고침 중..." : "새로고침"}
            </Button>
          </CardTitle>
          <CardDescription>
            현재 생성된 모든 액션들을 확인하고 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                액션 목록을 불러오는 중...
              </p>
            </div>
          ) : actionsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{actionsError}</p>
              <Button variant="outline" onClick={fetchActions}>
                다시 시도
              </Button>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                아직 생성된 액션이 없습니다
              </p>
              <p className="text-sm mb-4">
                첫 번째 액션을 만들어서 시작해보세요!
              </p>
              <Link href="/actions/new">
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />첫 액션 만들기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg flex items-center">
                          <DatabaseHeader
                            database={actionMetadata[action.id]}
                          />
                          에 {getActionTypeLabel(action.action_type)}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            action.status
                          )}`}
                        >
                          {getStatusLabel(action.status)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/actions/${action.id}/run`}>
                          <Button variant="outline" size="sm">
                            <PlayIcon className="w-4 h-4 mr-1" />
                            실행하기
                          </Button>
                        </Link>
                        <Link href={`/actions/${action.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil1Icon className="w-4 h-4 mr-1" />
                            수정
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <DotsVerticalIcon className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteAction(action)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            <p className="text-sm mt-2">액션을 실행하면 여기에 표시됩니다!</p>
          </div>
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>액션 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 액션을 삭제하시겠습니까?{" "}
              {actionToDelete && (
                <span className="font-semibold">
                  {getActionTypeLabel(actionToDelete.action_type)} -{" "}
                  {actionToDelete.target_type === "database"
                    ? "Notion 데이터베이스"
                    : "Notion 페이지"}
                  &quot;
                </span>
              )}
              <br />
              <span className="text-red-600">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAction}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
