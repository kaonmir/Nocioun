"use client";

import { ActionRunner } from "./_map/ActionRunner";
import { Card, CardContent } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getActionById } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Action } from "@/types/action";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

interface ActionPageProps {
  params: {
    actionId: string;
  };
}

export default function ActionPage({ params }: ActionPageProps) {
  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAction = async () => {
      try {
        setLoading(true);
        setError("");
        const action = await getActionById(params.actionId);
        setAction(action);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAction();
  }, [params.actionId]);

  if (loading) return <LoadingCard message="액션 정보를 불러오는 중..." />;
  if (error) return <ErrorCard message={error} />;
  if (!action) return <ErrorCard message="액션을 찾을 수 없습니다." />;

  // action_type이 'map'인 경우에만 ActionRunner 렌더링
  if (action.action_type === "map") {
    return <ActionRunner actionId={params.actionId} action={action} />;
  } else {
    return <ErrorCard message="지원하지 않는 액션 타입입니다." />;
  }
}
