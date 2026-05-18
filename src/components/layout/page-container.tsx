import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex max-w-4xl flex-col gap-6">{children}</div>;
}
