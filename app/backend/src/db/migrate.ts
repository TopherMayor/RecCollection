import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

// Get the database connection string from environment variables
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/reccollection';

// For migrations, we need a separate connection
const migrationClient = postgres(connectionString, { max: 1 });

// Run migrations
async function main() {
  console.log('Running migrations...');
  
  try {
    const db = drizzle(migrationClient);
    
    // This will run all migrations in the migrations folder
    await migrate(db, { migrationsFolder: 'src/db/migrations' });
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
