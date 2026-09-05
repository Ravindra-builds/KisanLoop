import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { mockDb } from "./mock-storage";

const connectionString = process.env.DATABASE_URL;
export const isDemoMode = process.env.DEMO_MODE === "true" || !connectionString;

let realDb: ReturnType<typeof drizzle> | null = null;

if (!isDemoMode && connectionString) {
  try {
    const client = postgres(connectionString, { prepare: false });
    realDb = drizzle(client, { schema });
  } catch (err) {
    console.warn("Failed to initialize real PostgreSQL connection, falling back to mockDb:", err);
  }
}

export const db = realDb;
export { schema, mockDb };
