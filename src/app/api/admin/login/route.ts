import { cookies } from "next/headers";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import {
  ADMIN_SESSION_COOKIE_OPTIONS,
  configuredAdminUsername,
  loginAdmin,
} from "@/lib/auth/admin";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as Record<
      string,
      unknown
    > | null;
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const result = await loginAdmin(username, password);
    const store = await cookies();
    store.set(ADMIN_SESSION_COOKIE, result.token, ADMIN_SESSION_COOKIE_OPTIONS);

    return ok({ admin: { username: configuredAdminUsername() } });
  } catch (error) {
    return handleApiError(error);
  }
}