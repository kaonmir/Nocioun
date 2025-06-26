import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PeopleFetcher } from "@nocioun/core";
import {
  SyncTokenRepository,
  createPeopleClient,
  displayContacts,
} from "../utils/contacts-utils";
import { LocalRepository } from "../utils/LocalRepository";
import { OauthTokenResponse } from "@notionhq/client";
import { Credentials } from "google-auth-library";
import path from "path";
import os from "os";
import { NotionConvertor } from "@nocioun/core";
import { Client as NotionClient } from "@notionhq/client";

// Google Contacts 동기화 명령어
export const contactSyncCommand = new Command("sync")
  .description("Google Contacts를 Notion과 동기화")
  .option("-f, --full", "전체 동기화 강제 실행")
  .option("--page-size <size>", "페이지 크기 설정", "50")
  .option("--notion-database-id <id>", "Notion 데이터베이스 ID")
  .action(async (options) => {
    const spinner = ora("Google Contacts 동기화를 시작합니다...").start();

    try {
      // 옵션 유효성 검증
      const missingOptions: string[] = [];

      if (!options.notionDatabaseId) {
        missingOptions.push("--notion-database-id");
      }

      if (missingOptions.length > 0) {
        spinner.fail("필수 옵션이 누락되었습니다.");
        console.error(chalk.red("❌ 다음 옵션들이 필요합니다:"));
        missingOptions.forEach((option) => {
          console.error(chalk.red(`   ${option}`));
        });
        return;
      }

      // 1. Google 인증 상태 확인
      spinner.text = "Google 인증 상태를 확인하는 중...";
      const googleTokenRepository = new LocalRepository<Credentials>(
        path.join(os.homedir(), ".config", "nocioun", ".tokens", "google.json")
      );

      const googleTokens = await googleTokenRepository.load();
      if (
        !googleTokens ||
        !googleTokens.access_token ||
        !googleTokens.refresh_token
      ) {
        spinner.fail("Google 인증이 필요합니다.");
        console.error(chalk.red("❌ Google 계정 인증이 완료되지 않았습니다."));
        console.log(
          chalk.yellow("💡 다음 명령어로 Google 인증을 먼저 완료하세요:")
        );
        console.log(chalk.blue("   nocioun auth google"));
        return;
      }

      // 2. Notion 인증 상태 확인
      spinner.text = "Notion 인증 상태를 확인하는 중...";
      const notionTokenRepository = new LocalRepository<OauthTokenResponse>(
        path.join(os.homedir(), ".config", "nocioun", ".tokens", "notion.json")
      );

      const notionTokens = await notionTokenRepository.load();
      if (!notionTokens || !notionTokens.access_token) {
        spinner.fail("Notion 인증이 필요합니다.");
        console.error(chalk.red("❌ Notion 계정 인증이 완료되지 않았습니다."));
        console.log(
          chalk.yellow("💡 다음 명령어로 Notion 인증을 먼저 완료하세요:")
        );
        console.log(chalk.blue("   nocioun auth notion"));
        return;
      }

      console.log(chalk.green("✅ Google 및 Notion 인증이 확인되었습니다."));

      // 3. Google People API 클라이언트 생성
      spinner.text = "Google API 클라이언트를 초기화하는 중...";
      const peopleClient = await createPeopleClient();

      // 4. Repository 및 Fetcher 초기화
      const repository = new SyncTokenRepository();
      const fetcher = new PeopleFetcher(peopleClient, repository);

      // 5. 동기화 실행
      spinner.text = "연락처를 동기화하는 중...";

      let result;
      if (options.full) {
        // 전체 동기화 강제 실행
        spinner.text = "전체 동기화를 실행하는 중...";
        const allPeople = await fetcher.fullSync(parseInt(options.pageSize));
        result = {
          people: allPeople,
          deletedPeople: [],
          isFullSync: true,
        };
      } else {
        // 자동 동기화 (증분 또는 전체)
        result = await fetcher.sync();
      }

      spinner.succeed("연락처 동기화가 완료되었습니다!");

      // 6. Notion 클라이언트 생성
      const notionClient = new NotionClient({
        auth: notionTokens.access_token,
      });

      const convertor = new NotionConvertor(
        notionClient,
        options.notionDatabaseId
      );

      for (const person of result.people) {
        const existingPage = await convertor.findPageByResourceName(
          person.resourceName || ""
        );

        const notionContactProperties = {
          properties: {
            display_name: {
              name: "Display Name",
              value: person.names?.[0]?.displayName || "이름 없음",
            },
            first_name: {
              name: "First Name",
              value: person.names?.[0]?.givenName || null,
            },
            last_name: {
              name: "Last Name",
              value: person.names?.[0]?.familyName || null,
            },
            email: {
              name: "Email",
              value: person.emailAddresses?.[0]?.value || null,
            },
            phone: {
              name: "Phone",
              value: person.phoneNumbers?.[0]?.value || null,
            },
            address: {
              name: "Address",
              value: person.addresses?.[0]?.formattedValue || null,
            },
            company: {
              name: "Company",
              value: person.organizations?.[0]?.name || null,
            },
            department: {
              name: "Department",
              value: person.organizations?.[0]?.name || null,
            },
            job_title: {
              name: "Job Title",
              value: person.organizations?.[0]?.title || null,
            },
            notes: {
              name: "Notes",
              value: person.biographies?.[0]?.value || null,
            },
            birthday: {
              name: "Birthday",
              value: person.birthdays?.[0]?.date
                ? `${person.birthdays?.[0]?.date?.year
                    ?.toString()
                    .padStart(4, "0")}-${person.birthdays?.[0]?.date?.month
                    ?.toString()
                    .padStart(2, "0")}-${person.birthdays?.[0]?.date?.day
                    ?.toString()
                    .padStart(2, "0")}`
                : null,
            },
          },
          iconUrl: person.photos?.[0]?.url || null,
          resourceName: person.resourceName || "",
        };

        if (existingPage) {
          const notionPage = await convertor.updatePage(
            existingPage,
            notionContactProperties
          );
          console.log(chalk.green(`✅ 페이지 생성 완료: ${notionPage.id}`));
        } else {
          const notionPage = await convertor.createPage(
            notionContactProperties
          );
          console.log(chalk.green(`✅ 페이지 생성 완료: ${notionPage.id}`));
        }
      }

      for (const person of result.deletedPeople) {
        await convertor.deletePageByResourceName(person.resourceName || "");
        console.log(chalk.green(`✅ 페이지 삭제 완료: ${person.resourceName}`));
      }

      // 6. 결과 출력
      console.log(chalk.green("\n📊 동기화 결과:"));
      console.log(
        `동기화 타입: ${result.isFullSync ? "전체 동기화" : "증분 동기화"}`
      );
      console.log(`가져온 연락처: ${result.people.length}개`);
      console.log(`삭제된 연락처: ${result.deletedPeople.length}개`);

      // Notion 설정 정보 표시
      console.log(chalk.blue("\n🔗 설정 정보:"));
      console.log(
        `Google 계정: ${googleTokens.access_token ? "연결됨" : "미연결"}`
      );
      console.log(
        `Notion 워크스페이스: ${notionTokens.workspace_name || "연결됨"}`
      );
      console.log(`Notion 데이터베이스 ID: ${options.notionDatabaseId}`);

      // 7. 연락처 정보 미리보기 (처음 5개)
      if (result.people.length > 0) {
        console.log(chalk.blue("\n📋 연락처 미리보기 (처음 5개):"));
        displayContacts(result.people.slice(0, 5));
        if (result.people.length > 5) {
          console.log(chalk.gray(`... 외 ${result.people.length - 5}개 더`));
        }
      }

      // 8. 삭제된 연락처 정보
      if (result.deletedPeople.length > 0) {
        console.log(chalk.red("\n🗑️  삭제된 연락처:"));
        result.deletedPeople.forEach((person) => {
          const name = person.names?.[0]?.displayName || "이름 없음";
          console.log(chalk.red(`   ❌ ${name}`));
        });
      }
    } catch (error: any) {
      spinner.fail("동기화 중 오류가 발생했습니다.");

      if (error.message === "SYNC_TOKEN_EXPIRED") {
        console.error(
          chalk.red("❌ Sync Token이 만료되었습니다. 전체 동기화를 실행합니다.")
        );
        console.log(
          chalk.yellow("💡 '--full' 옵션을 사용하여 다시 시도하세요.")
        );
      } else if (error.message.includes("Google 인증이 필요")) {
        console.error(chalk.red("❌ " + error.message));
        console.log(chalk.yellow("💡 다음 명령어로 Google 인증을 완료하세요:"));
        console.log(chalk.blue("   nocioun auth google"));
      } else if (error.message.includes("Notion 인증")) {
        console.error(chalk.red("❌ " + error.message));
        console.log(chalk.yellow("💡 다음 명령어로 Notion 인증을 완료하세요:"));
        console.log(chalk.blue("   nocioun auth notion"));
      } else {
        console.error(chalk.red("❌ 오류:"), error.message);
        if (process.env.NODE_ENV === "development") {
          console.error(error);
        }
      }
    }
  });
