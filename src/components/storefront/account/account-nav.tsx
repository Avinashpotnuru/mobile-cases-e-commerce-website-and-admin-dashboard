import Link from "next/link";

const links = [
  { href: "/account/orders", label: "Orders" },
  { href: "/saved", label: "Saved cases" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountNav() {
  return (
    <nav aria-label="Account navigation" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}