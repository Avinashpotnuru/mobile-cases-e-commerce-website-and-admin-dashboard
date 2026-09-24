import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/storefront/account/auth-forms";
import { getCurrentCustomer } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Mobile Cases account.",
  robots: { index: false, follow: false },
};

const PERKS = [
  { title: "Track orders live", body: "See every delivery from shelf to door." },
  { title: "Save favourites", body: "Keep the cases you love, one tap away." },
  { title: "Fast checkout", body: "Your details saved for next time." },
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function VisualPanel() {
  return (
    <div className="relative hidden h-full flex-col overflow-hidden bg-[#0c0a09] p-8 lg:flex xl:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgb(245_158_11/0.2),transparent_46%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgb(255_255_255/0.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="select-none font-display pointer-events-none absolute -top-24 -right-8 text-[15rem] leading-none font-semibold tracking-tighter text-white/[0.03]"
      >
        +
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="hero-rise group inline-flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]"
          style={{ "--hero-delay": "0ms" } as CSSProperties}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-stone-950 transition-transform duration-500 group-hover:rotate-[10deg]">
            <span className="font-display text-base font-semibold">M</span>
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-stone-50">
            Mobile Cases
          </span>
        </Link>
        <span className="hero-rise inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-amber-300" style={{ "--hero-delay": "80ms" } as CSSProperties}>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Step 2 of 2
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-10 py-6">
        <div>
          <p
            className="hero-rise flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400"
            style={{ "--hero-delay": "160ms" } as CSSProperties}
          >
            <span aria-hidden="true" className="h-px w-7 bg-amber-400/60" />
            Join the club
          </p>
          <h1
            className="hero-rise mt-3 font-display text-4xl leading-[1.05] font-medium tracking-tight text-stone-50 xl:text-5xl"
            style={{ "--hero-delay": "240ms" } as CSSProperties}
          >
            Own the perfect
            <br />
            fit.
          </h1>
          <p
            className="hero-rise mt-4 max-w-md text-sm leading-relaxed text-stone-400"
            style={{ "--hero-delay": "320ms" } as CSSProperties}
          >
            A free account comes with everything you need to order, follow and
            favourite your cases.
          </p>
        </div>

        <div className="relative pl-8">
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-2.5 w-px bg-gradient-to-b from-amber-400/50 via-white/10 to-transparent"
          />
          <ul className="space-y-5">
            {PERKS.map((perk, index) => (
              <li
                key={perk.title}
                className="hero-rise relative flex items-center gap-4"
                style={{ "--hero-delay": `${400 + index * 100}ms` } as CSSProperties}
              >
                <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/40 bg-[#0c0a09] text-amber-400">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-stone-100">
                    {perk.title}
                  </span>
                  <span className="block text-[13px] leading-snug text-stone-500">
                    {perk.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-end justify-between border-t border-white/10 pt-5">
        <p className="text-[11px] font-medium tracking-wide text-stone-500">
          Free forever &middot; No spam &middot; 30-day easy returns
        </p>
        <span className="hidden font-display text-xs tracking-[0.3em] text-stone-600 uppercase xl:block">
          Est. 2026
        </span>
      </div>
    </div>
  );
}

export default async function SignUpPage() {
  if (await getCurrentCustomer()) {
    redirect("/account");
  }

  return (
    <section className="relative h-dvh overflow-hidden bg-background lg:p-4 xl:p-5">
      <div className="grid h-full grid-cols-1 overflow-hidden border-border lg:grid-cols-[1fr_1.15fr] lg:rounded-[2rem] lg:border lg:shadow-[0_40px_90px_-45px_rgb(0_0_0/0.4)]">
        <VisualPanel />

        <div className="relative flex h-full flex-col justify-center overflow-y-auto bg-card px-6 py-8 sm:px-10 lg:px-12">
          <div className="hero-rise mb-6 lg:hidden" style={{ "--hero-delay": "0ms" } as CSSProperties}>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-stone-950 transition-transform duration-500 group-hover:rotate-[10deg]">
                <span className="font-display text-base font-semibold">M</span>
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">
                Mobile Cases
              </span>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <p
              className="hero-rise text-xs font-semibold tracking-[0.24em] text-accent uppercase"
              style={{ "--hero-delay": "120ms" } as CSSProperties}
            >
              Create account
            </p>

            <h1
              className="hero-rise mt-3 font-display text-3xl leading-[1.05] font-medium tracking-tight text-foreground sm:text-4xl"
              style={{ "--hero-delay": "200ms" } as CSSProperties}
            >
              Good things start here.
            </h1>

            <p
              className="hero-rise mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground"
              style={{ "--hero-delay": "280ms" } as CSSProperties}
            >
              Takes less than a minute — no card, no spam, just your cases.
            </p>

            <div
              className="hero-rise mt-7"
              style={{ "--hero-delay": "360ms" } as CSSProperties}
            >
              <SignUpForm />
            </div>

            <p
              className="hero-rise mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground"
              style={{ "--hero-delay": "460ms" } as CSSProperties}
            >
              <LockIcon className="h-3.5 w-3.5 text-accent" />
              Your details are encrypted &amp; scrypt-hashed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}