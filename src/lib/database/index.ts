import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "mobile-cases-ecommerce";

if (typeof window !== "undefined") {
  throw new Error("Database client must only be used on the server.");
}

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Configure it in .env.local.",
  );
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri).connect();
  }

  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function verifyDatabaseConnection(): Promise<{ ok: true; database: string }> {
  const client = await clientPromise;
  await client.db(dbName).command({ ping: 1 });
  return { ok: true, database: dbName };
}