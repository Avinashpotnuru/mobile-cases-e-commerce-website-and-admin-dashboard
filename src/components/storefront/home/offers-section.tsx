import Link from "next/link";
import { Container } from "@/components/ui/container";
import { listStorefrontCoupons } from "@/lib/services/coupon-service";
import type { StorefrontCoupon } from "@/lib/services/coupon-service";
import { Reveal } from "./reveal";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const moneyLabel = (cents: number | undefined): string | undefined =>
  cents === undefined ? undefined : moneyFormatter.format(cents / 100);

function discountLabel(coupon: StorefrontCoupon): string {
  return coupon.type === "percent"
    ? `${coupon.value}%`
    : `${moneyLabel(coupon.value) ?? coupon.value}`;
}

function TicketIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6Z" />
      <path d="M15 5h.01" />
      <path d="M15 19h.01" />
    </svg>
  );
}

export async function OffersSection() {
  const coupons = await listStorefrontCoupons();
  const featured = coupons.slice(0, 3);

  return (
    <section
      aria-labelledby="offers-heading"
      className="border-b border-white/10 bg-[#0c0a09] py-8 sm:py-10"
    >
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-500/10 text-amber-400 sm:flex">
                <TicketIcon />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                  Offers
                </p>
                <h2
                  id="offers-heading"
                  className="mt-0.5 truncate font-display text-lg font-medium tracking-tight text-stone-50 sm:text-xl"
                >
                  Save on your next case
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {featured.length === 0 ? (
                <span className="text-sm text-stone-400">
                  New offers land here soon.
                </span>
              ) : (
                featured.map((coupon) => (
                  <Link
                    key={coupon.code}
                    href="/coupons"
                    className="group inline-flex items-baseline gap-2 rounded-lg border border-white/10 bg-black/30 px-3.5 py-2 font-mono text-sm tracking-wide transition-colors hover:border-amber-400/60 hover:bg-black/50"
                  >
                    <span className="font-semibold text-amber-400">
                      {discountLabel(coupon)}
                    </span>
                    <span className="text-stone-200">{coupon.code}</span>
                  </Link>
                ))
              )}
              <Link
                href="/coupons"
                className="group inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-amber-400"
              >
                See all
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}