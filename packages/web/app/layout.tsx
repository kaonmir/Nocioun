import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";
import { Theme } from "@radix-ui/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nocioun - 카카오맵 장소를 Notion에",
  description: "카카오맵의 장소를 Notion 데이터베이스에 쉽게 저장하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Theme>
          <main>{children}</main>
        </Theme>
        <Toaster />
      </body>
    </html>
  );
}
