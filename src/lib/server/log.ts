// Lightweight structured server logging. Intentionally dependency-free and
// minimal: it writes one JSON line per event so server logs stay greppable and
// parseable without adding monitoring tooling. Callers pass only safe,
// non-secret context - never passwords, tokens, payment secrets or customer
// data.

export type LogContext = {
  method?: string;
  url?: string;
  code?: string;
  message?: string;
  errorName?: string;
  stack?: string;
  [key: string]: unknown;
};

function write(level: "error" | "warn", message: string, context: LogContext) {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...context,
  });
  if (level === "error") {
    console.error(line);
  } else {
    console.warn(line);
  }
}

export function logError(message: string, context: LogContext = {}) {
  write("error", message, context);
}

export function logWarn(message: string, context: LogContext = {}) {
  write("warn", message, context);
}