import { supabase } from "@/supabase/supabase";
import { notFound } from "next/navigation";

interface Action {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  properties: any;
}

interface PageProps {
  params: {
    id: string;
  };
}

async function getAction(id: string): Promise<Action | null> {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Action;
}

function getActionTypeInfo(type: string) {
  switch (type) {
    case "sync-contacts":
      return {
        name: "Sync Contacts",
        icon: "👥",
        description: "연락처를 동기화하여 최신 상태로 유지합니다.",
      };
    case "sync-map":
      return {
        name: "Sync Naver Map",
        icon: "🗺️",
        description: "네이버 지도 데이터를 동기화합니다.",
      };
    default:
      return {
        name: type,
        icon: "⚙️",
        description: "사용자 정의 액션입니다.",
      };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <div className="badge badge-outline">초안</div>;
    case "active":
      return <div className="badge badge-success">활성</div>;
    case "inactive":
      return <div className="badge badge-warning">비활성</div>;
    case "error":
      return <div className="badge badge-error">오류</div>;
    default:
      return <div className="badge badge-outline">{status}</div>;
  }
}

export default async function ActionPage({ params }: PageProps) {
  const action = await getAction(params.id);

  if (!action) {
    notFound();
  }

  const typeInfo = getActionTypeInfo(action.type);
  const createdDate = new Date(action.created_at).toLocaleDateString("ko-KR");
  const updatedDate = new Date(action.updated_at).toLocaleDateString("ko-KR");

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="breadcrumbs text-sm mb-4">
            <ul>
              <li>
                <a href="/actions" className="link link-hover">
                  액션
                </a>
              </li>
              <li className="text-base-content/70">{action.name}</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{typeInfo.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                {action.name}
              </h1>
              <p className="text-xl text-base-content/70">{typeInfo.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(action.status)}
            <span className="text-sm text-base-content/50">
              생성일: {createdDate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">액션 정보</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-base-content mb-2">설명</h3>
                    <p className="text-base-content/70">
                      {action.description || "설명이 없습니다."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-base-content mb-2">타입</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary">{action.type}</span>
                      <span className="text-sm text-base-content/70">
                        {typeInfo.description}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">최근 활동</h2>

                <div className="space-y-4">
                  <div className="alert alert-info">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>아직 실행된 작업이 없습니다.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Controls */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">액션 제어</h2>

                <div className="space-y-3">
                  <button className="btn btn-primary w-full">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    실행하기
                  </button>

                  <button className="btn btn-outline w-full">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z"
                      />
                    </svg>
                    설정
                  </button>

                  <button className="btn btn-ghost w-full text-error">
                    <svg
                      className="w-5 h-5"
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
                    삭제
                  </button>
                </div>
              </div>
            </div>

            {/* Action Stats */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">통계</h2>

                <div className="stats stats-vertical w-full">
                  <div className="stat p-4">
                    <div className="stat-title text-xs">총 실행</div>
                    <div className="stat-value text-xl">0</div>
                  </div>

                  <div className="stat p-4">
                    <div className="stat-title text-xs">성공률</div>
                    <div className="stat-value text-xl">-</div>
                  </div>

                  <div className="stat p-4">
                    <div className="stat-title text-xs">마지막 실행</div>
                    <div className="stat-value text-xl">-</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">메타데이터</h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">ID:</span>
                    <span className="ml-2 text-base-content/70 font-mono text-xs">
                      {action.id}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">생성일:</span>
                    <span className="ml-2 text-base-content/70">
                      {createdDate}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">수정일:</span>
                    <span className="ml-2 text-base-content/70">
                      {updatedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
