import { ButtonLink } from "@/components/ui/button";

export function OrderActions() {
  return (
    <aside className="rounded-2xl border border-border bg-background p-6">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Questions about your order? We&apos;re happy to help.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <ButtonLink href="/products" size="lg" className="btn-sheen w-full">
          Continue shopping
        </ButtonLink>
        <ButtonLink href="/brands" variant="outline" size="lg" className="w-full">
          Browse cases by phone
        </ButtonLink>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Keep this link — it&apos;s your only way to view this order. It won&apos;t
        appear in search results.
      </p>
    </aside>
  );
}