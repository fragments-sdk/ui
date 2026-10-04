// A missing directive: renders and calls a hook with no "use client" (eslint/directives.test.ts).
import { useState } from "react";

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count] = useState(initial);
  return <span>{count}</span>;
}
