import { CatalogSummary } from "./catalog-summary";
import { InventorySummary } from "./inventory-summary";
import { KpiCard } from "./kpi-card";
import { RecentOrders } from "./recent-orders";
import { BagIcon, BoxIcon, LayersIcon, ReceiptIcon } from "./kpi-icons";
import { formatPrice } from "@/components/storefront/home/price";
import type { DashboardStats } from "@/lib/services/dashboard-service";

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const { catalog, inventory, orders } = stats;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A live overview of your store&apos;s catalog, stock, and orders. All
          figures are read from the database on each visit.
        </p>
      </header>

      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Revenue"
            value={formatPrice({ priceCents: orders.revenueCents, currency: "USD" })}
            hint={`${orders.paid} order${orders.paid === 1 ? "" : "s"} paid`}
            icon={<ReceiptIcon className="h-5 w-5" />}
            tone={orders.paid > 0 ? "success" : "default"}
            href="/admin/orders"
          />
          <KpiCard
            label="Orders"
            value={orders.total}
            hint={`${orders.pendingPayment} awaiting payment`}
            icon={<BagIcon className="h-5 w-5" />}
            href="/admin/orders"
          />
          <KpiCard
            label="Products"
            value={catalog.products}
            hint={`${catalog.activeProducts} active · ${catalog.draftProducts} draft`}
            icon={<LayersIcon className="h-5 w-5" />}
            href="/admin/products"
          />
          <KpiCard
            label="Units in stock"
            value={inventory.unitsInStock}
            hint={`${inventory.lowStock} low · ${inventory.outOfStock} out of stock`}
            icon={<BoxIcon className="h-5 w-5" />}
            tone={
              inventory.outOfStock > 0 ? "destructive" : inventory.lowStock > 0 ? "accent" : "success"
            }
            href="/admin/inventory"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CatalogSummary catalog={catalog} />
        <InventorySummary inventory={inventory} />
      </section>

      <section>
        <RecentOrders orders={orders} />
      </section>
    </div>
  );
}