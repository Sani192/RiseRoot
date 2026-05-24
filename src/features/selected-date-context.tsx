"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type SelectedDateContextValue = {
  selectedDate: string;
  setSelectedDate: (next: string) => void;
};

const SelectedDateContext = createContext<SelectedDateContextValue | null>(null);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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
