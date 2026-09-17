"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        setError("Invalid credentials. Please try again.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Username" htmlFor="admin-username">
        <Input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          disabled={submitting}
          autoFocus
          onChange={(event) => setUsername(event.target.value)}
        />
      </Field>
      <Field label="Password" htmlFor="admin-password">
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={submitting}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={submitting} className="btn-sheen w-full">
        Sign in
      </Button>
    </form>
  );
}