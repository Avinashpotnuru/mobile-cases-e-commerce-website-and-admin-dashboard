import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/services/product-service";
import { NotFoundError } from "@/lib/services/errors";
import { ProductContent } from "@/components/storefront/product-detail/product-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: product.name,
      description: product.description || `${product.name} — precision-fit mobile case`,
      openGraph: {
        title: product.name,
        description: product.description || undefined,
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
  return <ProductContent productId={product._id.toHexString()} />;
}