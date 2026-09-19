import { CatalogInsights } from "./catalog-insights";
import { InventoryInsights } from "./inventory-insights";
import { KpiCard } from "./kpi-card";
import { OrdersChart } from "./orders-chart";
import { RecentOrders } from "./recent-orders";
import { formatCents } from "./charts";
import {
  BagIcon,
  ChartBarIcon,
  LayersIcon,
  PackageIcon,
} from "@/components/admin/admin-icons";
import type { DashboardStats } from "@/lib/services/dashboard-service";

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const { catalog, inventory, orders } = stats;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Overview
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            A live overview of your store&apos;s catalog, stock, and orders.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
          Live data
        </span>
      </header>

      <section
        aria-labelledby="kpis-heading"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="kpis-heading" className="sr-only">
          Key metrics
        </h2>
        <KpiCard
          label="Revenue"
          value={formatCents(orders.revenueCents, "INR")}
          hint={`${orders.paid} order${orders.paid === 1 ? "" : "s"} paid`}
          icon={<ChartBarIcon className="h-[18px] w-[18px]" />}
          tone={orders.paid > 0 ? "success" : "default"}
          href="/admin/orders"
        />
        <KpiCard
          label="Orders"
          value={orders.total}
          hint={`${orders.pendingPayment} awaiting payment`}
          icon={<BagIcon className="h-[18px] w-[18px]" />}
          href="/admin/orders"
        />
        <KpiCard
          label="Products"
          value={catalog.products}
          hint={`${catalog.activeProducts} active · ${catalog.draftProducts} draft`}
          icon={<LayersIcon className="h-[18px] w-[18px]" />}
          href="/admin/products"
        />
        <KpiCard
          label="Units in stock"
          value={inventory.unitsInStock}
          hint={`${inventory.lowStock} low · ${inventory.outOfStock} out of stock`}
          icon={<PackageIcon className="h-[18px] w-[18px]" />}
          tone={
            inventory.outOfStock > 0
              ? "destructive"
              : inventory.lowStock > 0
                ? "accent"
                : "success"
          }
          href="/admin/inventory"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-6">
        <div className="lg:col-span-4">
          <OrdersChart orders={orders} />
        </div>
        <div className="lg:col-span-2">
          <CatalogInsights catalog={catalog} />
        </div>
      </section>

      <section>
        <InventoryInsights inventory={inventory} />
      </section>

      <section>
        <RecentOrders orders={orders} />
      </section>
    </div>
  );
}