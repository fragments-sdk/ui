"use client";

// A client module that needs its directive: it calls a hook (eslint/directives.test.ts).
import { useState } from "react";

export function Toggle() {
  const [on] = useState(false);
  return <span data-on={on} />;
}
