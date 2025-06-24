import { createClient } from "@/lib/supabase/client";
import { CreateActionRequest } from "@/types/action";
import { SupabaseClient } from "@supabase/supabase-js";

const getAuthenticatedUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("인증이 필요합니다.");
  }

  return { supabase, user };
};

export const createAction = async (actionData: CreateActionRequest) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  const { type, name, databaseId, config } = actionData;

  // 입력 검증
  if (!type || !name || !databaseId || !config) {
    throw new Error("필수 필드가 누락되었습니다.");
  }

  // 액션 데이터 구성
  const actionRecord = {
    user_id: user.id,
    name,
    type,
    status: "active",
    properties: {
      ...config,
      databaseId,
    },
  };

  // Supabase actions 테이블에 저장
  const { data, error } = await supabase
    .from("actions")
    .insert([actionRecord])
    .select()
    .single();

  if (error) {
    console.error("Database insert error:", error);
    throw new Error("액션 저장에 실패했습니다.");
  }

  return data;
};

export const getActions = async () => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // 사용자의 액션 목록 조회
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database fetch error:", error);
    throw new Error("액션 목록 조회에 실패했습니다.");
  }

  return data || [];
};

export const getActionById = async (actionId: string) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // 특정 액션 조회
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("id", actionId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Database fetch error:", error);
    throw new Error("액션 조회에 실패했습니다.");
  }

  return data;
};

export const updateAction = async (
  actionId: string,
  updateData: { name?: string; config?: any; type?: string }
) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  const { name, config, type } = updateData;

  if (name && typeof name !== "string") {
    throw new Error("액션 이름이 유효하지 않습니다.");
  }

  // 액션 업데이트
  const { data, error } = await supabase
    .from("actions")
    .update({
      ...(name && { name }),
      ...(config && { properties: config }),
      ...(type && { type }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Database update error:", error);
    throw new Error("액션 업데이트에 실패했습니다.");
  }

  return data;
};

export const deleteAction = async (actionId: string) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // 액션 삭제
  const { error } = await supabase
    .from("actions")
    .delete()
    .eq("id", actionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Database delete error:", error);
    throw new Error("액션 삭제에 실패했습니다.");
  }

  return true;
};
