import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SignUpForm } from "@/components/storefront/account/auth-forms";
import { getCurrentCustomer } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Mobile Cases account.",
  robots: { index: false, follow: false },
};

export default async function SignUpPage() {
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
            Your cases, organised
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Track every order in one place, save the cases you love and check
            out faster with saved delivery details.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="font-display text-accent">
                01
              </span>
              Order history &amp; delivery tracking
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="font-display text-accent">
                02
              </span>
              Saved cases for later
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="font-display text-accent">
                03
              </span>
              Saved delivery addresses
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Have an account?{" "}
            <Link
              href="/account/signin"
              className="font-medium text-accent transition-colors hover:text-accent/80"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Takes less than a minute.
          </p>
          <div className="mt-6">
            <SignUpForm />
          </div>
        </div>
      </Container>
    </section>
  );
}