import type { MetadataRoute } from "next";
import { listBrands } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { listProducts } from "@/lib/services/product-service";

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobilecases.example.com";

function route(slug: string): MetadataRoute.Sitemap[number] {
  return {
    url: new URL(slug, BASE_URL).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, models, products, staticPages] = await Promise.all([
    listBrands({ page: 1, pageSize: 1000 }),
    listMobileModels({ page: 1, pageSize: 1000 }),
    listProducts({ page: 1, pageSize: 1000 }),
    Promise.resolve([
      { slug: "brands", priority: 0.8 },
      { slug: "products", priority: 0.9 },
    ]),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: new URL("/", BASE_URL).toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  for (const page of staticPages) {
    entries.push({ ...route(page.slug), priority: page.priority });
  }
  for (const brand of brands.items) {
    entries.push({ ...route(`/brands/${brand.slug}`), priority: 0.8 });
  }
  for (const model of models.items) {
    entries.push({ ...route(`/models/${model.slug}`), priority: 0.8 });
  }
  for (const product of products.items) {
    entries.push({ ...route(`/products/${product.slug}`), priority: 0.7 });
  }

  return entries;
}
