import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5433/reccollection";

// Create a postgres client
const client = postgres(connectionString);

async function addNewPostNotificationsColumn() {
  try {
    console.log("Adding new_post_notifications column to notification_preferences table...");
    
    // Add the new column with a default value of true
    await client`
      ALTER TABLE "notification_preferences" 
      ADD COLUMN IF NOT EXISTS "new_post_notifications" boolean NOT NULL DEFAULT true;
    `;
    
    console.log("Column added successfully!");
  } catch (error) {
    console.error("Error adding column:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the migration
addNewPostNotificationsColumn();
