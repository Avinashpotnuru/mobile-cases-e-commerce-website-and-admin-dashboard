"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { notifyCustomerChange } from "@/components/storefront/use-customer";

type ApiErrorPayload = {
  error?: {
    message?: string;
    fieldErrors?: Record<string, string>;
  };
};

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      key={message}
      role="alert"
      className="animate-shake flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-xs font-medium text-destructive"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-px h-4 w-4 shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {message}
    </p>
  );
}

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

function EyeIcon({ open, className }: { open: boolean; className?: string }) {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
      {open ? <path d="M4 20 20 4" /> : null}
    </svg>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as ApiErrorPayload;
      if (!response.ok) {
        setError(payload.error?.message ?? "Please try again.");
        return;
      }
      notifyCustomerChange();
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Email" htmlFor="signin-email">
        <Input
          id="signin-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          disabled={submitting}
          autoFocus
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field label="Password" htmlFor="signin-password">
        <div className="relative">
          <Input
            id="signin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            autoComplete="current-password"
            className="pr-12"
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <EyeIcon open={showPassword} className="h-[18px] w-[18px]" />
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">Trouble signing in?</span>
        <a
          href="mailto:support@mobilecases.example?subject=Help%20signing%20in"
          className="font-semibold text-accent transition-colors duration-200 hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Get help
        </a>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="btn-sheen group w-full bg-amber-500 text-stone-950 hover:bg-amber-400"
      >
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting ? (
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        ) : null}
      </Button>

      <div className="relative flex items-center gap-3 py-1">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          New to Mobile Cases?
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <Link
        href="/account/signup"
        className="group flex w-full items-center justify-center gap-1.5 rounded-sm border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Create an account
      </Link>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/customer/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiErrorPayload;
      if (!response.ok) {
        if (payload.error?.fieldErrors) {
          setFieldErrors(payload.error.fieldErrors);
        } else {
          setError(payload.error?.message ?? "Please try again.");
        }
        return;
      }
      notifyCustomerChange();
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const setField = (key: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="signup-first" error={fieldErrors.firstName}>
          <Input
            id="signup-first"
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            disabled={submitting}
            onChange={(event) => setField("firstName", event.target.value)}
          />
        </Field>
        <Field label="Last name" htmlFor="signup-last" error={fieldErrors.lastName}>
          <Input
            id="signup-last"
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            disabled={submitting}
            onChange={(event) => setField("lastName", event.target.value)}
          />
        </Field>
      </div>
      <Field label="Email" htmlFor="signup-email" error={fieldErrors.email}>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.email}
          disabled={submitting}
          onChange={(event) => setField("email", event.target.value)}
        />
      </Field>
      <Field
        label="Password"
        htmlFor="signup-password"
        hint="At least 8 characters."
        error={fieldErrors.password}
      >
        <div className="relative">
          <Input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="pr-12"
            value={form.password}
            disabled={submitting}
            onChange={(event) => setField("password", event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <EyeIcon open={showPassword} className="h-[18px] w-[18px]" />
          </button>
        </div>
      </Field>

      {error ? <ErrorBanner message={error} /> : null}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="btn-sheen group w-full bg-amber-500 text-stone-950 hover:bg-amber-400"
      >
        {submitting ? "Creating account…" : "Create account"}
        {!submitting ? (
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        ) : null}
      </Button>

      <div className="relative flex items-center gap-3 py-1">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          Already a member?
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <Link
        href="/account/signin"
        className="group flex w-full items-center justify-center gap-1.5 rounded-sm border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Sign in
      </Link>
    </form>
  );
}