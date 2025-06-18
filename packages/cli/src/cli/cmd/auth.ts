import { Command } from "commander";
import chalk from "chalk";
import { GoogleAuth } from "../auth/googleAuth";
import { NotionAuth } from "../auth/notionAuth";
import { Credentials } from "google-auth-library";
import { OauthTokenResponse } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import os from "os";
import { LocalRepository } from "../utils/LocalRepository";

// 통합된 재인증 확인 함수
const askReauth = (serviceName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      chalk.yellow(
        `이미 ${serviceName} 계정 인증이 완료되어 있습니다. 다시 인증하시겠습니까? (y/N): `
      ),
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
      }
    );
  });
};

// 환경 변수 검증 함수
const validateEnvVar = (envVarName: string): string | null => {
  const envVarValue = process.env[envVarName];

  if (!envVarValue) {
    console.error(
      chalk.red(
        `❌ ${envVarName} 환경 변수가 설정되지 않았습니다.\n` +
          `   export ${envVarName}="your-env-var-value" 로 설정하세요.`
      )
    );
    return null;
  }

  return envVarValue;
};

// 공통 인증 플로우 함수
async function performAuth<T>(
  serviceName: string,
  clientIdKey: string,
  clientSecretKey: string,
  tokenFileName: string,
  AuthClass: new (
    clientId: string,
    clientSecret: string,
    repository: LocalRepository<T>
  ) => { authenticate(): Promise<any> }
): Promise<void> {
  console.log(chalk.blue(`🔐 ${serviceName} API 인증을 시작합니다...`));

  const tokenRepository = new LocalRepository<T>(
    path.join(os.homedir(), ".config", "nocioun", ".tokens", tokenFileName)
  );

  try {
    // 환경 변수 검증
    const clientId = validateEnvVar(clientIdKey);
    const clientSecret = validateEnvVar(clientSecretKey);
    if (!clientId || !clientSecret) return;

    // 기존 토큰 확인
    const existingTokens = await tokenRepository.load();
    if (existingTokens) {
      const shouldReauth = await askReauth(serviceName);
      if (!shouldReauth) {
        console.log(chalk.green("✅ 기존 인증을 유지합니다."));
        return;
      }
    }

    // Auth 인스턴스 생성
    const authInstance = new AuthClass(clientId, clientSecret, tokenRepository);

    // 인증 수행
    console.log(chalk.blue(`🚀 ${serviceName} 인증을 진행합니다...`));
    await authInstance.authenticate();

    console.log(chalk.green(`✅ ${serviceName} 인증이 완료되었습니다!`));
  } catch (error) {
    console.error(chalk.red("❌ 인증 중 오류가 발생했습니다:"), error);
  }
}

// Google 인증 명령어
export const authGoogleCommand = new Command("google")
  .description("Google People API 인증")
  .action(async () => {
    await performAuth<Credentials>(
      "Google",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "google.json",
      GoogleAuth
    );

    // 인증 성공 안내
    console.log(chalk.yellow("\n📋 다음 단계:"));
    console.log(`1. 'nocioun contacts list' 명령어로 연락처를 확인하세요`);
    console.log(`2. 'nocioun contacts sync' 명령어로 Notion과 동기화하세요`);
  });

// Notion 인증 명령어
export const authNotionCommand = new Command("notion")
  .description("Notion API 인증")
  .action(async () => {
    await performAuth<OauthTokenResponse>(
      "Notion",
      "NOTION_CLIENT_ID",
      "NOTION_CLIENT_SECRET",
      "notion.json",
      NotionAuth
    );

    // 인증 성공 안내
    console.log(chalk.yellow("\n📋 다음 단계:"));
    console.log(`1. 'nocioun contacts list' 명령어로 연락처를 확인하세요`);
    console.log(`2. 'nocioun contacts sync' 명령어로 Google과 동기화하세요`);
  });
