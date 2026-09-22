import {
  getProductRating,
  listProductReviews,
} from "@/lib/services/review-service";
import { ReviewForm } from "@/components/storefront/product-detail/review-form";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span aria-hidden="true" className="relative inline-flex leading-none text-amber-500">
      {"\u2605".repeat(filled)}
      <span className="absolute inset-x-0 top-0 text-border">
        {"\u2605".repeat(Math.max(0, 5 - filled))}
      </span>
    </span>
  );
}

export async function ReviewsSection({
  productId,
}: {
  productId: string;
}) {
  const [rating, reviews] = await Promise.all([
    getProductRating(productId),
    listProductReviews(productId),
  ]);

  return (
    <section
      aria-labelledby="reviews-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Reviews
          </p>
          <h2
            id="reviews-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            What customers think
          </h2>
          {rating.count > 0 && rating.average !== null ? (
            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-5xl font-semibold leading-none text-foreground">
                {rating.average.toFixed(1)}
              </span>
              <span className="pb-1">
                <Stars rating={rating.average} />
                <span className="mt-1 block text-sm text-muted-foreground">
                  Based on {rating.count.toLocaleString()}{" "}
                  {rating.count === 1 ? "review" : "reviews"}
                </span>
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience.
            </p>
          )}

          {reviews.length > 0 ? (
            <ul className="mt-8 space-y-5">
              {reviews.map((review) => (
                <li key={review.id} className="border-l-2 border-amber-500/40 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {review.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(new Date(review.createdAt))}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Stars rating={review.rating} />
                  </div>
                  {review.title ? (
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      {review.title}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <ReviewForm productId={productId} />
        </div>
      </div>
    </section>
  );
}