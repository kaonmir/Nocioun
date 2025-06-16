import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/supabase/supabase-server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, type, status } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "이름과 타입은 필수 입력사항입니다." },
        { status: 400 }
      );
    }

    // Get user ID from Supabase auth session
    // Get access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(accessToken);
    console.log("authError", authError);
    console.log("user", user);

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const newAction = {
      id: uuidv4(),
      name,
      description: description || null,
      type,
      status: status || "draft",
      user_id: user.id,
      properties: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("actions")
      .insert([newAction])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "액션 생성 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
