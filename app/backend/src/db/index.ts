import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";

// Get the database connection string from environment variables
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5433/reccollection";

// Create a postgres client
const client = postgres(connectionString);

// Create a drizzle instance with the schema and relations
export const db = drizzle(client, { schema: { ...schema, ...relations } });

// Export the schema and relations for use in other files
export { schema, relations };
