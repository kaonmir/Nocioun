import type { Metadata } from "next";
import Link from "next/link";
import { Welcome } from "./components/Welcome";

export const metadata: Metadata = {
  title: "Nocioun - Google Contacts와 Notion을 연결하세요",
  description:
    "Google Contacts의 연락처를 Notion 데이터베이스와 쉽게 동기화하세요. 간단한 설정으로 자동 연동이 가능합니다.",
  keywords: "Google Contacts, Notion, 연락처 동기화, 자동화, 연동",
};

export default function HomePage() {
  return <Welcome />;
}
