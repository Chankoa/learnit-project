import type { ReactNode } from "react";

export default function AppRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
