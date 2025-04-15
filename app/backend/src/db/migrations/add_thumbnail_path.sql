-- Add thumbnailPath column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(255);
