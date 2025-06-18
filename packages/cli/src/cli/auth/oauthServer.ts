import http from "http";
import { parse } from "url";
import { exec } from "child_process";
import chalk from "chalk";
import { AddressInfo } from "net";

export interface OAuthServerOptions {
  startPort: number;
  timeout: number;
}

export interface OAuthServerResult {
  code: string;
  state?: string;
  error?: string;
  port: number;
}

export class OAuthServer {
  private server: http.Server | null = null;
  private options: OAuthServerOptions;

  constructor(options: Partial<OAuthServerOptions> = {}) {
    this.options = {
      startPort: 3000,
      timeout: 5 * 60 * 1000, // 5분
      ...options,
    };
  }

  async startServer(): Promise<{ port: number; redirectUri: string }> {
    const port = this.options.startPort;

    try {
      const actualPort = await this.tryPort(port);
      const redirectUri = `http://localhost:${actualPort}/oauth/callback`;

      return { port: actualPort, redirectUri };
    } catch (error) {
      throw new Error(`포트 ${port}에서 서버를 시작할 수 없습니다: ${error}`);
    }
  }

  private tryPort(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = http.createServer();

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          reject(new Error(`포트 ${port}가 이미 사용 중입니다.`));
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        const actualPort = (server.address() as AddressInfo).port;
        this.server = server;
        resolve(actualPort);
      });
    });
  }

  waitForCallback(): Promise<OAuthServerResult> {
    if (!this.server) {
      throw new Error("서버가 시작되지 않았습니다.");
    }

    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error("서버가 시작되지 않았습니다."));
        return;
      }

      const port = (this.server.address() as AddressInfo).port;

      // 기존 리스너 제거
      this.server.removeAllListeners("request");

      this.server.on("request", async (req, res) => {
        if (!req.url) return;

        const urlObj = parse(req.url, true);

        console.log(chalk.green("urlObj: " + urlObj));

        if (urlObj.pathname === "/oauth/callback") {
          const code = urlObj.query.code as string;
          const state = urlObj.query.state as string;
          const error = urlObj.query.error as string;

          if (error) {
            // 에러 페이지 표시
            res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1 style="color: #f44336;">❌ 인증 실패</h1>
                  <p>오류: ${error}</p>
                  <p>다시 시도해주세요.</p>
                </body>
              </html>
            `);

            this.stopServer();
            reject(new Error(`OAuth 인증 오류: ${error}`));
            return;
          }

          if (code) {
            // 성공 페이지 표시
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1 style="color: #4CAF50;">✅ 인증 성공!</h1>
                  <p>OAuth 인증이 완료되었습니다.</p>
                  <p>이제 이 창을 닫으셔도 됩니다.</p>
                </body>
              </html>
            `);

            this.stopServer();
            resolve({ code, state, port });
          } else {
            // 코드가 없는 경우
            res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1 style="color: #f44336;">❌ 인증 실패</h1>
                  <p>인증 코드를 받지 못했습니다.</p>
                  <p>다시 시도해주세요.</p>
                </body>
              </html>
            `);

            this.stopServer();
            reject(new Error("인증 코드를 받지 못했습니다."));
          }
        }
      });

      // 타임아웃 설정
      setTimeout(() => {
        this.stopServer();
        reject(new Error("인증 시간이 초과되었습니다."));
      }, this.options.timeout);
    });
  }

  stopServer(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  openBrowser(authUrl: string): void {
    const command =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
        ? "start"
        : "xdg-open";

    exec(`${command} "${authUrl}"`, (error) => {
      if (error) {
        console.log(
          chalk.yellow(
            "브라우저를 자동으로 열 수 없습니다. 아래 URL을 수동으로 열어주세요:"
          )
        );
        console.log(chalk.cyan(authUrl));
      } else {
        console.log(
          chalk.green("브라우저가 열렸습니다. 계정으로 로그인해주세요.")
        );
        console.log(chalk.cyan(authUrl));
      }
    });
  }
}
