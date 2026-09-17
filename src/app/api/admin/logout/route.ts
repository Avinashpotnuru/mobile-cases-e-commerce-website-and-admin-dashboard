import { handleApiError, ok } from "@/lib/api";
import { logoutAdmin } from "@/lib/auth/admin";

export async function POST() {
  try {
    await logoutAdmin();
    return ok({ signedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}