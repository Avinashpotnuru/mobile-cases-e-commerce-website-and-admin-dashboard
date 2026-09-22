import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SignInForm } from "@/components/storefront/account/auth-forms";
import { getCurrentCustomer } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Mobile Cases account.",
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  if (await getCurrentCustomer()) {
    redirect("/account");
  }

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            Mobile Cases · Account
          </p>
          <h1 className="mt-4 font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
            Welcome back
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Sign in to review your orders, track deliveries, save cases and
            keep your delivery details handy.
          </p>
          <div className="mt-8 hidden rounded-2xl border border-border bg-card p-6 lg:block">
            <p className="font-display text-xl font-medium text-foreground">
              &ldquo;Your case arrived in two days, and it fits like it was
              made for my phone.&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              — A regular customer
            </p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Prefer to browse first?{" "}
            <Link
              href="/products"
              className="font-medium text-accent transition-colors hover:text-accent/80"
            >
              Explore the collection
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your email and password to continue.
          </p>
          <div className="mt-6">
            <SignInForm />
          </div>
        </div>
      </Container>
    </section>
  );
}