"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCardView } from "@/components/storefront/product-listing/product-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useCustomer } from "@/components/storefront/use-customer";
import { readWishlist, WISHLIST_CHANGE_EVENT } from "@/lib/storefront/wishlist";

type SavedProduct = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image?: string | null;
};

export function SavedCasesView() {
  const customer = useCustomer();
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<SavedProduct[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sync = () => setIds(readWishlist());
    const id = window.setTimeout(sync, 0);
    window.addEventListener(WISHLIST_CHANGE_EVENT, sync);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(WISHLIST_CHANGE_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/products?ids=${encodeURIComponent(ids.join(","))}`)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        setError(false);
        setProducts(
          Array.isArray(payload?.data?.items)
            ? (payload.data.items as SavedProduct[])
            : [],
        );
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Your picks
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Saved cases
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {ids.length > 0
            ? `You have ${ids.length} ${ids.length === 1 ? "case" : "cases"} saved on this device.`
            : "Keep the cases you love here, ready when you are."}
        </p>

        {!customer ? (
          <p className="mt-6 inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
            Saved cases are stored on this device.{" "}
            <Link
              href="/account/signin"
              className="font-medium text-accent transition-colors hover:text-accent/80"
            >
              Sign in
            </Link>{" "}
            to keep them synced with your account.
          </p>
        ) : null}

        <div className="mt-10">
          {error ? (
            <ErrorState
              title="Unable to load your saved cases"
              description="Please try again shortly."
              action={
                <ButtonLink href="/products" variant="outline">
                  Browse cases
                </ButtonLink>
              }
            />
          ) : ids.length > 0 && products === null ? (
            <LoadingState label="Loading your saved cases…" />
          ) : products?.length === 0 ? (
            <EmptyState
              title="Nothing saved yet"
              description="Tap the heart on any case to save it here for later."
              action={
                <ButtonLink href="/products" variant="primary">
                  Browse cases
                </ButtonLink>
              }
            />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products?.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCardView
                    productId={product.id}
                    slug={product.slug}
                    name={product.name}
                    priceCents={product.priceCents}
                    currency={product.currency}
                    image={product.image}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}