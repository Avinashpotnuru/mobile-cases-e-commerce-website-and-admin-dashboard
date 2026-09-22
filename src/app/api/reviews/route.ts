import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import { requireCustomer } from "@/lib/auth/customer";
import { createReview } from "@/lib/services/review-service";

export async function POST(request: Request) {
  try {
    const customer = await requireCustomer();
    const body = (await parseJsonBody(request)) as Record<string, unknown> | null;
    const productId = typeof body?.productId === "string" ? body.productId : "";
    const review = await createReview(customer, productId, {
      rating: body?.rating,
      title: body?.title,
      comment: body?.comment,
    });
    return ok({ review });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}