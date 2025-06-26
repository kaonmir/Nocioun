"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { UserProvider } from "@/hooks/useUser";

export default function ActionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50/30 max-w-7xl mx-auto">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg shadow-lg p-8 pt-0 mx-auto flex flex-col gap-4">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
