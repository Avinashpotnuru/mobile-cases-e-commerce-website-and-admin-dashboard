"use client";

import { useState, type FormEvent } from "react";
import { AdminApiError, apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { BrandRow, CatalogStatus, MobileModelRow } from "@/types/catalog";

type FieldErrors = Partial<Record<"brandId" | "name" | "slug" | "imageUrl" | "status", string>>;

export function MobileModelForm({
  initial,
  brands,
  onSaved,
  onClose,
}: {
  initial?: MobileModelRow;
  brands: BrandRow[];
  onSaved: () => void;
  onClose: () => void;
}) {
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [status, setStatus] = useState<CatalogStatus>(initial?.status ?? "active");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const nextErrors: FieldErrors = {};
    if (!brandId) {
      nextErrors.brandId = "Select a brand.";
    }
    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest<MobileModelRow>(
        initial ? `/api/admin/mobile-models/${initial._id}` : "/api/admin/mobile-models",
        {
          method: initial ? "PATCH" : "POST",
          body: {
            brandId,
            name,
            slug: slug.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
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
        label="Brand"
        htmlFor="model-brand"
        error={errors.brandId}
      >
        <Select
          id="model-brand"
          name="brandId"
          value={brandId}
          onChange={(event) => setBrandId(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(errors.brandId)}
        >
          <option value="" disabled>
            Select a brand…
          </option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
              {brand.status === "archived" ? " (archived)" : ""}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Name" htmlFor="model-name" error={errors.name}>
        <Input
          id="model-name"
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
        htmlFor="model-slug"
        hint="Leave blank to auto-generate from the name."
        error={errors.slug}
      >
        <Input
          id="model-slug"
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
        label="Image URL"
        htmlFor="model-image-url"
        hint="Optional image shown for this model."
        error={errors.imageUrl}
      >
        <Input
          id="model-image-url"
          name="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          disabled={submitting}
          placeholder="https://…"
          aria-invalid={Boolean(errors.imageUrl)}
        />
      </Field>
      <Field label="Status" htmlFor="model-status" error={errors.status}>
        <Select
          id="model-status"
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
          {initial ? "Save changes" : "Create model"}
        </Button>
      </div>
    </form>
  );
}