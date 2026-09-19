import { ObjectId } from "mongodb";
import { getDb, getClient } from "../src/lib/database/index.ts";
import {
  BRAND_COLLECTION,
  MOBILE_MODEL_COLLECTION,
  PRODUCT_COLLECTION,
  INVENTORY_COLLECTION,
  ensureDatabaseIndexes,
  type Brand,
  type MobileModel,
  type Product,
  type Inventory,
} from "../src/lib/database/models/index.ts";

if (process.env.SEED_CONFIRM !== "1") {
  console.warn(
    "Seed aborted: set SEED_CONFIRM=1 to run the seed script. It wipes the four catalog collections before inserting sample data.",
  );
  process.exit(1);
}

type BrandSeed = Omit<Brand, "_id" | "createdAt" | "updatedAt">;
type ModelSeed = Omit<
  MobileModel,
  "_id" | "brandId" | "createdAt" | "updatedAt"
>;
type ProductSeed = Omit<
  Product,
  "_id" | "compatibleModelIds" | "createdAt" | "updatedAt"
> & { compatibleSlugs: string[] };
type InventorySeed = {
  quantity: number;
  lowStockThreshold: number;
};

const brandSeeds: BrandSeed[] = [
  {
    name: "Apple",
    slug: "apple",
    description: "iPhone cases built for Apple mobile devices.",
    logoUrl: "/images/brands/apple.svg",
    status: "active",
  },
  {
    name: "Samsung",
    slug: "samsung",
    description: "Cases engineered for Galaxy smartphones.",
    logoUrl: "/images/brands/samsung.svg",
    status: "active",
  },
  {
    name: "Google",
    slug: "google",
    description: "Housings designed for Pixel devices.",
    logoUrl: "/images/brands/google.svg",
    status: "active",
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    description: "Slim cases made for OnePlus handsets.",
    logoUrl: "/images/brands/oneplus.svg",
    status: "active",
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    description: "Protective covers for Xiaomi smartphones.",
    logoUrl: "/images/brands/xiaomi.svg",
    status: "active",
  },
];

const modelSeeds: Record<string, ModelSeed[]> = {
  apple: [
    {
      name: "iPhone 15",
      slug: "iphone-15",
      imageUrl: "/images/models/iphone-15.jpg",
      status: "active",
    },
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      imageUrl: "/images/models/iphone-15-pro.jpg",
      status: "active",
    },
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      imageUrl: "/images/models/iphone-15-pro-max.jpg",
      status: "active",
    },
    {
      name: "iPhone 14",
      slug: "iphone-14",
      imageUrl: "/images/models/iphone-14.jpg",
      status: "active",
    },
  ],
  samsung: [
    {
      name: "Galaxy S23",
      slug: "galaxy-s23",
      imageUrl: "/images/models/galaxy-s23.jpg",
      status: "active",
    },
    {
      name: "Galaxy S23 Ultra",
      slug: "galaxy-s23-ultra",
      imageUrl: "/images/models/galaxy-s23-ultra.jpg",
      status: "active",
    },
    {
      name: "Galaxy Z Flip 5",
      slug: "galaxy-z-flip-5",
      imageUrl: "/images/models/galaxy-z-flip-5.jpg",
      status: "active",
    },
  ],
  google: [
    {
      name: "Pixel 8",
      slug: "pixel-8",
      imageUrl: "/images/models/pixel-8.jpg",
      status: "active",
    },
    {
      name: "Pixel 8 Pro",
      slug: "pixel-8-pro",
      imageUrl: "/images/models/pixel-8-pro.jpg",
      status: "active",
    },
  ],
  oneplus: [
    {
      name: "OnePlus 11",
      slug: "oneplus-11",
      imageUrl: "/images/models/oneplus-11.jpg",
      status: "active",
    },
  ],
  xiaomi: [
    {
      name: "Xiaomi 13",
      slug: "xiaomi-13",
      imageUrl: "/images/models/xiaomi-13.jpg",
      status: "active",
    },
  ],
};

const productSeeds: ProductSeed[] = [
  {
    name: "Silicone Case — iPhone 15 & 15 Pro",
    slug: "silicone-case-iphone-15",
    description: "Soft-touch silicone protection with raised camera rim.",
    images: [],
    priceCents: 79900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["iphone-15", "iphone-15-pro"],
  },
  {
    name: "MagSafe Clear Case — iPhone 15 & 15 Pro",
    slug: "magsafe-clear-case-iphone-15",
    description: "Crystal-clear polycarbonate case with built-in magnets.",
    images: [],
    priceCents: 119900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["iphone-15", "iphone-15-pro"],
  },
  {
    name: "Leather Wallet Case — iPhone 15 Pro Max",
    slug: "leather-wallet-case-iphone-15-pro-max",
    description: "Genuine leather case with a magnetic card slot.",
    images: [],
    priceCents: 179900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["iphone-15-pro-max"],
  },
  {
    name: "Rugged Armor Case — iPhone 14",
    slug: "rugged-armor-case-iphone-14",
    description: "Military-grade drop protection with a textured grip.",
    images: [],
    priceCents: 109900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["iphone-14"],
  },
  {
    name: "Clear Case — Galaxy S23",
    slug: "clear-case-galaxy-s23",
    description: "Slim, anti-yellow clear shell for Galaxy S23.",
    images: [],
    priceCents: 79900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["galaxy-s23"],
  },
  {
    name: "Silicone Case — Galaxy S23 & S23 Ultra",
    slug: "silicone-case-galaxy-s23",
    description: "Flexible silicone cover compatible with S23 and S23 Ultra.",
    images: [],
    priceCents: 89900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["galaxy-s23-ultra"],
  },
  {
    name: "Hinge Armor Case — Galaxy Z Flip 5",
    slug: "hinge-armor-case-galaxy-z-flip-5",
    description: "Two-piece armor cover with reinforced hinge protection.",
    images: [],
    priceCents: 149900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["galaxy-z-flip-5"],
  },
  {
    name: "MagSafe Clear Case — Pixel 8",
    slug: "magsafe-clear-case-pixel-8",
    description: "Transparent case with magnetic alignment ring.",
    images: [],
    priceCents: 119900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["pixel-8"],
  },
  {
    name: "Slim Fit Case — Pixel 8 & 8 Pro",
    slug: "slim-fit-case-pixel-8",
    description: "Feather-light case that preserves the Pixel profile.",
    images: [],
    priceCents: 94900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["pixel-8", "pixel-8-pro"],
  },
  {
    name: "Rugged Case — OnePlus 11",
    slug: "rugged-case-oneplus-11",
    description: "Shock-absorbing layers with a matte carbon finish.",
    images: [],
    priceCents: 114900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["oneplus-11"],
  },
  {
    name: "Silicone Case — Xiaomi 13",
    slug: "silicone-case-xiaomi-13",
    description: "Everyday silicone protection in multiple finishes.",
    images: [],
    priceCents: 74900,
    currency: "INR",
    status: "active",
    compatibleSlugs: ["xiaomi-13"],
  },
];

