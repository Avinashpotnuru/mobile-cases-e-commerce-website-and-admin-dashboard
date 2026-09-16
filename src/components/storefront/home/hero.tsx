import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";

function PhoneVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex w-full max-w-xs items-center justify-center py-6"
    >
      <div className="glow-pulse absolute h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="float-slow relative">
        <div className="block h-[380px] w-[190px] rounded-[2rem] border border-amber-400/30 bg-gradient-to-b from-stone-800 to-stone-900 p-2 shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
          <div className="flex h-full w-full flex-col items-center rounded-[1.6rem] border border-white/10 bg-[#0c0a09] p-5">
            <div className="h-1.5 w-9 rounded-full bg-white/15" />
            <div className="mt-7 font-display text-xl font-semibold tracking-tight text-stone-100">
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
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-white/10 bg-[#0c0a09] py-20 sm:py-28 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(245_158_11/0.14),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgb(161_98_7/0.12),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgb(255_255_255/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.5)_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8">
        <div className="max-w-xl text-center lg:text-left">
          <p
            className="hero-rise inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400"
            style={{ "--hero-delay": "100ms" } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="h-px w-8 bg-amber-400/60"
            />
            Premium mobile cases
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-display text-5xl leading-[1.05] font-medium tracking-tight text-stone-50 sm:text-6xl lg:text-7xl"
          >
            <span className="hero-rise" style={{ "--hero-delay": "220ms" } as CSSProperties}>
              Armor for the
            </span>
            <span className="hero-rise" style={{ "--hero-delay": "340ms" } as CSSProperties}>
              <em className="font-display italic text-amber-400">modern phone.</em>
            </span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-md text-base leading-relaxed text-stone-400 sm:text-lg lg:mx-0"
            style={{ "--hero-delay": "460ms" } as CSSProperties}
          >
            Precision-engineered cases from the world&apos;s leading brands.
            Crafted to protect, designed to turn heads.
          </p>

          <div
            className="hero-rise mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            style={{ "--hero-delay": "580ms" } as CSSProperties}
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

          <p
            className="hero-rise mt-8 text-xs font-medium tracking-wide text-stone-500"
            style={{ "--hero-delay": "700ms" } as CSSProperties}
          >
            Free shipping over $40 · 30-day returns · Secure checkout
          </p>
        </div>

        <div
          className="hero-rise hidden lg:block"
          style={{ "--hero-delay": "450ms" } as CSSProperties}
        >
          <PhoneVisual />
        </div>
      </div>
    </section>
  );
}
