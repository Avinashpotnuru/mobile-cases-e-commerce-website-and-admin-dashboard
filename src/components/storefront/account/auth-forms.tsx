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
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
    >
      {message}
    </p>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Email" htmlFor="signin-email">
        <Input
          id="signin-email"
          name="email"
          type="email"
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
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={submitting}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      {error ? <ErrorBanner message={error} /> : null}

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/account/signup"
          className="font-medium text-accent transition-colors hover:text-accent/80"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
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
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          disabled={submitting}
          onChange={(event) => setField("password", event.target.value)}
        />
      </Field>

      {error ? <ErrorBanner message={error} /> : null}

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/account/signin"
          className="font-medium text-accent transition-colors hover:text-accent/80"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}