import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "./reveal";

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

const faqs = [
  {
    question: "Which devices are supported?",
    answer:
      "We make cases for iPhone, Samsung Galaxy, Google Pixel, and many more — every case is engineered to the exact dimensions of your device for a precise fit.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders ship within 1–3 business days with full tracking. Shipping is free on all orders over ₹50, and your coupon discount never affects the free-shipping threshold.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You have 30 days to return any case in its original, unused condition for a full refund. Reach out to our support team with your order number to get started.",
  },
  {
    question: "What materials are your cases made from?",
    answer:
      "Premium leather, silicone, and polycarbonate — selected for longevity, grip, and feel. Every case is backed by our quality guarantee against manufacturing defects.",
  },
  {
    question: "How do I pay for my order?",
    answer:
      "Checkout is secure and supports all major payment methods. Your discount and any active coupon are applied before you confirm payment.",
  },
  {
    question: "Can I track or manage my order?",
    answer:
      "Yes — sign in to your account to view order history and status, or use the guest confirmation page you received after checkout for live tracking.",
  },
];

export function ShopFaq() {
  return (
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
                Good to know
              </p>
              <h2
                id="faq-heading"
                className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
              >
                Shopping FAQ
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Quick answers on shipping, returns, materials, and more. Can&apos;t
                find what you need? Our support team is here to help.
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
  );
}