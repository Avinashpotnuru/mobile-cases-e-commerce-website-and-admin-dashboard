import { readAdminSession } from "@/lib/auth/admin";
import { ButtonLink } from "@/components/ui/button";
import { SignOutButton } from "@/components/admin/sign-out-button";

export async function AdminHeader() {
  const session = await readAdminSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
        <p className="truncate font-display text-lg font-semibold">
          Admin Console
        </p>
      </div>
      {session ? (
        <div className="flex items-center gap-2">
          <ButtonLink href="/" variant="ghost" size="sm">
            View store
          </ButtonLink>
          <SignOutButton />
        </div>
      ) : null}
    </header>
  );
}