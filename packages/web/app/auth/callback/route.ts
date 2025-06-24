import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/actions";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Notion provider token이 있는 경우 사용자 메타데이터에 저장
      if (
        data.session.provider_token &&
        data.session.provider_token.length > 0
      ) {
        try {
          await supabase.auth.updateUser({
            data: {
              notion_access_token: data.session.provider_token,
              notion_token_updated_at: new Date().toISOString(),
            },
          });
          console.log("Notion access token saved to user metadata");
        } catch (updateError) {
          console.error(
            "Failed to save Notion token to user metadata:",
            updateError
          );
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
