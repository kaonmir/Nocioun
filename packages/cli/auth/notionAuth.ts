import chalk from "chalk";
import { OAuthServer } from "./oauthServer";
import { OauthTokenResponse } from "@notionhq/client";

interface Repository {
  load: () => Promise<OauthTokenResponse | null>;
  save: (tokens: OauthTokenResponse) => Promise<void>;
}

export class NotionAuth {
  private oauthServer: OAuthServer;

  constructor(
    private readonly client_id: string,
    private readonly client_secret: string,
    private readonly repository: Repository
  ) {
    this.oauthServer = new OAuthServer({
      startPort: 53617,
      timeout: 5 * 60 * 1000,
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.repository.load();
    return !!(tokens && tokens.access_token);
  }

  async authenticate(): Promise<OauthTokenResponse> {
    try {
      const { redirectUri } = await this.oauthServer.startServer();

      // 기존 토큰과 상관없이 항상 새로운 인증 수행
      return await this.getNewToken(redirectUri);
    } catch (error) {
      console.error(chalk.red("Notion 인증 중 오류가 발생했습니다:"), error);
      this.oauthServer.stopServer();
      throw error;
    }
  }

  private async getNewToken(redirectUri: string): Promise<OauthTokenResponse> {
    const authUrl =
      `https://api.notion.com/v1/oauth/authorize?` +
      `client_id=${encodeURIComponent(this.client_id)}&` +
      `response_type=code&` +
      `owner=user&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log(chalk.blue("🔐 Notion 계정으로 로그인이 필요합니다."));
    console.log(
      chalk.yellow("로컬 서버를 시작하고 브라우저를 자동으로 열겠습니다...")
    );

    this.oauthServer.openBrowser(authUrl);

    try {
      const { code } = await this.oauthServer.waitForCallback();
      const tokens = await this.exchangeCodeForToken(code, redirectUri);
      await this.repository.save(tokens);

      console.log(
        chalk.green(
          `✅ Notion 워크스페이스 "${tokens.workspace_name}"에 연결되었습니다.`
        )
      );

      return tokens;
    } catch (error) {
      console.error(chalk.red("토큰 교환 중 오류가 발생했습니다:"), error);
      throw error;
    } finally {
      this.oauthServer.stopServer();
    }
  }

  private async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<OauthTokenResponse> {
    const tokenUrl = "https://api.notion.com/v1/oauth/token";

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    });

    const credentials = Buffer.from(
      `${this.client_id}:${this.client_secret}`
    ).toString("base64");

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Notion-Version": "2022-06-28",
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`토큰 교환 실패: ${response.status} ${errorText}`);
    }

    const tokens = (await response.json()) as OauthTokenResponse;
    return tokens;
  }

  async getTokens(): Promise<OauthTokenResponse | null> {
    return await this.repository.load();
  }
}