const inventorySeeds: Record<string, InventorySeed> = {
  "silicone-case-iphone-15": { quantity: 42, lowStockThreshold: 10 },
  "magsafe-clear-case-iphone-15": { quantity: 28, lowStockThreshold: 10 },
  "leather-wallet-case-iphone-15-pro-max": { quantity: 7, lowStockThreshold: 10 },
  "rugged-armor-case-iphone-14": { quantity: 0, lowStockThreshold: 10 },
  "clear-case-galaxy-s23": { quantity: 35, lowStockThreshold: 8 },
  "silicone-case-galaxy-s23": { quantity: 24, lowStockThreshold: 8 },
  "hinge-armor-case-galaxy-z-flip-5": { quantity: 18, lowStockThreshold: 6 },
  "magsafe-clear-case-pixel-8": { quantity: 31, lowStockThreshold: 8 },
  "slim-fit-case-pixel-8": { quantity: 22, lowStockThreshold: 8 },
  "rugged-case-oneplus-11": { quantity: 15, lowStockThreshold: 6 },
  "silicone-case-xiaomi-13": { quantity: 26, lowStockThreshold: 8 },
};

async function run() {
  const db = await getDb();

  try {
    console.log("Ensuring database indexes...");
    await ensureDatabaseIndexes(db);

    const brands = db.collection<Brand>(BRAND_COLLECTION);
    const mobileModels = db.collection<MobileModel>(MOBILE_MODEL_COLLECTION);
    const products = db.collection<Product>(PRODUCT_COLLECTION);
    const inventory = db.collection<Inventory>(INVENTORY_COLLECTION);

    console.log(
      "Resetting collections: brands, mobile_models, products, inventory",
    );
    await brands.deleteMany({});
    await mobileModels.deleteMany({});
    await products.deleteMany({});
    await inventory.deleteMany({});

    const now = new Date();
    const brandIdBySlug = new Map<string, ObjectId>();

    const brandDocs = brandSeeds.map(
      (seed): Brand => ({
        ...seed,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      }),
    );
    await brands.insertMany(brandDocs);
    brandDocs.forEach((doc) => brandIdBySlug.set(doc.slug, doc._id));

    const modelIdBySlug = new Map<string, ObjectId>();
    let modelCount = 0;

    for (const [brandSlug, seeds] of Object.entries(modelSeeds)) {
      const brandId = brandIdBySlug.get(brandSlug);
      if (!brandId) {
        throw new Error(`Unknown brand slug for models: ${brandSlug}`);
      }

      const docs = seeds.map(
        (seed): MobileModel => ({
          ...seed,
          brandId,
          _id: new ObjectId(),
          createdAt: now,
          updatedAt: now,
        }),
      );
      await mobileModels.insertMany(docs);
      docs.forEach((doc) => modelIdBySlug.set(doc.slug, doc._id));
      modelCount += docs.length;
    }

    const productDocs = productSeeds.map((seed): Product => {
      const { compatibleSlugs, ...rest } = seed;
      const compatibleModelIds = compatibleSlugs.map((slug) => {
        const id = modelIdBySlug.get(slug);
        if (!id) {
          throw new Error(`Unknown model slug for product: ${slug}`);
        }
        return id;
      });

      return {
        ...rest,
        compatibleModelIds,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      };
    });
    await products.insertMany(productDocs);

    const inventoryDocs = productDocs.map((product): Inventory => {
      const seed = inventorySeeds[product.slug];
      if (!seed) {
        throw new Error(`Missing inventory seed for product: ${product.slug}`);
      }

      return {
        _id: new ObjectId(),
        productId: product._id,
        quantity: seed.quantity,
        lowStockThreshold: seed.lowStockThreshold,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
    });
    await inventory.insertMany(inventoryDocs);

    console.log(`Seeded brands: ${brandDocs.length}`);
    console.log(`Seeded mobile models: ${modelCount}`);
    console.log(`Seeded products: ${productDocs.length}`);
    console.log(`Seeded inventory: ${inventoryDocs.length}`);
    console.log(`Database: ${db.databaseName}`);
  } finally {
    const client = await getClient();
    await client.close();
  }
}

run().catch((error) => {
  console.error(
    "Seed failed:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});