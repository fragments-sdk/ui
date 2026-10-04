// A server-safe module: no hook, no directive (eslint/directives.test.ts).
import type { ReactNode } from "react";

export function Frame({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
