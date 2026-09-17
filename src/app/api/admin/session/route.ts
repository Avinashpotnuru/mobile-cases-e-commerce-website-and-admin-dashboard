import { handleApiError, ok } from "@/lib/api";
import { readAdminSession } from "@/lib/auth/admin";
import { UnauthorizedError } from "@/lib/services/errors";

export async function GET() {
  try {
    const session = await readAdminSession();
    if (!session) {
      throw new UnauthorizedError();
    }
    return ok({ admin: { subject: session.subject } });
  } catch (error) {
    return handleApiError(error);
  }
}