"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { toLocalIsoDate } from "@/features/schedule-engine";

type SelectedDateContextValue = {
  selectedDate: string;
  setSelectedDate: (next: string) => void;
};

const SelectedDateContext = createContext<SelectedDateContextValue | null>(null);

function todayIso() {
  return toLocalIsoDate(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone);
}

export function SelectedDateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const value = useMemo(() => ({ selectedDate, setSelectedDate }), [selectedDate]);

  return <SelectedDateContext.Provider value={value}>{children}</SelectedDateContext.Provider>;
}

export function useSelectedDate() {
  const context = useContext(SelectedDateContext);

  if (!context) {
    throw new Error("useSelectedDate must be used inside SelectedDateProvider");
  }

  return context;
}
