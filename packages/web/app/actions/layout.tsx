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
        <main>{children}</main>
      </div>
    </UserProvider>
  );
}
