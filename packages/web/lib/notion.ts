import { Client } from "@notionhq/client";
import { createClient } from "@/lib/supabase";
import { proxyFetch } from "./utils";

/**
 * 현재 로그인된 사용자의 Notion 클라이언트를 가져옵니다.
 * @returns Promise<NotionClientResult>
 */
export const getNotionClient = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  } else if (!user) {
    throw new Error("사용자 정보가 없습니다.");
  }

  const notionAccessToken = user.user_metadata?.notion_access_token;

  if (!notionAccessToken) {
    throw new Error("Notion 연동이 필요합니다. 다시 로그인해주세요.");
  }

  return new Client({
    fetch: proxyFetch,
    auth: notionAccessToken,
  });
};
