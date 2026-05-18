import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { TodayOverview } from "@/components/today/today-overview";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <AppShell>
      <PageContainer>
        <TodayOverview />
      </PageContainer>
    </AppShell>
  );
}
