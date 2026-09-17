"use client";

import { useState, type FormEvent } from "react";
import { AdminApiError, apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BrandRow, CatalogStatus } from "@/types/catalog";

type FieldErrors = Partial<Record<"name" | "slug" | "description" | "logoUrl" | "status", string>>;

export function BrandForm({
  initial,
  onSaved,
  onClose,
}: {
  initial?: BrandRow;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [status, setStatus] = useState<CatalogStatus>(initial?.status ?? "active");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const nextErrors: FieldErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest<BrandRow>(
        initial ? `/api/admin/brands/${initial._id}` : "/api/admin/brands",
        {
          method: initial ? "PATCH" : "POST",
          body: {
            name,
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            logoUrl: logoUrl.trim() || undefined,
            status,
          },
        },
      );
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof AdminApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as FieldErrors);
      } else if (error instanceof AdminApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field
        label="Name"
        htmlFor="brand-name"
        error={errors.name}
      >
        <Input
          id="brand-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={submitting}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field
        label="Slug"
        htmlFor="brand-slug"
        hint="Leave blank to auto-generate from the name."
        error={errors.slug}
      >
        <Input
          id="brand-slug"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          disabled={submitting}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(errors.slug)}
        />
      </Field>
      <Field
        label="Description"
        htmlFor="brand-description"
        error={errors.description}
      >
        <Textarea
          id="brand-description"
          name="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(errors.description)}
        />
      </Field>
      <Field
        label="Logo URL"
        htmlFor="brand-logo-url"
        error={errors.logoUrl}
      >
        <Input
          id="brand-logo-url"
          name="logoUrl"
          type="url"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
          disabled={submitting}
          placeholder="https://…"
          aria-invalid={Boolean(errors.logoUrl)}
        />
      </Field>
      <Field label="Status" htmlFor="brand-status" error={errors.status}>
        <Select
          id="brand-status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as CatalogStatus)}
          disabled={submitting}
          aria-invalid={Boolean(errors.status)}
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>
      </Field>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <div className="mt-2 flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {initial ? "Save changes" : "Create brand"}
        </Button>
      </div>
    </form>
  );
}