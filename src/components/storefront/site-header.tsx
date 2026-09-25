"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useCartCount } from "@/components/storefront/use-cart-count";
import { useWishlistCount } from "@/components/storefront/use-wishlist-count";
import { useCustomer } from "@/components/storefront/use-customer";
import { ThemeToggle } from "@/components/storefront/theme-toggle";
import { Container } from "@/components/ui/container";
import { cn } from "@/components/ui/cn";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/brands", label: "Brands" },
  { href: "/coupons", label: "Coupons" },
];

const MOBILE_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/brands", label: "Brands" },
  { href: "/coupons", label: "Coupons" },
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "My account" },
];

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const iconButton =
  "relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-9 sm:w-9";

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const customer = useCustomer();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ x: 0, w: 0, o: 0 });

  const activeHref = NAV_LINKS.find((link) =>
    pathname.startsWith(link.href),
  )?.href;

  const moveTo = useCallback((href: string) => {
    const nav = navRef.current;
    const link = linkRefs.current[href];
    if (!nav || !link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setIndicator({ x: linkRect.left - navRect.left, w: linkRect.width, o: 1 });
  }, []);

  const resetIndicator = useCallback(() => {
    if (activeHref) moveTo(activeHref);
    else setIndicator((current) => ({ ...current, o: 0 }));
  }, [activeHref, moveTo]);

  useLayoutEffect(() => {
    const sync = () => {
      if (activeHref) moveTo(activeHref);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [activeHref, moveTo]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 4 ? Math.min(Math.max(y / max, 0), 1) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="bg-[#0c0a09] text-stone-400">
        <Container className="flex h-9 items-center justify-center gap-2 text-[11px] font-medium tracking-wide">
          <span className="inline-flex items-center gap-1.5 text-amber-400">
            <span aria-hidden="true">&#10022;</span>
            Free shipping over &#8377;50
          </span>
          <span aria-hidden="true" className="text-white/20">
            &middot;
          </span>
          <span>30-day returns</span>
          <span aria-hidden="true" className="hidden text-white/20 sm:inline">
            &middot;
          </span>
          <span className="hidden sm:inline">Secure checkout</span>
        </Container>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border bg-background/90 shadow-[0_18px_36px_-28px_rgb(0_0_0/0.45)] backdrop-blur-xl"
            : "border-transparent bg-background/60",
        )}
      >
        <Container className="relative flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background transition-transform duration-500 group-hover:rotate-[8deg]">
              <span className="font-display text-sm font-semibold">M</span>
            </span>
            <span className="hidden font-display text-lg font-semibold tracking-tight text-foreground sm:block sm:text-xl">
              Mobile Cases
            </span>
          </Link>

          <nav
            aria-label="Store navigation"
            ref={navRef}
            onMouseLeave={resetIndicator}
            className="relative hidden items-center lg:flex"
          >
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(node) => {
                    linkRefs.current[link.href] = node;
                  }}
                  onMouseEnter={() => moveTo(link.href)}
                  onFocus={() => moveTo(link.href)}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <span
              aria-hidden="true"
              className="absolute bottom-0 h-0.5 rounded-full bg-accent transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${indicator.x}px)`,
                width: `${indicator.w}px`,
                opacity: indicator.o,
              }}
            />
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/products"
              aria-label="Search cases"
              className={iconButton}
            >
              <SearchIcon className="h-5 w-5" />
            </Link>

            <Link
              href={customer ? "/account" : "/account/signin"}
              aria-label={
                customer
                  ? `Account, signed in as ${customer.firstName} ${customer.lastName}`
                  : "Sign in"
              }
              className={iconButton}
            >
              <UserIcon className="h-5 w-5" />
            </Link>

            <div className="hidden sm:flex">
            <Link
              href="/saved"
              aria-label={
                wishlistCount > 0
                  ? `Saved cases, ${wishlistCount} items`
                  : "Saved cases"
              }
              className={iconButton}
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground tabular-nums">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              ) : null}
            </Link>
            </div>

            <Link
              href="/cart"
              aria-label={
                cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
              }
              className={iconButton}
            >
              <BagIcon className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-stone-950 tabular-nums">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

            <ThemeToggle />

            <Link
              href="/products"
              className="group ml-1 hidden items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:inline-flex"
            >
              Shop now
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(iconButton, "lg:hidden")}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300",
                    open ? "top-1.5 rotate-45" : "top-0.5",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current transition-all duration-300",
                    open ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300",
                    open ? "top-1.5 -rotate-45" : "top-[10px]",
                  )}
                />
              </span>
            </button>
          </div>

          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300"
            style={{ transform: `scaleX(${progress})` }}
          />
        </Container>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          id="mobile-menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[84%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              Menu
            </span>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className={iconButton}
            >
              <span className="relative block h-4 w-4">
                <span className="absolute top-1.5 left-0 block h-0.5 w-4 rotate-45 rounded-full bg-current" />
                <span className="absolute top-1.5 left-0 block h-0.5 w-4 -rotate-45 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="flex flex-col px-3 py-4">
            <Link
              href="/saved"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              style={{
                transitionDelay: open ? "0ms" : "0ms",
              }}
              className={cn(
                "group mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-3.5 font-display text-lg font-medium text-foreground transition-all duration-300 hover:bg-muted",
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
              )}
            >
              <span className="flex items-center gap-2.5">
                <HeartIcon className="h-5 w-5 text-accent" />
                Saved cases
                {wishlistCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground tabular-nums">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                ) : null}
              </span>
              <ArrowIcon className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
            </Link>

            {MOBILE_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                style={{
                  transitionDelay: open ? `${100 + index * 55}ms` : "0ms",
                }}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-3.5 font-display text-lg font-medium text-foreground transition-all duration-300 hover:bg-muted",
                  open
                    ? "translate-x-0 opacity-100"
                    : "translate-x-6 opacity-0",
                )}
              >
                {link.label}
                <ArrowIcon className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-border p-5">
            <span
              className={cn(
                "block text-xs font-medium tracking-wide text-muted-foreground transition-all duration-300",
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
              )}
              style={{ transitionDelay: open ? `${100 + MOBILE_LINKS.length * 55}ms` : "0ms" }}
            >
              Free shipping over &#8377;50 &middot; 30-day returns
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
