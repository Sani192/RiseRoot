import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { envKeys } from "@/lib/env";

const notificationControls = [
  "Morning routine briefing",
  "Workout start reminder",
  "Hydration nudges",
  "Evening review",
];

const envStatuses = [
  { label: "App URL", key: envKeys.appUrl, status: "optional for local" },
  {
    label: "Supabase URL",
    key: envKeys.supabaseUrl,
    status: "required for data",
  },
  {
    label: "Supabase anon key",
    key: envKeys.supabaseAnonKey,
    status: "required for data",
  },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-5 pb-6" aria-labelledby="settings-heading">
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Settings
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="settings-heading"
            >
              Profile, preferences, and app readiness.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Keep setup guidance and notification controls in one low-pressure
              place without crowding the Today screen.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Profile and preferences
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Personal plan inputs
                </h2>
              </div>
              <Button className="bg-white/70 text-foreground hover:bg-white">
                Edit
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Strength + energy goals",
                "Morning workouts preferred",
                "Wake time: 6:45 AM",
                "Units: pounds and inches",
              ].map((item) => (
                <p
                  className="rounded-2xl bg-muted/70 p-3 text-sm text-muted-foreground"
                  key={item}
                >
                  {item}
                </p>
              ))}
            </div>
            <Link
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
              href="/onboarding"
            >
              Open profile setup
            </Link>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-foreground">
              Notification controls
            </h2>
            <div className="space-y-2">
              {notificationControls.map((control) => (
                <label
                  className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/65 px-4 text-sm font-medium text-foreground"
                  key={control}
                >
                  {control}
                  <input className="h-5 w-5 accent-primary" type="checkbox" />
                </label>
              ))}
            </div>
            <p className="rounded-2xl bg-muted/70 p-3 text-sm leading-6 text-muted-foreground">
              Device push delivery is future-facing; these controls reserve the
              preference model for reminders, snoozes, and opt-outs.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-foreground">
              Environment and status guidance
            </h2>
            <div className="space-y-2">
              {envStatuses.map((item) => (
                <div
                  className="rounded-2xl border border-white/70 bg-white/65 p-3"
                  key={item.key}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {item.status}
                    </span>
                  </div>
                  <code className="mt-2 block break-all text-xs text-muted-foreground">
                    {item.key}
                  </code>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </PageContainer>
    </AppShell>
  );
}
