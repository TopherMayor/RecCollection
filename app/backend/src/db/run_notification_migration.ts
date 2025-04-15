import { db } from "../db";
import fs from "fs";
import path from "path";

async function runMigration() {
  try {
    console.log("Running notification migration...");
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), "src/db/migrations/add_notifications_and_sharing.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");
    
    // Execute the migration
    await db.execute(migrationSql);
    
    console.log("Notification migration completed successfully!");
  } catch (error) {
    console.error("Error running notification migration:", error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

runMigration();
