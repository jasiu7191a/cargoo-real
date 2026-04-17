import React from "react";

/**
 * THIS IS A PASS-THROUGH LAYOUT. 
 * THE ACTUAL ROOT LAYOUTS ARE IN /admin/layout.tsx AND /[lang]/layout.tsx.
 * 
 * We keep this file empty of <html> and <body> tags to prevent 
 * HierarchyRequestError and hydration crashes.
 */
export default function UniversalPassthrough({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
