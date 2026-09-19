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

const mongoUri: string = uri;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let prodClientPromise: Promise<MongoClient> | null = null;

function clientOrConnect(): Promise<MongoClient> {
  const cached =
    process.env.NODE_ENV === "development"
      ? globalThis._mongoClientPromise
      : prodClientPromise;

  if (cached) {
    return cached;
  }

  const promise = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 15000 })
    .connect()
    .catch((cause: unknown) => {
      // Self-heal: clear the cached (now-rejected) promise so the next
      // request establishes a fresh connection instead of failing forever.
      if (process.env.NODE_ENV === "development") {
        globalThis._mongoClientPromise = undefined;
      } else {
        prodClientPromise = null;
      }
      console.error(
        "[database] Mongo connection failed; the next request will retry.",
        cause instanceof Error ? cause.message : cause,
      );
      throw cause;
    });

  if (process.env.NODE_ENV === "development") {
    globalThis._mongoClientPromise = promise;
  } else {
    prodClientPromise = promise;
  }
  return promise;
}

export async function getClient(): Promise<MongoClient> {
  return clientOrConnect();
}

export async function getDb(): Promise<Db> {
  return (await clientOrConnect()).db(dbName);
}

export async function verifyDatabaseConnection(): Promise<{ ok: true; database: string }> {
  const client = await clientOrConnect();
  await client.db(dbName).command({ ping: 1 });
  return { ok: true, database: dbName };
}