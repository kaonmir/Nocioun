"use client";

import { ReactNode } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageMeta({ title, description, children }: PageMetaProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
      {children}
    </div>
  );
}
