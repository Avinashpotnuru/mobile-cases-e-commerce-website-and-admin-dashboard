import { ButtonLink } from "@/components/ui/button";

export default function StorefrontNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="font-display text-4xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find that page. It may have been moved or never
        existed.
      </p>
      <ButtonLink href="/" variant="outline" size="lg">
        Back to home
      </ButtonLink>
    </div>
  );
}