import { db } from '../index';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Read all SQL files in the migrations directory
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL
      await db.execute(sql);
      
      console.log(`Migration ${file} completed successfully`);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigrations();
