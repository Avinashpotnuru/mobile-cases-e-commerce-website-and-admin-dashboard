import { ButtonLink } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="font-display text-4xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <ButtonLink href="/" variant="outline" size="lg">
        Back to home
      </ButtonLink>
    </div>
  );
}