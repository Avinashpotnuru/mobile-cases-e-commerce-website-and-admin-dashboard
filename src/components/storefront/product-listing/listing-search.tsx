import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { buildListingUrl } from "@/components/storefront/product-listing/listing-url";

export function ListingSearch({
  q,
  base,
}: {
  q?: string;
  base: Record<string, string>;
}) {
  return (
    <form
      className="flex w-full max-w-md flex-col gap-2"
      action="/products"
      method="get"
      role="search"
    >
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.18em]",
          q ? "text-accent" : "text-muted-foreground",
        )}
      >
        Search the collection
      </span>
      {Object.entries(base)
        .filter(([key]) => key !== "q" && key !== "page")
        .map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <div className="flex items-center gap-2">
        <Input
          aria-label="Search cases by name"
          className="h-11"
          defaultValue={q ?? ""}
          name="q"
          placeholder="Try “silicone” or “leather”…"
          type="search"
        />
        <Button size="lg" type="submit">
          Search
        </Button>
        {q ? (
          <ButtonLink
            className="shrink-0"
            href={buildListingUrl(base, { q: null, page: null })}
            size="lg"
            variant="outline"
          >
            Clear
          </ButtonLink>
        ) : null}
      </div>
    </form>
  );
}