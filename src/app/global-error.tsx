"use client";

// Root error boundary: catches failures from the root layout itself, so the
// page body (and CSS) survives an unexpected crash. Content stays generic -
// no error details are shown to users.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6">
        <div
          role="alert"
          className="flex max-w-sm flex-col items-center gap-3 text-center"
        >
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading this page. Please try
            again.
          </p>
          <button
            onClick={reset}
            className="mt-2 inline-flex h-10 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}