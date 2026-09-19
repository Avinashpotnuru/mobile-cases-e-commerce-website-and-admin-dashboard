import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { buildListingUrl } from "@/components/storefront/product-listing/listing-url";

const captionClasses =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export function ListingSearch({
  q,
  base,
}: {
  q?: string;
  base: Record<string, string>;
}) {
  return (
    <form
      className="flex flex-col gap-2.5"
      action="/products"
      method="get"
      role="search"
    >
      <span className={cn(captionClasses, q && "text-accent")}>Search</span>
      {Object.entries(base)
        .filter(([key]) => key !== "q" && key !== "page")
        .map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <Input
        aria-label="Search cases by name"
        className="h-10"
        defaultValue={q ?? ""}
        name="q"
        placeholder="Search cases…"
        type="search"
      />
      <div className="flex gap-2">
        <Button className="flex-1" size="md" type="submit">
          Search
        </Button>
        {q ? (
          <ButtonLink
            href={buildListingUrl(base, { q: null, page: null })}
            size="md"
            variant="outline"
          >
            Clear
          </ButtonLink>
        ) : null}
      </div>
    </form>
  );
}
