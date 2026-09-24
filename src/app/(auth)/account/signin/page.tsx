import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/storefront/account/auth-forms";
import { getCurrentCustomer } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Mobile Cases account.",
  robots: { index: false, follow: false },
};

type DeviceMockT = {
  tilt: string;
  size: string;
  chip: string;
  price: string;
  layer: string;
  accent?: boolean;
};

const DEVICES: DeviceMockT[] = [
  { tilt: "-rotate-[22deg]", size: "h-[300px] w-[150px]", chip: "SOLID ARMY", price: "₹899", layer: "-mr-16" },
  { tilt: "rotate-0", size: "h-[360px] w-[180px]", chip: "AMBER GRIP", price: "₹999", layer: "z-20 -mx-10 lg:-mx-12", accent: true },
  { tilt: "rotate-[22deg]", size: "h-[300px] w-[150px]", chip: "MIDNIGHT", price: "₹1,149", layer: "-ml-16" },
];

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

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2.5l2.9 6.06 6.6.82-4.86 4.5 1.25 6.52L12 17.9l-5.89 3 1.25-6.52L2.5 9.38l6.6-.82L12 2.5z" />
    </svg>
  );
}

function PhoneMock({ device }: { device: (typeof DEVICES)[number] }) {
  const { tilt, size, chip, price, layer, accent } = device;
  return (
    <div className={layer}>
      <div
        className={`relative ${size} ${tilt} rounded-[1.75rem] border p-2 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.85)] transition-transform duration-700 ease-out hover:rotate-0 ${
          accent
            ? "z-20 border-amber-400/40 bg-gradient-to-b from-stone-700 to-stone-900"
            : "border-white/10 bg-gradient-to-b from-stone-700/40 to-stone-900/50"
        }`}
      >
        <div
          className={`relative flex h-full w-full flex-col overflow-hidden rounded-[1.35rem] border border-white/10 ${
            accent ? "bg-[#0c0a09]" : "bg-[#0c0a09]/80"
          }`}
        >
          {accent && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_158_11/0.25),transparent_55%)]" />
          )}
          <span className="relative mx-auto mt-2 block h-1 w-8 rounded-full bg-white/15" />
          <span
            className={`relative mt-6 font-display text-base font-semibold tracking-tight ${
              accent ? "text-amber-300" : "text-stone-100"
            }`}
          >
            {chip}
          </span>
          <span className="relative mt-1 block text-[11px] tracking-[0.28em] text-stone-500 uppercase">
            Mobile Cases
          </span>
          <span className="relative mt-3 block h-2 w-4/5 rounded-full bg-white/10" />
          <span className="relative mt-1.5 block h-2 w-3/5 rounded-full bg-white/[0.07]" />
          <span className="relative mt-1.5 block h-2 w-full rounded-full bg-white/[0.07]" />
          <span className="relative mt-1.5 block h-2 w-2/3 rounded-full bg-white/[0.07]" />
          <span
            className={`relative mt-auto flex items-end justify-between px-1 pb-2 ${
              accent ? "text-amber-400" : "text-stone-400"
            }`}
          >
            <span className="font-display text-lg font-semibold">{price}</span>
            <span className="text-xl leading-none">{accent ? "★" : "•"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function VisualPanel() {
  return (
    <div className="relative hidden h-full flex-col overflow-hidden bg-[#0c0a09] p-8 lg:flex xl:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(245_158_11/0.22),transparent_44%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(245_158_11/0.1),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgb(255_255_255/0.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="select-none font-display pointer-events-none absolute -bottom-28 -left-10 text-[16rem] leading-none font-semibold tracking-tighter text-white/[0.03]"
      >
        M
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
        <span className="hero-rise inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-300" style={{ "--hero-delay": "80ms" } as CSSProperties}>
          <StarIcon className="h-3 w-3 text-amber-400" />
          4.9 &middot; 2.1k reviews
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 py-6">
        <div className="relative flex items-end justify-center">
          <div className="pointer-events-none absolute top-10 left-1/2 h-64 w-[26rem] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[90px]" />
          {DEVICES.map((device, index) => (
            <div
              key={device.chip}
              className="hero-rise"
              style={{ "--hero-delay": `${200 + index * 110}ms` } as CSSProperties}
            >
              <PhoneMock device={device} />
            </div>
          ))}
          <div className="float-soft absolute -top-2 left-1/2 z-30 -translate-x-1/2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-amber-300 backdrop-blur-sm">
            Free shipping over &#8377;999
          </div>
          <div className="float-soft absolute top-16 -left-6 z-30 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold text-stone-200 backdrop-blur-sm [animation-delay:0.9s]">
            <span className="flex items-center gap-1 text-amber-300"><CheckIcon className="h-3 w-3" /> In stock</span>
            <span className="mt-0.5 block text-[10px] font-medium text-stone-400">Ships in 24 hours</span>
          </div>
          <div className="float-soft absolute right-0 bottom-14 z-30 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold text-stone-200 backdrop-blur-sm [animation-delay:1.6s]">
            <span className="flex items-center gap-1 text-amber-300"><CheckIcon className="h-3 w-3" /> 30-day returns</span>
            <span className="mt-0.5 block text-[10px] font-medium text-stone-400">No questions asked</span>
          </div>
          <div className="float-soft absolute -bottom-8 right-1/4 z-30 rounded-full border border-amber-400/30 bg-[#0c0a09]/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-amber-300 backdrop-blur-sm [animation-delay:2.2s]">
            Order delivered on time
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-end justify-between border-t border-white/10 pt-5">
        <div className="flex items-center gap-8">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-stone-50">12k+</p>
            <p className="mt-0.5 text-[11px] tracking-wide text-stone-500">cases delivered</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-stone-50">4.9/5</p>
            <p className="mt-0.5 text-[11px] tracking-wide text-stone-500">avg. rating</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-stone-50">30-day</p>
            <p className="mt-0.5 text-[11px] tracking-wide text-stone-500">easy returns</p>
          </div>
        </div>
        <span className="hidden font-display text-xs tracking-[0.3em] text-stone-600 uppercase xl:block">
          Est. 2026
        </span>
      </div>
    </div>
  );
}

export default async function SignInPage() {
  if (await getCurrentCustomer()) {
    redirect("/account");
  }

  return (
    <section className="relative h-dvh overflow-hidden bg-background lg:p-4 xl:p-5">
      <div className="grid h-full grid-cols-1 overflow-hidden border-border lg:grid-cols-[1.15fr_1fr] lg:rounded-[2rem] lg:border lg:shadow-[0_40px_90px_-45px_rgb(0_0_0/0.4)]">
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
              Member sign in
            </p>

            <h1
              className="hero-rise mt-3 font-display text-3xl leading-[1.05] font-medium tracking-tight text-foreground sm:text-4xl"
              style={{ "--hero-delay": "200ms" } as CSSProperties}
            >
              Welcome back.
            </h1>

            <p
              className="hero-rise mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground"
              style={{ "--hero-delay": "280ms" } as CSSProperties}
            >
              Track your orders, keep the cases you love and check out faster.
            </p>

            <div
              className="hero-rise mt-7"
              style={{ "--hero-delay": "360ms" } as CSSProperties}
            >
              <SignInForm />
            </div>

            <p
              className="hero-rise mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground"
              style={{ "--hero-delay": "460ms" } as CSSProperties}
            >
              <LockIcon className="h-3.5 w-3.5 text-accent" />
              Secure sign in &middot; scrypt-hashed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}