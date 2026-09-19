import { listBrands } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { listProducts } from "@/lib/services/product-service";
import { Container } from "@/components/ui/container";
import { Reveal } from "./reveal";
import { AnimatedCounter } from "./animated-counter";

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
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(245_158_11/0.07),transparent_58%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <Container className="relative py-16 sm:py-20">
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat, index) => (
            <Reveal key={stat.key} delay={index * 100} className="h-full">
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:py-4">
                <p className="font-display text-6xl leading-none font-medium tracking-tight text-foreground sm:text-7xl">
                  <AnimatedCounter value={counts[stat.key]} />
                  <span className="align-top text-3xl text-accent sm:text-4xl">
                    +
                  </span>
                </p>
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
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