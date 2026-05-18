import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { TodayOverview } from "@/components/today/today-overview";

export default function HomePage() {
  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Phase 1 Skeleton
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              RiseRoot
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              A calm, mobile-first foundation for daily wellness planning. This
              screen intentionally uses placeholder content while feature
              folders define module boundaries for later implementation.
            </p>
          </div>
        </section>
        <TodayOverview />
      </PageContainer>
    </AppShell>
  );
}
