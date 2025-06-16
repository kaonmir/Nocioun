"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { supabase } from "@/supabase/supabase";
import { Database } from "@/supabase/database.types";

type Action = Database["public"]["Tables"]["actions"]["Row"];

export default function ActionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      await fetchActions(session.user.id);
    } catch (error) {
      console.error("인증 확인 오류:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async (userId: string) => {
    setActionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("액션 조회 오류:", error);
        return;
      }

      setActions(data || []);
    } catch (error) {
      console.error("액션 조회 오류:", error);
    } finally {
      setActionsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { class: "badge-warning", text: "대기 중" },
      running: { class: "badge-info", text: "실행 중" },
      completed: { class: "badge-success", text: "완료" },
      failed: { class: "badge-error", text: "실패" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      class: "badge-neutral",
      text: status,
    };

    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* 헤더 */}
      <div className="navbar bg-base-200 shadow-sm">
        <div className="navbar-start">
          <a href="/" className="btn btn-ghost text-xl">
            🌟 Nocioun
          </a>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">내 액션</h1>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <div className="text-sm text-base-content/70 px-4 py-2">
                  {user?.email}
                </div>
              </li>
              <li>
                <a onClick={handleSignOut}>로그아웃</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {/* 액션 생성 버튼 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-base-content">액션 목록</h2>
            <p className="text-base-content/70 mt-2">
              생성한 액션들을 관리하고 모니터링하세요
            </p>
          </div>
          <button className="btn btn-primary">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            새 액션 만들기
          </button>
        </div>

        {/* 액션 목록 */}
        {actionsLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-base-content mb-2">
              아직 액션이 없습니다
            </h3>
            <p className="text-base-content/70 mb-6">
              첫 번째 액션을 만들어서 자동화를 시작해보세요!
            </p>
            <button className="btn btn-primary">첫 액션 만들기</button>
          </div>
        ) : (
          <div className="grid gap-6">
            {actions.map((action) => (
              <div
                key={action.id}
                className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="card-title text-xl">{action.name}</h3>
                        {getStatusBadge(action.status)}
                      </div>
                      {action.description && (
                        <p className="text-base-content/70 mb-3">
                          {action.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                        <span>
                          타입:{" "}
                          <span className="font-medium">{action.type}</span>
                        </span>
                        <span>
                          생성일:{" "}
                          <span className="font-medium">
                            {formatDate(action.created_at)}
                          </span>
                        </span>
                        {action.updated_at && (
                          <span>
                            수정일:{" "}
                            <span className="font-medium">
                              {formatDate(action.updated_at)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button className="btn btn-sm btn-outline btn-error">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
