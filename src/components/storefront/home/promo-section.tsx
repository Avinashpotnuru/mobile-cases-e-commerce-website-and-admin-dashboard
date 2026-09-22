import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "./reveal";

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M1 5h13v11H1z" />
      <path d="M14 8h4l4 4v4h-8z" />
      <circle cx="6" cy="18.5" r="1.5" />
      <circle cx="18" cy="18.5" r="1.5" />
    </svg>
  );
}

const benefits: Array<{
  icon: ReactNode;
  title: string;
  description: string;
}> = [
  {
    icon: <ShieldIcon />,
    title: "Premium materials",
    description:
      "Crafted from leather, silicone, and polycarbonate selected for longevity and feel.",
  },
  {
    icon: <LayersIcon />,
    title: "Precision fit",
    description:
      "Every case is engineered to the exact dimensions of your device — nothing loose, nothing bulky.",
  },
  {
    icon: <TruckIcon />,
    title: "Express delivery",
    description:
      "Ships within 1–3 business days with full tracking on every order.",
  },
];

export function PromoSection() {
  return (
    <>
      <section
        aria-labelledby="promo-heading"
        className="relative overflow-hidden border-b border-white/10 bg-[#0c0a09] py-20 [content-visibility:auto] [contain-intrinsic-size:auto_800px] sm:py-28"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-amber-500/[0.07] blur-[120px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgb(255_255_255/0.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:64px_64px]"
        />
        <Container className="relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                Why choose us
              </p>
              <h2
                id="promo-heading"
                className="mt-3 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl"
              >
                Built to protect. Designed to impress.
              </h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-14 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 100} className="h-full">
                <div className="group relative flex h-full flex-col overflow-hidden bg-[#0c0a09] p-8 transition-colors duration-500 hover:bg-[#15110d]">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgb(245_158_11/0.14),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="relative flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-500/10 text-amber-400 transition-all duration-500 group-hover:border-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950">
                      {benefit.icon}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-display text-4xl leading-none font-medium text-white/[0.08] tabular-nums transition-colors duration-500 group-hover:text-amber-400/30"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="relative mt-8 font-display text-xl font-medium text-stone-50">
                    {benefit.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-stone-400">
                    {benefit.description}
                  </p>

                  <span
                    aria-hidden="true"
                    className="relative mt-6 block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-amber-400/70 to-transparent transition-transform duration-700 group-hover:scale-x-100"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="border-b border-border bg-background py-20 sm:py-28"
      >
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0c0a09] px-6 py-16 text-center sm:px-16 sm:py-24">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(245_158_11/0.16),transparent_60%)]"
              />
              <div className="relative mx-auto max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                  The collection
                </p>
                <h2
                  id="cta-heading"
                  className="mt-4 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-6xl"
                >
                  Find your perfect fit.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-stone-400 sm:text-lg">
                  Explore the full range of cases, matched to over a dozen of
                  today&apos;s most popular devices.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <ButtonLink
                    href="/products"
                    size="lg"
                    className="btn-sheen bg-amber-500 text-stone-950 hover:bg-amber-400"
                  >
                    Browse all cases
                  </ButtonLink>
                  <ButtonLink
                    href="/brands"
                    size="lg"
                    variant="ghost"
                    className="border border-white/20 text-stone-100 hover:border-amber-400/60 hover:bg-white/5"
                  >
                    Browse brands
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}