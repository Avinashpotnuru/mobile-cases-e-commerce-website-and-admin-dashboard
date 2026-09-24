import Link from "next/link";
import { Container } from "@/components/ui/container";

const shopLinks = [
  { href: "/products", label: "All cases" },
  { href: "/brands", label: "Brands" },
  { href: "/coupons", label: "Coupons" },
  { href: "/cart", label: "Cart" },
];

const promises = [
  "Free shipping over ₹50",
  "30-day returns",
  "Secure checkout",
];

function ArrowIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm text-stone-400 transition-colors duration-200 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]"
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-amber-400/70 transition-transform duration-300 group-hover:scale-x-100"
        />
      </span>
      <ArrowIcon className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="relative overflow-hidden bg-[#0c0a09] text-stone-400 [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[110px]"
      />

      <Container className="relative py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-stone-950 transition-transform duration-500 group-hover:rotate-[8deg]">
                <span className="font-display text-sm font-semibold">M</span>
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight text-stone-50">
                Mobile Cases
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-stone-400">
              Premium cases for the devices you live with. Precision-engineered,
              protection you can feel, delivered across India.
            </p>
            <a
              href="mailto:support@mobilecases.example"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-stone-200 transition-colors duration-200 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition-colors duration-300 group-hover:border-amber-400/50">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              support@mobilecases.example
            </a>
          </div>

          <nav aria-label="Footer shop links">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-stone-50 uppercase">
              Shop
            </h2>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.22em] text-stone-50 uppercase">
              The promise
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-stone-400">
              {promises.map((promise) => (
                <li key={promise} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-amber-500"
                  />
                  {promise}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-stone-400 sm:flex-row">
          <span>&copy; {year} Mobile Cases. All rights reserved.</span>
          <span className="order-3 sm:order-2">Premium cases, precision-made.</span>
          <div className="order-2 flex items-center gap-5 sm:order-3">
            <Link
              href="/admin/dashboard"
              className="text-xs font-medium text-stone-400 transition-colors duration-200 hover:text-amber-400"
            >
              Admin
            </Link>
            <a
              href="#"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 transition-colors duration-200 hover:text-amber-400"
            >
              Back to top
              <ArrowIcon className="h-3.5 w-3.5 -rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
