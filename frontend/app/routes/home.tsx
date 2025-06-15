import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nocioun - Google Contacts와 Notion을 연결하세요" },
    {
      name: "description",
      content:
        "Google Contacts의 연락처를 Notion 데이터베이스와 쉽게 동기화하세요. 간단한 설정으로 자동 연동이 가능합니다.",
    },
    {
      name: "keywords",
      content: "Google Contacts, Notion, 연락처 동기화, 자동화, 연동",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
