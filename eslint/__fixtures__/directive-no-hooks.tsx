"use client";

// A needless directive: "use client" with no hook, context or handler (eslint/directives.test.ts).
import type { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}
