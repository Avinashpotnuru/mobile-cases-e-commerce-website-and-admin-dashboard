"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCustomer } from "@/components/storefront/use-customer";

type ApiErrorPayload = {
  error?: {
    message?: string;
    fieldErrors?: Record<string, string>;
  };
};

const STAR_LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"] as const;

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {STAR_LABELS.map((label, index) => {
        const rating = index + 1;
        const selected = value >= rating;
        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} star${rating === 1 ? "" : "s"} — ${label}`}
            disabled={disabled}
            onClick={() => onChange(value === rating ? 0 : rating)}
            className={`text-2xl leading-none transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
              selected
                ? "text-amber-500 hover:scale-110"
                : "text-border hover:text-amber-500/50"
            }`}
          >
            {"\u2605"}
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const customer = useCustomer();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!customer) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Share your experience
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to rate this case and leave a review.
        </p>
        <ButtonLink href="/account/signin" className="mt-4">
          Sign in to review
        </ButtonLink>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Thank you for your review
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your rating and comment have been published for this case.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.refresh()}
        >
          Refresh to see updates
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
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
      setSubmitted(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <span className="text-sm font-medium text-foreground">Your rating</span>
        <div className="mt-1.5">
          <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        </div>
        {fieldErrors.rating ? (
          <p className="mt-1 text-xs font-medium text-destructive">
            {fieldErrors.rating}
          </p>
        ) : null}
      </div>

      <Field
        label="Title (optional)"
        htmlFor="review-title"
        error={fieldErrors.title}
      >
        <Input
          id="review-title"
          name="title"
          value={title}
          disabled={submitting}
          onChange={(event) => {
            setTitle(event.target.value);
            setFieldErrors((previous) => {
              if (!("title" in previous)) return previous;
              const next = { ...previous };
              delete next.title;
              return next;
            });
          }}
        />
      </Field>

      <Field label="Comment" htmlFor="review-comment" error={fieldErrors.comment}>
        <Textarea
          id="review-comment"
          name="comment"
          rows={4}
          value={comment}
          disabled={submitting}
          onChange={(event) => {
            setComment(event.target.value);
            setFieldErrors((previous) => {
              if (!("comment" in previous)) return previous;
              const next = { ...previous };
              delete next.comment;
              return next;
            });
          }}
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

      <Button type="submit" loading={submitting} className="mt-2">
        {rating ? `Submit ${rating}-star review` : "Submit review"}
      </Button>
    </form>
  );
}