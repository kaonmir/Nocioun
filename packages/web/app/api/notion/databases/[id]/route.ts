import { NextRequest, NextResponse } from "next/server";
import { NotionService } from "@/lib/notion";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = request.cookies.get("notion_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const notionService = new NotionService(accessToken);
    const result = await notionService.getDatabaseInfo(params.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching database:", error);
    return NextResponse.json(
      { error: "Failed to fetch database" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = request.cookies.get("notion_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { columnsToAdd } = await request.json();

    if (!Array.isArray(columnsToAdd) || columnsToAdd.length === 0) {
      return NextResponse.json(
        { error: "Invalid columns to add" },
        { status: 400 }
      );
    }

    const notionService = new NotionService(accessToken);
    await notionService.addColumnsToDatabase(params.id, columnsToAdd);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding columns:", error);
    return NextResponse.json(
      { error: "Failed to add columns" },
      { status: 500 }
    );
  }
}
