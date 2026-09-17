import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/auth/admin";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await readAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
            Mobile Cases
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Restricted area. Authorized personnel only.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}