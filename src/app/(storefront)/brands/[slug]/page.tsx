import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/services/brand-service";
import { NotFoundError } from "@/lib/services/errors";
import { LoadingState } from "@/components/ui/states";
import { BrandShowcase } from "@/components/storefront/brand-selection/brand-showcase";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const brand = await getBrand(slug);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobilecases.example.com";
    const url = new URL(`/brands/${brand.slug}`, baseUrl).toString();
    return {
      title: `${brand.name} cases`,
      description:
        brand.description ||
        `Precision-fit mobile cases for every ${brand.name} device.`,
      alternates: { canonical: url },
      openGraph: {
        title: `${brand.name} cases`,
        description:
          brand.description ||
          `Precision-fit mobile cases for every ${brand.name} device.`,
        url,
        siteName: "Mobile Cases",
        type: "website",
      },
    };
  } catch {
    return { title: "Brand" };
  }
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    await getBrand(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <>
      <Suspense
        fallback={
          <LoadingState
            label="Loading brand…"
            className="min-h-96 bg-background"
          />
        }
      >
        <BrandShowcase slug={slug} />
      </Suspense>
    </>
  );
}