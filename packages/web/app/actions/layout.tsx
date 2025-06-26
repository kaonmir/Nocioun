"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { UserProvider } from "@/hooks/useUser";
import { PageMetaProvider, usePageMeta } from "@/hooks/usePageMeta";

function ActionsLayoutContent({ children }: { children: React.ReactNode }) {
  const { pageMeta } = usePageMeta();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30 max-w-7xl mx-auto">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {pageMeta.title}
          </h1>
          <p className="text-gray-600">{pageMeta.description}</p>
        </div>
        <div className="rounded-lg shadow-lg p-8 pt-0 mx-auto flex flex-col gap-4">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function ActionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <PageMetaProvider>
        <ActionsLayoutContent>{children}</ActionsLayoutContent>
      </PageMetaProvider>
    </UserProvider>
  );
}
