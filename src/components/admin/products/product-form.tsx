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
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/admin/admin-icons";
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
    | "marketingPriceCents"
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
  const [marketingPriceInput, setMarketingPriceInput] = useState(
    initial?.marketingPriceCents !== undefined
      ? centsToInput(initial.marketingPriceCents)
      : "",
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

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function setCoverImage(index: number) {
    setImages((current) => {
      if (index <= 0 || index >= current.length) {
        return current;
      }
      const next = [...current];
      const [cover] = next.splice(index, 1);
      next.unshift(cover);
      return next;
    });
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
      next.priceCents = "Enter a price like 799 (up to two decimals).";
    }
    const finalCents = cents ?? 0;
    const marketingCents =
      marketingPriceInput.trim() === ""
        ? undefined
        : parsePrice(marketingPriceInput);
if (marketingPriceInput.trim() !== "" && marketingCents === null) {
      next.marketingPriceCents =
        "Enter a compare-at price like 999 (up to two decimals).";
    }
    if (
      marketingCents !== undefined &&
      marketingCents !== null &&
      marketingCents <= finalCents
    ) {
      next.marketingPriceCents =
        "Compare-at price must be higher than the sale price.";
    }

    if (!isEdit && compatibleIds.length === 0) {
      next.compatibleModelIds =
        "Select at least one compatible mobile model.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

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
            marketingPriceCents: marketingCents ?? null,
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
              ₹
            </span>
            <Input
              id="product-price"
              name="price"
              inputMode="decimal"
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              disabled={submitting}
              className="pl-8"
              placeholder="799"
              aria-invalid={Boolean(errors.priceCents)}
            />
          </div>
        </Field>
        <Field
          label="Compare-at price"
          htmlFor="product-compare-price"
          hint="Optional. Shown as strikethrough for sale pricing."
          error={errors.marketingPriceCents}
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              ₹
            </span>
            <Input
              id="product-compare-price"
              name="comparePrice"
              inputMode="decimal"
              value={marketingPriceInput}
              onChange={(event) => setMarketingPriceInput(event.target.value)}
              disabled={submitting}
              className="pl-8"
              placeholder="999"
              aria-invalid={Boolean(errors.marketingPriceCents)}
            />
          </div>
        </Field>
      </div>
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

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Product images
        </legend>
        <p className="text-xs text-muted-foreground">
          The first image is the cover shown on product cards. Use the arrows to
          reorder.
        </p>
        {images.map((url, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
              >
                {index + 1}
              </span>
              {index === 0 ? (
                <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  Cover
                </span>
              ) : null}
              <Input
                type="url"
                value={url}
                onChange={(event) => setImage(index, event.target.value)}
                disabled={submitting}
                placeholder={`Image URL ${index + 1} (https://…)`}
                aria-label={`Image URL ${index + 1}`}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              {index === 0 ? (
                <span className="text-[11px] text-muted-foreground">
                  Shown first everywhere.
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  onClick={() => setCoverImage(index)}
                >
                  Set as cover
                </Button>
              )}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  disabled={submitting || index === 0}
                  onClick={() => moveImage(index, -1)}
                  aria-label={`Move image ${index + 1} up`}
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  disabled={submitting || index === images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  aria-label={`Move image ${index + 1} down`}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => removeImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                >
                  Remove
                </Button>
              </div>
            </div>
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