import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, listProducts } from "@/lib/services/product-service";
import { NotFoundError } from "@/lib/services/errors";
import { ProductContent } from "@/components/storefront/product-detail/product-content";
import { ReviewsSection } from "@/components/storefront/product-detail/reviews";

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const firstPage = await listProducts({ page: 1, pageSize: 1000 });
  return firstPage.items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobilecases.example.com";
    const url = new URL(`/products/${slug}`, baseUrl).toString();
    const image = product.images?.[0];
    return {
      title: product.name,
      description: product.description || `${product.name} — precision-fit mobile case`,
      alternates: { canonical: url },
      openGraph: {
        title: product.name,
        description: product.description || undefined,
        url,
        siteName: "Mobile Cases",
        type: "website",
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description || undefined,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: "Case" };
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product;
  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  return (
    <div className="divide-y divide-border">
      <ProductContent productId={product._id.toHexString()} />
      <ReviewsSection productId={product._id.toHexString()} />
    </div>
  );
}