import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { getStoreRating } from "@/lib/services/review-service";

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "OnePlus",
  "Nothing",
  "Xiaomi",
  "Sony",
  "Motorola",
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path d="M12 2.5l2.9 6.06 6.6.82-4.86 4.5 1.25 6.52L12 17.9l-5.89 3 1.25-6.52L2.5 9.38l6.6-.82L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

function DeviceShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="float-slow relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="relative hidden h-[300px] w-[150px] -rotate-[16deg] rounded-[1.9rem] border border-white/10 bg-gradient-to-b from-stone-700/50 to-stone-900/60 shadow-2xl sm:block"
        >
          <div className="absolute top-3 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 -mx-10 block h-[410px] w-[205px] rounded-[2.4rem] border border-amber-400/30 bg-gradient-to-b from-stone-800 to-stone-900 p-2.5 shadow-[0_50px_100px_rgba(0,0,0,0.65)] sm:-mx-8">
          <div className="relative flex h-full w-full flex-col items-center rounded-[1.85rem] border border-white/10 bg-[#0c0a09] p-6">
            <div className="h-1.5 w-10 rounded-full bg-white/15" />
            <div className="absolute top-5 right-5 h-12 w-12 rounded-2xl border border-white/10 bg-gradient-to-br from-stone-700/60 to-stone-900/60 p-1.5">
              <div className="h-3.5 w-3.5 rounded-full bg-stone-950/80" />
              <div className="mt-1 h-3.5 w-3.5 rounded-full bg-stone-950/80" />
            </div>
            <div className="mt-8 font-display text-xl font-semibold tracking-tight text-stone-100">
              Mobile Cases
            </div>
            <div className="mt-2 h-px w-4/5 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
            <div className="mt-7 flex w-full flex-col gap-2.5">
              <div className="h-2 w-full rounded-full bg-amber-400/30" />
              <div className="h-2 w-2/3 rounded-full bg-white/10" />
              <div className="h-2 w-5/6 rounded-full bg-white/10" />
              <div className="h-2 w-1/2 rounded-full bg-white/10" />
            </div>
            <div className="mt-auto flex w-full items-center justify-center gap-1.5">
              <span className="flex h-5 items-center rounded-full bg-amber-500 px-3 font-sans text-[10px] font-semibold text-stone-950">
                Premium
              </span>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative hidden h-[300px] w-[150px] rotate-[16deg] rounded-[1.9rem] border border-white/10 bg-gradient-to-b from-stone-700/50 to-stone-900/60 shadow-2xl sm:block"
        >
          <div className="absolute top-3 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="absolute -left-3 top-14 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-200 backdrop-blur-sm sm:left-0">
        MIL-STD 810G
      </div>
      <div className="absolute -right-3 bottom-24 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-amber-300 sm:right-0">
        From â‚¹749
      </div>
    </div>
  );
}

function BrandMarquee() {
  return (
    <div className="relative overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0c0a09] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0c0a09] to-transparent" />
      <div className="marquee flex w-max items-center gap-14">
        {[...BRANDS, ...BRANDS].map((brand, index) => (
          <span
            key={`${brand}-${index}`}
            className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-600"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}

export async function Hero() {
  const storeRating = await getStoreRating();
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-white/10 bg-[#0c0a09]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_158_11/0.16),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgb(255_255_255/0.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-amber-700/10 blur-[120px]"
      />

      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <p
              className="hero-rise inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400"
              style={{ "--hero-delay": "40ms" } as CSSProperties}
            >
              <span aria-hidden="true" className="h-px w-8 bg-amber-400/60" />
              Premium mobile cases
            </p>

            <h1
              id="hero-heading"
              className="mt-7 font-display text-5xl leading-[1.02] font-medium tracking-tight text-stone-50 sm:text-6xl lg:text-[4.75rem]"
            >
              <span
                className="hero-rise block"
                style={{ "--hero-delay": "160ms" } as CSSProperties}
              >
                Armor for the
              </span>
              <span
                className="hero-rise block"
                style={{ "--hero-delay": "250ms" } as CSSProperties}
              >
                <em className="font-display italic text-amber-400">
                  modern phone.
                </em>
              </span>
            </h1>

            <p
              className="hero-rise mx-auto mt-7 max-w-md text-base leading-relaxed text-stone-400 sm:text-lg lg:mx-0"
              style={{ "--hero-delay": "340ms" } as CSSProperties}
            >
              Precision-engineered cases from the world&apos;s leading brands.
              Crafted to protect, designed to turn heads.
            </p>

            <div
              className="hero-rise mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              style={{ "--hero-delay": "480ms" } as CSSProperties}
            >
              <ButtonLink
                href="/products"
                size="lg"
                className="btn-sheen bg-amber-500 text-stone-950 hover:bg-amber-400"
              >
                Shop the collection
              </ButtonLink>
              <ButtonLink
                href="/brands"
                size="lg"
                variant="ghost"
                className="border border-white/20 text-stone-100 hover:border-amber-400/60 hover:bg-white/5"
              >
                Explore brands
              </ButtonLink>
            </div>

            <div
              className="hero-rise mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-5 lg:justify-start"
              style={{ "--hero-delay": "500ms" } as CSSProperties}
            >
              <Stars />
              <p className="text-sm text-stone-400">
                <span className="font-semibold text-stone-100">
                  {storeRating.average !== null
                    ? `${storeRating.average.toFixed(1)}/5`
                    : "New arrivals"}
                </span>
                {storeRating.count > 0
                  ? ` from ${storeRating.count.toLocaleString()} verified review${storeRating.count === 1 ? "" : "s"}`
                  : " â€” be the first to leave a review"}
              </p>
            </div>
          </div>

          <div
            className="hero-rise hidden lg:block"
            style={{ "--hero-delay": "300ms" } as CSSProperties}
          >
            <DeviceShowcase />
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <BrandMarquee />
      </div>
    </section>
  );
}
