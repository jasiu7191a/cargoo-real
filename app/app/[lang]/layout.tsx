import React from "react";
import { LiveActivity } from "@/components/LiveActivity";

export default function RootLocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LiveActivity />
    </>
  );
}
