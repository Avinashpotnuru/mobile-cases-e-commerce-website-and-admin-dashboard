"use client";

import { useState, type FormEvent } from "react";
import { AdminApiError, apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ProductCompatibilityEditor,
  ProductCompatibilityField,
} from "@/components/admin/products/product-compatibility";
import type {
  BrandRow,
  MobileModelRow,
  ProductRow,
  ProductStatus,
} from "@/types/catalog";

type FieldErrors = Partial<
  Record<
    | "name"
    | "slug"
    | "description"
    | "images"
    | "priceCents"
    | "status"
    | "compatibleModelIds",
    string
  >
>;

const MAX_IMAGES = 10;

function centsToInput(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const dollars = Number(trimmed);
  if (!Number.isFinite(dollars)) {
    return null;
  }
  return Math.round(dollars * 100);
}

export function ProductForm({
  mode,
  initial,
  brands,
  models,
  onSaved,
  onClose,
}: {
  mode: "create" | "edit";
  initial?: ProductRow;
  brands: BrandRow[];
  models: MobileModelRow[];
  onSaved: () => void;
  onClose: () => void;
}) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceInput, setPriceInput] = useState(
    initial ? centsToInput(initial.priceCents) : "",
  );
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "active");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [compatibleIds, setCompatibleIds] = useState<string[]>(
    initial?.compatibleModelIds ?? [],
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setImage(index: number, value: string) {
    setImages((current) =>
      current.map((url, i) => (i === index ? value : url)),
    );
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_: string, i: number) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const next: FieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      next.name = "Name is required.";
    }
    const cleanedImages = images.map((url) => url.trim()).filter(Boolean);
    if (cleanedImages.length === 0) {
      next.images = "Add at least one image URL.";
    } else if (cleanedImages.some((url) => url.length > 500)) {
      next.images = "Every image URL must be 500 characters or fewer.";
    }
    const cents = priceInput.trim() === "" ? 0 : parsePrice(priceInput);
    if (priceInput.trim() !== "" && cents === null) {
      next.priceCents = "Enter a price like 19.99 (up to two decimals).";
    }
    if (!isEdit && compatibleIds.length === 0) {
      next.compatibleModelIds =
        "Select at least one compatible mobile model.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    const finalCents = cents ?? 0;

    setSubmitting(true);
    try {
      await apiRequest<ProductRow>(
        isEdit && initial
          ? `/api/admin/products/${initial._id}`
          : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          body: {
            name: trimmedName,
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            priceCents: finalCents,
            status,
            images: cleanedImages,
            ...(isEdit
              ? {}
              : { compatibleModelIds: compatibleIds }),
          },
        },
      );
      onSaved();
      onClose();
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.fieldErrors) {
        setErrors(cause.fieldErrors as FieldErrors);
      } else if (cause instanceof AdminApiError) {
        setFormError(cause.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel = isEdit ? "Save changes" : "Create product";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Name" htmlFor="product-name" error={errors.name}>
        <Input
          id="product-name"
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
        htmlFor="product-slug"
        hint="Leave blank to auto-generate from the name."
        error={errors.slug}
      >
        <Input
          id="product-slug"
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
        htmlFor="product-description"
        error={errors.description}
      >
        <Textarea
          id="product-description"
          name="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(errors.description)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Price"
          htmlFor="product-price"
          error={errors.priceCents}
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              $
            </span>
            <Input
              id="product-price"
              name="price"
              inputMode="decimal"
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              disabled={submitting}
              className="pl-7"
              placeholder="0.00"
              aria-invalid={Boolean(errors.priceCents)}
            />
          </div>
        </Field>
        <Field label="Status" htmlFor="product-status" error={errors.status}>
          <Select
            id="product-status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus)}
            disabled={submitting}
            aria-invalid={Boolean(errors.status)}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">
          Product images
        </legend>
        {images.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={(event) => setImage(index, event.target.value)}
              disabled={submitting}
              placeholder={`Image URL ${index + 1} (https://…)`}
              aria-label={`Image URL ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={submitting}
              onClick={() => removeImage(index)}
              aria-label={`Remove image ${index + 1}`}
            >
              Remove
            </Button>
          </div>
        ))}
        {images.length < MAX_IMAGES ? (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setImages((current) => [...current, ""])}
            >
              Add image
            </Button>
          </div>
        ) : null}
        {errors.images ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.images}
          </p>
        ) : null}
      </fieldset>

      <div className="border-t border-border pt-4">
        {isEdit && initial ? (
          <ProductCompatibilityEditor
            product={initial}
            brands={brands}
            models={models}
            onChanged={onSaved}
          />
        ) : (
          <ProductCompatibilityField
            brands={brands}
            models={models}
            selected={compatibleIds}
            onChange={setCompatibleIds}
            error={errors.compatibleModelIds}
          />
        )}
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <div className="mt-2 flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}