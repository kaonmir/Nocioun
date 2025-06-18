import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import { Credentials } from "google-auth-library";
import chalk from "chalk";
import { OAuthServer } from "./oauthServer";

interface Repository {
  load: () => Promise<Credentials | null>;
  save: (tokens: Credentials) => Promise<void>;
}

export class GoogleAuth {
  private oauth2Client: OAuth2Client | null = null;
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
    return !!(tokens && tokens.access_token && tokens.refresh_token);
  }

  async authenticate(): Promise<OAuth2Client> {
    try {
      const { redirectUri } = await this.oauthServer.startServer();

      this.oauth2Client = new google.auth.OAuth2(
        this.client_id,
        this.client_secret,
        redirectUri
      );

      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/contacts.readonly"],
      });

      console.log(chalk.blue("🔐 Google 계정으로 로그인이 필요합니다."));
      console.log(
        chalk.yellow("로컬 서버를 시작하고 브라우저를 자동으로 열겠습니다...")
      );

      this.oauthServer.openBrowser(authUrl);

      try {
        const { code } = await this.oauthServer.waitForCallback();
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        await this.repository.save(tokens);

        return this.oauth2Client;
      } catch (error) {
        console.error(chalk.red("토큰 교환 중 오류가 발생했습니다:"), error);
        throw error;
      } finally {
        this.oauthServer.stopServer();
      }
    } catch (error) {
      console.error(chalk.red("인증 중 오류가 발생했습니다:"), error);
      this.oauthServer.stopServer();
      throw error;
    }
  }
}
