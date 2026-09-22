import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AccountNav } from "@/components/storefront/account/account-nav";
import { AddressesPanel } from "@/components/storefront/account/addresses-panel";
import { requireCustomerPage } from "@/lib/auth/customer";
import { listCustomerAddresses } from "@/lib/services/address-service";

export const metadata: Metadata = {
  title: "Your addresses",
  description: "Manage your saved shipping addresses.",
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const customer = await requireCustomerPage();
  const addresses = await listCustomerAddresses(customer._id);

  return (
    <section className="bg-background py-16 sm:py-20">
      <Container className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Your account
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Address book
        </h1>
        <div className="mt-6">
          <AccountNav />
        </div>

        <div className="mt-10">
          <AddressesPanel initialAddresses={addresses} />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Saved addresses can be selected during checkout to prefill your{" "}
          shipping details. Want a recap of your purchases?{" "}
          <Link
            href="/account/orders"
            className="font-medium text-accent transition-colors hover:text-accent/80"
          >
            View order history
          </Link>
        </p>
      </Container>
    </section>
  );
}