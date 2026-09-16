import Link from "next/link";
import { Container } from "@/components/ui/container";

const shopLinks = [
  { href: "/products", label: "All cases" },
  { href: "/brands", label: "Brands" },
  { href: "/cart", label: "Cart" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="bg-[#0c0a09] text-stone-400"
    >
      <Container className="py-16">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Link
              href="/"
              className="font-display text-3xl font-semibold tracking-tight text-stone-50"
            >
              Mobile Cases
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Premium cases for the devices you live with. Crafted with care,
              delivered worldwide.
            </p>
          </div>

          <nav aria-label="Footer shop links">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-50">
              Shop
            </h2>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-50">
              Support
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>Free shipping over $40</li>
              <li>30-day returns</li>
              <li>
                <a
                  href="mailto:support@mobilecases.example"
                  className="transition-colors hover:text-amber-400"
                >
                  support@mobilecases.example
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-stone-500 sm:flex-row">
          <span>&copy; {year} Mobile Cases. All rights reserved.</span>
          <span>Premium cases, precision-made.</span>
        </div>
      </Container>
    </footer>
  );
}