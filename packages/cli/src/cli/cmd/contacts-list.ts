import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createPeopleClient, displayContacts } from "../utils/contacts-utils";
import { table } from "table";

// 연락처 목록 조회 명령어
export const contactsListCommand = new Command("list")
  .description("Google Contacts 목록 조회")
  .option("--limit <number>", "조회할 연락처 수 제한", "10")
  .action(async (options) => {
    const spinner = ora("연락처 목록을 가져오는 중...").start();

    try {
      const peopleClient = await createPeopleClient();

      const response = await peopleClient.people.connections.list({
        resourceName: "people/me",
        personFields:
          "metadata,names,emailAddresses,phoneNumbers,addresses,organizations",
        pageSize: parseInt(options.limit),
      });

      spinner.succeed(
        `연락처 ${response.data.connections?.length || 0}개를 가져왔습니다!`
      );

      if (response.data.connections && response.data.connections.length > 0) {
        console.log(chalk.blue("\n📋 연락처 목록:"));
        displayContacts(response.data.connections);
      } else {
        console.log(chalk.yellow("연락처가 없습니다."));
      }
    } catch (error: any) {
      spinner.fail("연락처 조회 중 오류가 발생했습니다.");
      console.error(chalk.red("❌ 오류:"), error.message);
    }
  });
