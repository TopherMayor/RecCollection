import { db } from './index';
import { sql } from 'drizzle-orm';

async function addThumbnailPathColumn() {
  try {
    console.log('Adding thumbnail_path column to recipes table...');
    
    // Execute the SQL to add the column
    await db.execute(sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(255);`);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addThumbnailPathColumn();
