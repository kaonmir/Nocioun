import { createClient } from "@/lib/supabase/client";
import {
  CreateActionRequest,
  CreateFieldMappingRequest,
  FieldMapping,
  Action,
} from "@/types/action";
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

export const createAction = async (action: CreateActionRequest) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  if (!action.action_type) {
    throw new Error("필수 필드가 누락되었습니다.");
  }

  // 액션 데이터 구성
  const actionRecord = {
    user_id: user.id,
    status: "draft" as const, // 초기 상태는 draft
    ...action,
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

export const createFieldMappings = async (
  actionId: string,
  mappings: CreateFieldMappingRequest[]
) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // action이 사용자 소유인지 확인
  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select("id")
    .eq("id", actionId)
    .eq("user_id", user.id)
    .single();

  if (actionError || !action) {
    throw new Error("액션을 찾을 수 없습니다.");
  }

  // field mappings 데이터 구성
  const mappingRecords = mappings.map((mapping) => ({
    action_id: actionId,
    ...mapping,
  }));

  // field_mappings 테이블에 저장
  const { data, error } = await supabase
    .from("field_mappings")
    .insert(mappingRecords)
    .select();

  if (error) {
    console.error("Field mappings insert error:", error);
    throw new Error("필드 매핑 저장에 실패했습니다.");
  }

  return data;
};

export const activateAction = async (actionId: string) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // 액션 상태를 active로 변경
  const { data, error } = await supabase
    .from("actions")
    .update({ status: "active" })
    .eq("id", actionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Action activation error:", error);
    throw new Error("액션 활성화에 실패했습니다.");
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

  // 특정 액션과 연관된 필드 매핑 조회
  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select(
      `
      *,
      field_mappings (*)
    `
    )
    .eq("id", actionId)
    .eq("user_id", user.id)
    .single();

  if (actionError) {
    console.error("Database fetch error:", actionError);
    throw new Error("액션 조회에 실패했습니다.");
  }

  return action;
};

export const getFieldMappingsByActionId = async (actionId: string) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // action이 사용자 소유인지 확인
  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select("id")
    .eq("id", actionId)
    .eq("user_id", user.id)
    .single();

  if (actionError || !action) {
    throw new Error("액션을 찾을 수 없습니다.");
  }

  // 필드 매핑 조회
  const { data, error } = await supabase
    .from("field_mappings")
    .select("*")
    .eq("action_id", actionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Field mappings fetch error:", error);
    throw new Error("필드 매핑 조회에 실패했습니다.");
  }

  return data || [];
};

export const updateAction = async (
  actionId: string,
  updateData: Partial<CreateActionRequest>
) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  const { name, description, action_type, target_type, target_id } = updateData;

  // 액션 업데이트
  const { data, error } = await supabase
    .from("actions")
    .update({
      ...(name && { name }),
      ...(description && { description }),
      ...(action_type && { action_type }),
      ...(target_type && { target_type }),
      ...(target_id && { target_id }),
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

  // 액션 삭제 (CASCADE로 field_mappings도 자동 삭제됨)
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

export const updateFieldMappings = async (
  actionId: string,
  mappings: CreateFieldMappingRequest[]
) => {
  const supabase = createClient();
  const { user } = await getAuthenticatedUser(supabase);

  // action이 사용자 소유인지 확인
  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select("id")
    .eq("id", actionId)
    .eq("user_id", user.id)
    .single();

  if (actionError || !action) {
    throw new Error("액션을 찾을 수 없습니다.");
  }

  // 기존 필드 매핑 삭제
  const { error: deleteError } = await supabase
    .from("field_mappings")
    .delete()
    .eq("action_id", actionId);

  if (deleteError) {
    console.error("Field mappings delete error:", deleteError);
    throw new Error("기존 필드 매핑 삭제에 실패했습니다.");
  }

  // 새로운 필드 매핑 추가
  if (mappings.length > 0) {
    const mappingRecords = mappings.map((mapping) => ({
      action_id: actionId,
      ...mapping,
    }));

    const { data, error: insertError } = await supabase
      .from("field_mappings")
      .insert(mappingRecords)
      .select();

    if (insertError) {
      console.error("Field mappings insert error:", insertError);
      throw new Error("필드 매핑 저장에 실패했습니다.");
    }

    return data;
  }

  return [];
};
