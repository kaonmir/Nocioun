"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PageMeta {
  title: string;
  description: string;
}

interface PageMetaContextType {
  pageMeta: PageMeta;
  setPageMeta: (meta: PageMeta) => void;
}

const PageMetaContext = createContext<PageMetaContextType | undefined>(
  undefined
);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [pageMeta, setPageMeta] = useState<PageMeta>({
    title: "",
    description: "",
  });

  return (
    <PageMetaContext.Provider value={{ pageMeta, setPageMeta }}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMeta() {
  const context = useContext(PageMetaContext);
  if (context === undefined) {
    throw new Error("usePageMeta must be used within a PageMetaProvider");
  }
  return context;
}
