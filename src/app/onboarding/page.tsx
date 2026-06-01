"use client";

import React, { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  KeyboardSafeScrollRegion,
  StickyActionBar,
} from "@/components/layout/mobile-safe-area";

const goals = ["Build strength", "Lose fat", "Feel energized", "Move daily"];
const gymWindows = ["Early morning", "Lunch break", "After work", "Flexible"];

type ApiValidationDetail = { field: string; message: string };
type OnboardingSuccess = { message?: string };

function fieldNameFromApiPath(path: string): string {
  if (path === "name") return "name";
  if (path === "age") return "age";
  if (path === "gymTiming") return "gymTiming";
  if (path === "wakeTime") return "wakeTime";
  if (path.startsWith("goals")) return "goals";
  return path;
}

export default function OnboardingPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const age = Number(formData.get("age") ?? 0);
    const height = String(formData.get("height") ?? "").trim();
    const weight = String(formData.get("weight") ?? "").trim();
    const gymTiming = String(formData.get("gymTiming") ?? "");
    const wakeTime = String(formData.get("wakeTime") ?? "");
    const goalsSelected = formData.getAll("goals").map(String);

    const nextErrors: Record<string, string> = {};
    if (!name)
      nextErrors.name = "Please add your name so we can personalize your plan.";
    if (!Number.isFinite(age) || age < 13 || age > 100)
      nextErrors.age = "Enter an age between 13 and 100.";
    if (!gymTiming)
      nextErrors.gymTiming =
        "Choose the window you are most likely to train in.";
    if (!wakeTime)
      nextErrors.wakeTime = "Wake time helps schedule your reminders.";
    if (goalsSelected.length === 0)
      nextErrors.goals = "Pick at least one primary goal.";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age,
          height: height || undefined,
          weight: weight || undefined,
          goals: goalsSelected,
          gymTiming,
          wakeTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const payload = (await response.json()) as {
        data?: OnboardingSuccess;
        error?: { message?: string; details?: ApiValidationDetail[] };
      };

      if (!response.ok || payload.error) {
        const apiFieldErrors: Record<string, string> = {};
        for (const detail of payload.error?.details ?? []) {
          apiFieldErrors[fieldNameFromApiPath(detail.field)] = detail.message;
        }
        setFieldErrors(apiFieldErrors);
        setError(
          payload.error?.message ??
            "We could not save right now. Check your connection and try again.",
        );
        return;
      }

      setFieldErrors({});
      setSuccess(
        payload.data?.message ??
          "Profile setup saved. You can update this any time in Settings.",
      );
    } catch {
      setError(
        "We could not save right now. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageContainer>
        <section
          className="space-y-5 pb-6"
          aria-labelledby="onboarding-heading"
        >
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Profile setup
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="onboarding-heading"
            >
              Tell RiseRoot how to pace your plan.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              These starter details shape workout timing, recovery reminders,
              and gentle progress targets. You can revise everything later.
            </p>
          </Card>
          <KeyboardSafeScrollRegion>
            <form className="space-y-4 min-w-0" onSubmit={onSubmit} noValidate>
              <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-foreground">
                  Body profile
                </h2>
                <label className="block space-y-2 text-sm font-medium text-foreground">
                  Name
                  <input
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? "name-error" : undefined
                    }
                    className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                    name="name"
                    placeholder="Maya"
                    type="text"
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="text-xs text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block space-y-2 text-sm font-medium text-foreground">
                    Age
                    <input
                      aria-invalid={Boolean(fieldErrors.age)}
                      aria-describedby={
                        fieldErrors.age ? "age-error" : undefined
                      }
                      className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                      inputMode="numeric"
                      name="age"
                      placeholder="32"
                      type="number"
                    />
                    {fieldErrors.age && (
                      <p id="age-error" className="text-xs text-red-600">
                        {fieldErrors.age}
                      </p>
                    )}
                  </label>
                  <label className="block space-y-2 text-sm font-medium text-foreground">
                    Height
                    <input
                      className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                      name="height"
                      placeholder={"5'8\""}
                      type="text"
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium text-foreground">
                    Weight
                    <input
                      className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                      inputMode="decimal"
                      name="weight"
                      placeholder="165 lb"
                      type="text"
                    />
                  </label>
                </div>
              </Card>
              <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-foreground">
                  Goals and rhythm
                </h2>
                <fieldset
                  className="space-y-2"
                  aria-describedby={
                    fieldErrors.goals ? "goals-error" : undefined
                  }
                >
                  <legend className="text-sm font-medium text-foreground">
                    Goals
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {goals.map((goal) => (
                      <label
                        className="flex min-h-12 items-center gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-3 text-sm text-foreground"
                        key={goal}
                      >
                        <input
                          className="accent-primary"
                          name="goals"
                          type="checkbox"
                          value={goal}
                        />
                        {goal}
                      </label>
                    ))}
                  </div>
                  {fieldErrors.goals && (
                    <p id="goals-error" className="text-xs text-red-600">
                      {fieldErrors.goals}
                    </p>
                  )}
                </fieldset>
                <fieldset
                  className="space-y-2"
                  aria-describedby={
                    fieldErrors.gymTiming ? "gymTiming-error" : undefined
                  }
                >
                  <legend className="text-sm font-medium text-foreground">
                    Preferred gym timing
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {gymWindows.map((window) => (
                      <label
                        className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/70 bg-white/65 px-3 text-sm text-foreground"
                        key={window}
                      >
                        <input
                          className="accent-primary"
                          name="gymTiming"
                          type="radio"
                          value={window}
                        />
                        {window}
                      </label>
                    ))}
                  </div>
                  {fieldErrors.gymTiming && (
                    <p id="gymTiming-error" className="text-xs text-red-600">
                      {fieldErrors.gymTiming}
                    </p>
                  )}
                </fieldset>
                <label className="block space-y-2 text-sm font-medium text-foreground">
                  Usual wake time
                  <input
                    aria-invalid={Boolean(fieldErrors.wakeTime)}
                    aria-describedby={
                      fieldErrors.wakeTime ? "wakeTime-error" : undefined
                    }
                    className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                    name="wakeTime"
                    type="time"
                  />
                  {fieldErrors.wakeTime && (
                    <p id="wakeTime-error" className="text-xs text-red-600">
                      {fieldErrors.wakeTime}
                    </p>
                  )}
                </label>
              </Card>
              <StickyActionBar className="rounded-3xl border border-white/60 bg-background/80 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl lg:bottom-4">
                <Button
                  className="min-h-12 w-full"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving profile..." : "Save profile setup"}
                </Button>
                {saving && (
                  <p
                    className="mt-2 text-sm text-muted-foreground"
                    role="status"
                  >
                    Saving your profile to RiseRoot...
                  </p>
                )}
                {error && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="mt-2 text-sm text-primary" role="status">
                    {success}
                  </p>
                )}
              </StickyActionBar>
            </form>
          </KeyboardSafeScrollRegion>
        </section>
      </PageContainer>
    </AppShell>
  );
}
