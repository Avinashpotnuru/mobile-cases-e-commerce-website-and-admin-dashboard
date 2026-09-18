import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          className="whitespace-nowrap font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          Mobile Cases
        </Link>
        <nav aria-label="Store navigation" className="flex items-center gap-1">
          <Link
            href="/products"
            className="whitespace-nowrap rounded-sm px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="whitespace-nowrap rounded-sm px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
          >
            Cart
          </Link>
          <Link
            href="/admin/dashboard"
            className="whitespace-nowrap rounded-sm px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
          >
            Admin
          </Link>
        </nav>
      </Container>
    </header>
  );
}