import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/reccollection";

// Create a postgres client
const client = postgres(connectionString);

// Create a drizzle client
const db = drizzle(client, { schema });

async function createTables() {
  try {
    console.log("Creating tables...");
    
    // Create notifications table
    console.log("Creating notifications table...");
    await client`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" varchar(50) NOT NULL,
        "sender_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "recipe_id" integer REFERENCES "recipes"("id") ON DELETE SET NULL,
        "message" text NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "data" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    // Create notification_preferences table
    console.log("Creating notification_preferences table...");
    await client`
      CREATE TABLE IF NOT EXISTS "notification_preferences" (
        "user_id" integer PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "email_notifications" boolean NOT NULL DEFAULT true,
        "push_notifications" boolean NOT NULL DEFAULT true,
        "sms_notifications" boolean NOT NULL DEFAULT false,
        "follow_notifications" boolean NOT NULL DEFAULT true,
        "like_notifications" boolean NOT NULL DEFAULT true,
        "comment_notifications" boolean NOT NULL DEFAULT true,
        "share_notifications" boolean NOT NULL DEFAULT true,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    // Create user_contacts table
    console.log("Creating user_contacts table...");
    await client`
      CREATE TABLE IF NOT EXISTS "user_contacts" (
        "user_id" integer PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "phone_number" varchar(20),
        "phone_verified" boolean NOT NULL DEFAULT false,
        "email_verified" boolean NOT NULL DEFAULT false,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    // Create shared_recipes table
    console.log("Creating shared_recipes table...");
    await client`
      CREATE TABLE IF NOT EXISTS "shared_recipes" (
        "id" serial PRIMARY KEY NOT NULL,
        "recipe_id" integer NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
        "shared_by" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shared_with" varchar(255) NOT NULL,
        "share_type" varchar(20) NOT NULL,
        "share_token" varchar(100),
        "message" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "expires_at" timestamp
      );
    `;
    
    // Create indexes
    console.log("Creating indexes...");
    await client`CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");`;
    await client`CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("read");`;
    await client`CREATE INDEX IF NOT EXISTS "shared_recipes_recipe_id_idx" ON "shared_recipes"("recipe_id");`;
    await client`CREATE INDEX IF NOT EXISTS "shared_recipes_shared_by_idx" ON "shared_recipes"("shared_by");`;
    await client`CREATE INDEX IF NOT EXISTS "shared_recipes_share_token_idx" ON "shared_recipes"("share_token");`;
    
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

createTables();
