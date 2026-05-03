import { DashboardHeader } from "@/app/admin/view-components/dashboard-header";
import { QuoteRequestsPanel } from "@/app/admin/view-components/quote-requests-panel";

export const dynamic = "force-dynamic";

export default function QuoteRequestsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Quote Requests"
        subtitle="Create quotes, send them to customer accounts and email, then track shipments."
      />
      <QuoteRequestsPanel />
    </div>
  );
}
