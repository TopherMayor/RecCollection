-- Add thumbnailUrl column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255);
