import { ButtonLink } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The admin page you are looking for does not exist.
        </p>
      </div>
      <ButtonLink href="/admin/dashboard" variant="outline">
        Back to dashboard
      </ButtonLink>
    </div>
  );
}