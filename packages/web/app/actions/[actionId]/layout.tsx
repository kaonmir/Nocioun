"use client";

import { useEffect } from "react";

export default function ActionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <main>{children}</main>
    </div>
  );
}
