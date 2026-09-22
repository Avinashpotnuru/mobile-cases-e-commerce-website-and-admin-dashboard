import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SignOutButton } from "@/components/storefront/account/sign-out-button";
import { requireCustomerPage } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your Mobile Cases account.",
  robots: { index: false, follow: false },
};

const quickLinks = [
  {
    href: "/account/orders",
    title: "Orders",
    description: "Review past purchases and track deliveries.",
  },
  {
    href: "/saved",
    title: "Saved cases",
    description: "The cases you\u2019ve saved for later.",
  },
  {
    href: "/account/addresses",
    title: "Saved addresses",
    description: "Delivery details you use again and again.",
  },
];

export default async function AccountPage() {
  const customer = await requireCustomerPage();

  return (
    <section className="bg-background py-16 sm:py-20">
      <Container className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Your account
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Hello, {customer.firstName}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {customer.email}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
            >
              <p className="font-display text-xl font-semibold tracking-tight text-foreground group-hover:text-accent">
                {link.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Not you?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign out of this device.
            </p>
          </div>
          <SignOutButton />
        </div>
      </Container>
    </section>
  );
}