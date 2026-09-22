import { requireAdminPage } from "@/lib/auth/admin";
import { getDashboardStats } from "@/lib/services/dashboard-service";
import { DashboardOverview } from "@/components/admin/dashboard/dashboard-overview";

export default async function DashboardPage() {
  await requireAdminPage();
  const stats = await getDashboardStats();
  return <DashboardOverview stats={stats} />;
}