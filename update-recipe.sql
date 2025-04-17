-- Update recipe with ID 1 to use the placeholder image
UPDATE recipes 
SET image_url = '/uploads/placeholder-food.svg', 
    thumbnail_path = '/uploads/placeholder-food.svg' 
WHERE id = 1;
