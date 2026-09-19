import { cookies } from "next/headers";
import { SiteHeader } from "@/components/storefront/site-header";
import { CART_COOKIE, parseCartCookie } from "@/lib/storefront/cart";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cartCount = parseCartCookie(cookieStore.get(CART_COOKIE)?.value).reduce(
    (total, line) => total + line.quantity,
    0,
  );

  return (
    <>
      <SiteHeader cartCount={cartCount} />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}