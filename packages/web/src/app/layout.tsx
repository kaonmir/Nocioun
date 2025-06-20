import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nocioun - 카카오맵 장소를 Notion에",
  description: "카카오맵의 장소 정보를 Notion 데이터베이스에 쉽게 저장하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <main className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Nocioun</h1>
              <p className="text-gray-600 text-lg">
                카카오맵 장소 정보를 Notion 데이터베이스에 간편하게 저장하세요
              </p>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
