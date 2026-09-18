"use client";

import { Select } from "@/components/ui/select";
import { buildModelGroups } from "@/components/admin/catalog-utils";
import type { BrandRow, MobileModelRow } from "@/types/catalog";

export function InventoryFilters({
  status,
  onStatusChange,
  mobileModelId,
  onMobileModelChange,
  models,
  brands,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  mobileModelId: string;
  onMobileModelChange: (value: string) => void;
  models: MobileModelRow[];
  brands: BrandRow[];
}) {
  const groups = buildModelGroups(models, brands);

  return (
    <>
      <Select
        aria-label="Filter by inventory status"
        className="w-auto"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </Select>
      <Select
        aria-label="Filter by compatible mobile model"
        className="w-auto"
        value={mobileModelId}
        onChange={(event) => onMobileModelChange(event.target.value)}
      >
        <option value="">All models</option>
        {groups.map((group) => (
          <optgroup key={group.brandId} label={group.brandName}>
            {group.models.map((model) => (
              <option key={model._id} value={model._id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </>
  );
}