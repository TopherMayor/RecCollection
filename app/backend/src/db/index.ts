import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get the database connection string from environment variables
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/reccollection';

// Create a postgres client
const client = postgres(connectionString);

// Create a drizzle instance with the schema
export const db = drizzle(client, { schema });

// Export the schema for use in other files
export { schema };
