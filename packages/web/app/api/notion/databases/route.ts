import { NextRequest, NextResponse } from "next/server";
import { NotionService } from "@/lib/notion";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("notion_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const notionService = new NotionService(accessToken);
    const databases = await notionService.getDatabases();

    return NextResponse.json({ databases });
  } catch (error) {
    console.error("Error fetching databases:", error);
    return NextResponse.json(
      { error: "Failed to fetch databases" },
      { status: 500 }
    );
  }
}
