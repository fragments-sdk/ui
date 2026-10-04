import type { ReactNode } from "react";
import { ThemeScript } from "@usefragments/ui";
import "@usefragments/ui/styles";

export const metadata = { title: "Server component fixture" };

// ThemeScript renders in this server layout: the no-flash script must need no client code.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
