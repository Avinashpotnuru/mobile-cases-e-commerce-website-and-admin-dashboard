"use client";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProductForm } from "@/components/admin/products/product-form";
import type { BrandRow, MobileModelRow, ProductRow } from "@/types/catalog";

export function AddProductDialog({
  open,
  onClose,
  onSaved,
  brands,
  models,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  brands: BrandRow[];
  models: MobileModelRow[];
}) {
  return (
    <AdminDialog open={open} onClose={onClose} title="Add product">
      <ProductForm
        mode="create"
        brands={brands}
        models={models}
        onSaved={onSaved}
        onClose={onClose}
      />
    </AdminDialog>
  );
}

export function EditProductDialog({
  product,
  onClose,
  onSaved,
  brands,
  models,
}: {
  product: ProductRow | null;
  onClose: () => void;
  onSaved: () => void;
  brands: BrandRow[];
  models: MobileModelRow[];
}) {
  return (
    <AdminDialog
      open={Boolean(product)}
      onClose={onClose}
      title={`Edit ${product?.name ?? "product"}`}
    >
      {product ? (
        <ProductForm
          key={product._id}
          mode="edit"
          initial={product}
          brands={brands}
          models={models}
          onSaved={onSaved}
          onClose={onClose}
        />
      ) : null}
    </AdminDialog>
  );
}

export function ArchiveProductDialog({
  product,
  onClose,
  onConfirm,
}: {
  product: ProductRow | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ConfirmDialog
      open={Boolean(product)}
      title="Archive product?"
      description={`"${product?.name ?? ""}" will be archived and hidden from the storefront. You can restore it later from the edit form.`}
      confirmLabel="Archive product"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}