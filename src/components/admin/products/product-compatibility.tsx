"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  brandNameById,
  buildModelGroups,
  buildModelMap,
} from "@/components/admin/catalog-utils";
import { AdminUnauthorized, apiRequest } from "@/lib/api/client";
import type { BrandRow, MobileModelRow, ProductRow } from "@/types/catalog";

export function ProductCompatibilityField({
  brands,
  models,
  selected,
  onChange,
  error,
}: {
  brands: BrandRow[];
  models: MobileModelRow[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}) {
  const groups = buildModelGroups(
    models.filter((model) => model.status === "active"),
    brands,
  );

  function toggle(modelId: string) {
    onChange(
      selected.includes(modelId)
        ? selected.filter((id) => id !== modelId)
        : [...selected, modelId],
    );
  }

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-sm font-medium text-foreground">
        Compatible mobile models
      </legend>
      <p className="text-sm text-muted-foreground">
        Select every device model this product fits. At least one is required.
      </p>
      <div className="mt-2 flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.brandId}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.brandName}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                {group.models.length}
              </span>
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {group.models.map((model) => {
                const checked = selected.includes(model._id);
                return (
                  <label
                    key={model._id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      checked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(model._id)}
                      className="size-4 accent-primary"
                    />
                    <span className="font-medium">{model.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function ProductCompatibilityEditor({
  product,
  brands,
  models,
  onChanged,
}: {
  product: ProductRow;
  brands: BrandRow[];
  models: MobileModelRow[];
  onChanged: () => void;
}) {
  const router = useRouter();
  const [ids, setIds] = useState<string[]>(product.compatibleModelIds);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState("");

  const modelMap = buildModelMap(models);
  const current = ids
    .map((id) => modelMap.get(id))
    .filter((model): model is MobileModelRow => Boolean(model));

  const availableGroups = buildModelGroups(
    models.filter(
      (model) => model.status === "active" && !ids.includes(model._id),
    ),
    brands,
  );

  function handleError(cause: unknown) {
    if (cause instanceof AdminUnauthorized) {
      router.push("/admin/login");
      return;
    }
    setError(
      cause instanceof Error ? cause.message : "Something went wrong.",
    );
  }

  async function addModel(modelId: string) {
    setError(null);
    setBusy("add");
    try {
      const updated = await apiRequest<ProductRow>(
        `/api/admin/products/${product._id}/compatibility`,
        {
          method: "POST",
          body: { mobileModelId: modelId },
        },
      );
      setIds(updated.compatibleModelIds);
      onChanged();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(null);
    }
  }

  async function removeModel(modelId: string) {
    setError(null);
    setBusy(modelId);
    try {
      const updated = await apiRequest<ProductRow>(
        `/api/admin/products/${product._id}/compatibility/${modelId}`,
        { method: "DELETE" },
      );
      setIds(updated.compatibleModelIds);
      onChanged();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">
          Compatible mobile models
        </p>
        <p className="text-sm text-muted-foreground">
          Manage the devices this product fits.
        </p>
      </div>

      {current.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No compatible models selected.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {current.map((model) => (
          <li
            key={model._id}
            className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/40 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{model.name}</p>
              <p className="text-xs text-muted-foreground">
                {brandNameById(brands, model.brandId)}
                {model.status !== "active" ? " · archived" : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => removeModel(model._id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Add a compatible mobile model</span>
          <Select
            value={pendingId}
            onChange={(event) => setPendingId(event.target.value)}
            disabled={busy !== null || availableGroups.length === 0}
            aria-label="Add a compatible mobile model"
          >
            <option value="">
              {availableGroups.length === 0
                ? "No more models to add…"
                : "Select a model to add…"}
            </option>
            {availableGroups.map((group) => (
              <optgroup key={group.brandId} label={group.brandName}>
                {group.models.map((model) => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </label>
        <Button
          type="button"
          className="shrink-0"
          disabled={busy !== null || !pendingId}
          loading={busy === "add"}
          onClick={() => {
            if (pendingId) {
              void addModel(pendingId);
              setPendingId("");
            }
          }}
        >
          Add
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}