import { UnauthorizedError } from "@/lib/services/errors";

export async function requireAdmin(): Promise<void> {
  throw new UnauthorizedError();
}