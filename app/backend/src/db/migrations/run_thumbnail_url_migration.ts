import { db } from '../index';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Running thumbnail_url migration...');
    
    // Read the SQL file
    const migrationFile = 'add_thumbnail_url.sql';
    const migrationPath = path.join(__dirname, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file ${migrationFile} not found`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    await db.execute(sql);
    
    console.log(`Migration ${migrationFile} completed successfully`);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
