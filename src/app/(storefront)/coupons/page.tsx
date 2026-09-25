import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/storefront/home/reveal";
import { CopyCodeButton } from "@/components/storefront/coupons/copy-code-button";
import { listStorefrontCoupons } from "@/lib/services/coupon-service";
import type { StorefrontCoupon } from "@/lib/services/coupon-service";

export const metadata: Metadata = {
  title: "Offers & Coupons — Mobile Cases",
  description:
    "Active promo codes for savings on phone cases. Apply any code at checkout.",
};

export const revalidate = 300;

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});

const moneyLabel = (cents: number | undefined): string | undefined =>
  cents === undefined ? undefined : moneyFormatter.format(cents / 100);

function discountLabel(coupon: StorefrontCoupon): string {
  return coupon.type === "percent"
    ? `${coupon.value}% off`
    : `${moneyLabel(coupon.value) ?? coupon.value} off`;
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
    >
      <path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6Z" />
      <path d="M15 5h.01" />
      <path d="M15 19h.01" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function rulesFor(coupon: StorefrontCoupon): string[] {
  return [
    moneyLabel(coupon.minSubtotalCents)
      ? `Orders over ${moneyLabel(coupon.minSubtotalCents)}`
      : "Valid on all orders",
    moneyLabel(coupon.maxDiscountCents)
      ? `Capped at ${moneyLabel(coupon.maxDiscountCents)}`
      : "No maximum",
    coupon.expiresAt
      ? `Ends ${dateFormatter.format(coupon.expiresAt)}`
      : "No expiry",
  ];
}

function HeroTicket({ coupon }: { coupon?: StorefrontCoupon }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-amber-500/15 blur-[90px]"
      />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_-25px_rgb(0_0_0/0.8)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_158_11/0.18),transparent_55%)]"
        />
        <div className="relative flex items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-6 sm:p-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-400">
              <TicketIcon className="h-3.5 w-3.5" />
              Today&apos;s pick
            </span>
            <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-amber-400 sm:text-6xl">
              {coupon ? discountLabel(coupon) : "Off"}
            </p>
            <p className="text-sm leading-relaxed text-stone-400">
              {coupon
                ? "Limited-time saving on select cases. No minimum spend."
                : "New codes are on their way to you."}
            </p>
          </div>

          <div className="relative flex min-w-0 flex-col items-center justify-center gap-2 border-l border-dashed border-white/20 px-5 py-8 sm:px-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Code
            </p>
            <code className="mt-1 block max-w-[9rem] truncate font-mono text-lg font-bold tracking-[0.18em] text-stone-50 sm:text-xl">
              {coupon?.code ?? "SAVE20"}
            </code>
            {coupon ? (
              <CopyCodeButton
                code={coupon.code}
                className="mt-4 border-white/15 bg-white/5 text-stone-100 hover:bg-white/10 focus-visible:ring-offset-[#0c0a09]"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscountTicket({
  coupon,
  featured = false,
}: {
  coupon: StorefrontCoupon;
  featured?: boolean;
}) {
  const rules = rulesFor(coupon);

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${
        featured
          ? "border border-amber-400/40 bg-[#0c0a09] text-stone-50 shadow-[0_24px_70px_-30px_rgb(245_158_11/0.5)]"
          : "border border-border bg-card shadow-sm hover:shadow-md"
      }`}
    >
      {featured ? (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-[110px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_158_11/0.18),transparent_55%)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
          />
        </>
      ) : null}

      <div className={`relative p-6 ${featured ? "" : "pb-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              featured
                ? "border border-amber-400/30 bg-amber-500/15 text-amber-400"
                : "border border-accent/25 bg-accent/10 text-accent"
            }`}
          >
            <TicketIcon className="h-3.5 w-3.5" />
            {featured ? "Best offer" : "Promo code"}
          </span>
          <span
            className={`font-display text-3xl font-semibold tracking-tight sm:text-4xl ${
              featured ? "text-amber-400" : "text-accent"
            }`}
          >
            {discountLabel(coupon)}
          </span>
        </div>

        <ul
          className={`mt-6 flex flex-col gap-2 text-sm ${
            featured ? "text-stone-400" : "text-muted-foreground"
          }`}
        >
          {rules.map((rule) => (
            <li key={rule} className="flex items-center gap-2">
              <CheckIcon
                className={featured ? "h-4 w-4 text-amber-400" : "h-4 w-4 text-accent"}
              />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`relative mt-auto border-t border-dashed ${
          featured ? "border-white/15" : "border-black/15"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-3 left-6 h-6 w-6 rounded-full ${
            featured ? "bg-[#0c0a09]" : "bg-background"
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-3 right-6 h-6 w-6 rounded-full ${
            featured ? "bg-[#0c0a09]" : "bg-background"
          }`}
        />
        <div className={`flex items-center justify-between gap-4 p-6 ${featured ? "" : "pt-5"}`}>
          <div className="min-w-0">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                featured ? "text-stone-500" : "text-muted-foreground"
              }`}
            >
              Copy this code
            </p>
            <code
              className={`mt-1 block max-w-full truncate font-mono text-lg font-bold tracking-[0.14em] ${
                featured ? "text-stone-100" : "text-foreground"
              }`}
            >
              {coupon.code}
            </code>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyCodeButton
              code={coupon.code}
              className={
                featured
                  ? "border-white/15 bg-white/5 text-stone-100 hover:bg-white/10 focus-visible:ring-offset-[#0c0a09]"
                  : ""
              }
            />
            <ButtonLink
              href="/products"
              size="sm"
              className={
                featured
                  ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
                  : ""
              }
            >
              Shop now
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}

const trustPoints = [
  "Verified by our team",
  "Auto-applied at checkout",
  "New offers added weekly",
];

const steps = [
  {
    title: "Pick your code",
    description:
      "Browse the live offers and copy the promo code you want to use.",
  },
  {
    title: "Add cases to your cart",
    description:
      "Fill your cart with cases for any of our supported devices.",
  },
  {
    title: "Apply at checkout",
    description:
      "Paste the code into the Promo code field — the discount is applied instantly.",
  },
];

const faqs = [
  {
    question: "How do I apply a coupon at checkout?",
    answer:
      "Copy the promo code you want to use, then paste it into the “Promo code” field in the order summary while checking out. The discount is applied instantly and reflected in your total before you pay.",
  },
  {
    question: "Can I use more than one coupon on the same order?",
    answer:
      "One coupon per order. If you have multiple codes, pick whichever gives you the best saving — stacking isn’t available.",
  },
  {
    question: "Why is my code showing as invalid?",
    answer:
      "Codes can expire, reach their usage limit, or require a minimum order total. Double-check the code for typos, confirm you meet any minimum order amount, and make sure the offer hasn’t ended.",
  },
  {
    question: "Do coupons apply to shipping charges?",
    answer:
      "Coupons discount the order subtotal (your cases), not shipping. Free-shipping thresholds are still based on your pre-discount subtotal, so a coupon never pushes you out of free shipping.",
  },
  {
    question: "Can I use a coupon on sale items?",
    answer:
      "Yes. Coupons are valid across the entire collection, including cases already marked down. Where a minimum order applies, it uses your cart subtotal before the coupon discount.",
  },
  {
    question: "Can I use a coupon on a previous order?",
    answer:
      "No — coupons are applied at checkout and can’t be retroactively added to an order that’s already been placed.",
  },
];

export default async function CouponsPage() {
  const coupons = await listStorefrontCoupons();
  const featured = coupons[0];
  const rest = coupons.slice(1);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0c0a09] py-20 sm:py-28">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-amber-500/[0.09] blur-[130px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-600/10 blur-[120px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgb(255_255_255/0.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:64px_64px]"
        />

        <Container className="relative">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                Promo codes
              </p>
              <h1 className="mt-4 font-display text-5xl font-medium tracking-tight text-stone-50 sm:text-6xl lg:text-7xl">
                Save on
                <br />
                every case
                <br />
                you carry.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-stone-400 sm:text-lg">
                Hand-picked promo codes available right now. Copy one, apply it
                at checkout, and enjoy instant savings on premium phone cases.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href="/products"
                  size="lg"
                  className="btn-sheen bg-amber-500 text-stone-950 hover:bg-amber-400"
                >
                  Shop the collection
                </ButtonLink>
                <ButtonLink
                  href="#how-it-works"
                  size="lg"
                  variant="ghost"
                  className="border border-white/20 text-stone-100 hover:border-amber-400/60 hover:bg-white/5"
                >
                  How it works
                </ButtonLink>
              </div>

              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
                {trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-sm text-stone-400"
                  >
                    <CheckIcon className="h-4 w-4 text-amber-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={150}>
              <HeroTicket coupon={featured} />
            </Reveal>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="available-heading"
        className="border-b border-border bg-background py-16 sm:py-24"
      >
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Available now
                </p>
                <h2
                  id="available-heading"
                  className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
                >
                  Live coupons
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {coupons.length === 0
                  ? "No active codes today"
                  : `${coupons.length} active ${coupons.length === 1 ? "code" : "codes"}`}
              </p>
            </div>
          </Reveal>

          {coupons.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
              <TicketIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 font-display text-xl font-semibold text-foreground">
                No coupons right now
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                New offers land here regularly — follow our store for the next
                drop.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured ? (
                <Reveal className="md:col-span-2">
                  <DiscountTicket coupon={featured} featured />
                </Reveal>
              ) : null}
              {rest.map((coupon, index) => (
                <Reveal
                  key={coupon.code}
                  delay={Math.min(index, 2) * 100}
                  className="h-full"
                >
                  <DiscountTicket coupon={coupon} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="scroll-mt-24 border-b border-border bg-muted/40 py-16 sm:py-24"
      >
        <Container>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Simple by design
            </p>
            <h2
              id="how-heading"
              className="mt-3 max-w-xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
            >
              Redeem in three steps
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <li className="relative border-t border-border pt-6">
                  <span className="absolute -top-[3px] left-0 h-[3px] w-14 bg-accent" />
                  <span className="font-display text-5xl font-medium tracking-tight text-foreground/10 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="scroll-mt-24 border-b border-border bg-background py-16 sm:py-24"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Need help?
                </p>
                <h2
                  id="faq-heading"
                  className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
                >
                  Coupon questions, answered.
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Everything you need to know about redeeming codes. Still
                  stuck? Our support team is happy to help.
                </p>
                <ButtonLink
                  href="mailto:support@mobilecases.example"
                  variant="outline"
                  className="mt-7"
                >
                  Contact support
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="border-t border-border">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group border-b border-border py-5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="font-display text-lg font-medium tracking-tight text-foreground">
                        {faq.question}
                      </span>
                      <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="save-cta-heading"
        className="bg-background py-16 sm:py-24"
      >
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0c0a09] px-6 py-16 text-center sm:px-16 sm:py-20">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(245_158_11/0.16),transparent_60%)]"
              />
              <div className="relative mx-auto max-w-2xl">
                <TicketIcon className="mx-auto h-8 w-8 text-amber-400" />
                <h2
                  id="save-cta-heading"
                  className="mt-5 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl"
                >
                  Ready to save?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-stone-400 sm:text-lg">
                  Pick a code, grab your cases, and apply the discount at
                  checkout.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <ButtonLink
                    href="/products"
                    size="lg"
                    className="btn-sheen bg-amber-500 text-stone-950 hover:bg-amber-400"
                  >
                    Browse all cases
                  </ButtonLink>
                  <ButtonLink
                    href="#available-heading"
                    size="lg"
                    variant="ghost"
                    className="border border-white/20 text-stone-100 hover:border-amber-400/60 hover:bg-white/5"
                  >
                    See the codes
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