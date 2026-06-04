import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const bottomSafeAreaPaddingStyle: CSSProperties = {
  paddingBottom:
    "calc(env(safe-area-inset-bottom) + var(--rr-keyboard-inset, 0px))",
};

export const stickyActionOffsetStyle: CSSProperties = {
  bottom:
    "calc(var(--rr-sticky-footer-offset, 0px) + var(--rr-keyboard-inset, 0px))",
};

export function KeyboardSafeScrollRegion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rr-keyboard-safe-scroll min-w-0", className)}>
      {children}
    </div>
  );
}

export function StickyActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("sticky rr-sticky-action min-w-0", className)}
      style={stickyActionOffsetStyle}
    >
      {children}
    </div>
  );
}
