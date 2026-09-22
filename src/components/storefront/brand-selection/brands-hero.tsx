import type { CSSProperties } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/components/ui/cn";
import { listBrands } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";

const MARQUEE_BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "OnePlus",
  "Nothing",
  "Xiaomi",
  "Sony",
  "Motorola",
];

type Stats = { brands: number; models: number };

async function getStats(): Promise<Stats | null> {
  try {
    const [{ total: brands }, { total: models }] = await Promise.all([
      listBrands({ page: 1, pageSize: 1 }),
      listMobileModels({ page: 1, pageSize: 1 }),
    ]);
    return { brands, models };
  } catch {
    return null;
  }
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-accent/40 pl-4">
      <span className="font-display text-3xl font-medium tracking-tight text-foreground tabular-nums">
        {value}
      </span>
      <span className="mt-1 block text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

function MonogramWall() {
  const letters = MARQUEE_BRANDS.slice(0, 6).map((brand) => brand.charAt(0));
  const rotations = [
    "-rotate-3",
    "rotate-2",
    "-rotate-1",
    "rotate-3",
    "-rotate-2",
    "rotate-1",
  ];

  return (
    <div aria-hidden="true" className="ml-auto hidden w-full max-w-md lg:block">
      <div className="relative">
        <span className="pointer-events-none absolute -top-10 -left-4 select-none font-display text-8xl font-semibold tracking-tighter text-foreground/[0.04]">
          A.
        </span>
        <div className="relative grid grid-cols-3 gap-4">
          {letters.map((letter, index) => (
            <div
              key={`${letter}-${index}`}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full border font-display text-2xl font-semibold transition-transform duration-500",
                rotations[index],
                index === 2
                  ? "border-accent bg-accent text-accent-foreground shadow-md"
                  : "border-border bg-card text-accent",
              )}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 pl-1 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Six studios. One standard of precision.
      </p>
    </div>
  );
}

function BrandMarquee() {
  return (
    <div className="relative overflow-hidden border-t border-border py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="marquee flex w-max items-center gap-12">
        {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((brand, index) => (
          <span
            key={`${brand}-${index}`}
            className="text-xs font-semibold tracking-[0.3em] text-muted-foreground/60 uppercase"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}

export async function BrandsHero() {
  const stats = await getStats();
  const brandValue = stats ? String(stats.brands).padStart(2, "0") : "08";
  const modelValue = stats ? String(stats.models) : "60+";

  return (
    <section
      aria-labelledby="brands-hero-heading"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(161_98_7/0.14),transparent_46%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgb(12_10_9/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(12_10_9/0.05)_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
          <div className="max-w-2xl">
            <p
              className="hero-rise inline-flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-accent uppercase"
              style={{ "--hero-delay": "60ms" } as CSSProperties}
            >
              <span aria-hidden="true" className="h-px w-8 bg-accent/60" />
              The brand index
            </p>

            <h1
              id="brands-hero-heading"
              className="mt-7 font-display text-5xl leading-[1.03] font-medium tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem]"
            >
              <span
                className="hero-rise block"
                style={{ "--hero-delay": "180ms" } as CSSProperties}
              >
                Armor for every
              </span>
              <span
                className="hero-rise block"
                style={{ "--hero-delay": "300ms" } as CSSProperties}
              >
                <em className="font-display italic text-accent">
                  brand you love.
                </em>
              </span>
            </h1>

            <p
              className="hero-rise mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ "--hero-delay": "420ms" } as CSSProperties}
            >
              Every great case starts with a perfect fit. Pick your maker,
              choose your device, and we&apos;ll show you cases engineered for
              it.
            </p>

            <div
              className="hero-rise mt-10 flex flex-wrap gap-x-10 gap-y-6"
              style={{ "--hero-delay": "540ms" } as CSSProperties}
            >
              <Stat value={brandValue} label="Brands in the index" />
              <Stat value={modelValue} label="Models covered" />
              <Stat value="100%" label="Precision fit guarantee" />
            </div>
          </div>

          <div
            className="hero-rise hidden lg:block"
            style={{ "--hero-delay": "360ms" } as CSSProperties}
          >
            <MonogramWall />
          </div>
        </div>
      </Container>

      <BrandMarquee />
    </section>
  );
}