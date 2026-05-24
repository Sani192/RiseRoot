"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Dumbbell,
  Home,
  NotebookText,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelectedDate } from "@/features/selected-date-context";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/notes", label: "Notes", icon: NotebookText },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { selectedDate, setSelectedDate } = useSelectedDate();

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const updateViewportVars = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      const keyboardInset = Math.max(window.innerHeight - viewport.height - viewport.offsetTop, 0);
      document.documentElement.style.setProperty("--rr-keyboard-inset", `${keyboardInset}px`);
    };

    updateViewportVars();
    window.visualViewport.addEventListener("resize", updateViewportVars);
    window.visualViewport.addEventListener("scroll", updateViewportVars);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewportVars);
      window.visualViewport?.removeEventListener("scroll", updateViewportVars);
      document.documentElement.style.setProperty("--rr-keyboard-inset", "0px");
    };
  }, []);

  return (
    <>
      <main className="min-h-screen px-4 pb-[calc(9rem+var(--rr-keyboard-inset,0px))] pt-6 sm:px-6 lg:pb-8" style={{ paddingBottom: "max(9rem, calc(8rem + var(--rr-keyboard-inset, 0px)))" }}>
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/50 bg-white/70 p-3">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Selected date</label>
          <input
            className="min-h-10 rounded-xl border border-white/60 bg-white px-3 text-sm"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
        {children}
      </main>
      <nav
        aria-label="Primary app navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/50 bg-background/85 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem+var(--rr-keyboard-inset,0px))] pt-2 shadow-2xl shadow-black/10 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-3xl border border-white/60 bg-white/65 p-1 shadow-sm shadow-black/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[0.7rem] font-medium text-muted-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active && "bg-primary text-primary-foreground shadow-sm",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
