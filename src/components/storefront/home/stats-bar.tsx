import { listBrands } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { listProducts } from "@/lib/services/product-service";
import { Container } from "@/components/ui/container";
import { Reveal } from "./reveal";

const stats = [
  { key: "brands", label: "Heritage brands" },
  { key: "models", label: "Device models covered" },
  { key: "products", label: "Crafted cases" },
] as const;

export async function StatsBar() {
  const counts = { brands: 0, models: 0, products: 0 };

  try {
    const [brands, models, products] = await Promise.all([
      listBrands({ page: 1, pageSize: 1 }),
      listMobileModels({ page: 1, pageSize: 1 }),
      listProducts({ page: 1, pageSize: 1 }),
    ]);
    counts.brands = brands.total;
    counts.models = models.total;
    counts.products = products.total;
  } catch {
    return null;
  }

  return (
    <section
      aria-label="Store statistics"
      className="border-b border-border bg-background py-16 sm:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.key} delay={index * 100}>
              <div className="text-center">
                <p className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
                  {counts[stat.key].toLocaleString("en-US")}+
                </p>
                <div
                  aria-hidden="true"
                  className="mx-auto mt-4 h-px w-10 bg-accent/60"
                />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}