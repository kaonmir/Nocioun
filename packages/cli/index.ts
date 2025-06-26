#!/usr/bin/env node

import dotenv from "dotenv";
import path from "path";
import os from "os";

// ~/.config/nocioun/.env 파일 로딩
const envPath = path.join(os.homedir(), ".config", "nocioun", ".env");
dotenv.config({ path: envPath });

import chalk from "chalk";
import { Command } from "commander";
import { authGoogleCommand, authNotionCommand } from "./cmd/auth";
// import { contactSyncCommand } from "./cmd/contacts-sync";
import { contactsListCommand } from "./cmd/contacts-list";

// CLI 실행
const program = new Command();

program
  .name("nocioun")
  .description(
    "Google Contacts CLI - Google People API를 사용하여 연락처를 관리합니다"
  )
  .version("1.0.0")
  .option(
    "-e, --env <path>",
    "env 파일 경로",
    path.join(os.homedir(), ".config", "nocioun", ".env")
  );

const authCommand = new Command("auth")
  .description("OAuth 인증 관리")
  .addCommand(authGoogleCommand)
  .addCommand(authNotionCommand)
  .action(() => authCommand.help());

program.addCommand(authCommand);

const contactsCommand = new Command("contacts")
  .description("연락처 관리")
  .addCommand(contactsListCommand)
  // .addCommand(contactSyncCommand)  // Temporarily disabled due to missing dependencies
  .action(() => contactsCommand.help());

program.addCommand(contactsCommand);

// 기본 액션 (서브커맨드가 없을 때 도움말 표시)
program.action(() => {
  program.help();
});
program.parse();
