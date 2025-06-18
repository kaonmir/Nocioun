import { people_v1 } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import { LocalRepository } from "./LocalRepository";
import { Credentials } from "google-auth-library";
import chalk from "chalk";
import path from "path";
import os from "os";
import { table } from "table";

// Repository 인터페이스 구현
export class SyncTokenRepository {
  private repository: LocalRepository<{ syncToken: string }>;

  constructor() {
    this.repository = new LocalRepository<{ syncToken: string }>(
      path.join(
        os.homedir(),
        ".config",
        "nocioun",
        ".tokens",
        "sync-token.json"
      )
    );
  }

  async saveSyncToken(token: string): Promise<void> {
    await this.repository.save({ syncToken: token });
  }

  async getSyncToken(): Promise<string | null> {
    const data = await this.repository.load();
    return data?.syncToken || null;
  }
}

// Google People API 클라이언트 생성
export async function createPeopleClient(): Promise<people_v1.People> {
  const tokenRepository = new LocalRepository<Credentials>(
    path.join(os.homedir(), ".config", "nocioun", ".tokens", "google.json")
  );

  const credentials = await tokenRepository.load();
  if (!credentials) {
    throw new Error(
      "Google 인증이 필요합니다. 'nocioun auth google' 명령어를 먼저 실행하세요."
    );
  }

  // OAuth2 클라이언트 생성
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials(credentials);

  // People API 클라이언트 생성
  const peopleClient = new people_v1.People({
    auth: oauth2Client,
  });

  return peopleClient;
}

// 연락처 정보 출력 함수
export function displayContacts(people: people_v1.Schema$Person[]): void {
  const data = people.map((person) => [
    person.names?.[0]?.displayName,
    person.emailAddresses?.[0]?.value ?? "n/a",
    person.phoneNumbers?.[0]?.value ?? "n/a",
  ]);

  console.log(
    table(
      [
        [chalk.cyan("이름"), chalk.cyan("이메일"), chalk.cyan("전화번호")],
        ...data,
      ],
      {
        singleLine: true,
        drawHorizontalLine: () => false,
        drawVerticalLine: () => false,
      }
    )
  );
}
