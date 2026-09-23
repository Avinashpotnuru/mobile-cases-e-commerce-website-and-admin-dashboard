import { requireAdminPage } from "@/lib/auth/admin";
import { CouponAdmin } from "@/components/admin/coupons/coupon-admin";

export default async function CouponsPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage promo codes your customers can redeem at checkout.
        </p>
      </header>
      <CouponAdmin />
    </div>
  );
}