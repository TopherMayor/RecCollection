import fs from "fs";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { HTTPException } from "hono/http-exception";

// Default thumbnail path to use when download fails
export const DEFAULT_THUMBNAIL = "/uploads/default-recipe-thumbnail.jpg";
export const FOOD_THUMBNAIL = "/uploads/default-food-thumbnail.jpg";

// Define the upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure the upload directory exists and has correct permissions
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o755 });
    console.log(`Created uploads directory at ${UPLOAD_DIR}`);
  } catch (error) {
    console.error(`Failed to create uploads directory: ${error}`);
  }
} else {
  // Ensure directory has correct permissions
  try {
    fs.chmodSync(UPLOAD_DIR, 0o755);
    console.log(
      `Ensured correct permissions for uploads directory at ${UPLOAD_DIR}`
    );
  } catch (error) {
    console.error(`Failed to set permissions on uploads directory: ${error}`);
  }
}

// Create default thumbnails if they don't exist
const defaultThumbnailPath = path.join(
  UPLOAD_DIR,
  "default-recipe-thumbnail.jpg"
);
const foodThumbnailPath = path.join(UPLOAD_DIR, "default-food-thumbnail.jpg");

// Check and create default recipe thumbnail
if (!fs.existsSync(defaultThumbnailPath)) {
  try {
    // Copy a default image from assets or create a simple one
    // For now, we'll just log that it's missing
    console.log(
      `Default thumbnail not found at ${defaultThumbnailPath}. Will create one when needed.`
    );
  } catch (error) {
    console.error(`Failed to create default thumbnail: ${error}`);
  }
}

// Check and create default food thumbnail
if (!fs.existsSync(foodThumbnailPath)) {
  try {
    // Create a default food image
    console.log(
      `Default food thumbnail not found at ${foodThumbnailPath}. Will create one when needed.`
    );
  } catch (error) {
    console.error(`Failed to create default food thumbnail: ${error}`);
  }
}

/**
 * Download an image from a URL and save it to the local filesystem
 * @param imageUrl URL of the image to download
 * @returns Local path to the saved image
 */
export async function downloadImage(imageUrl: string): Promise<string> {
  console.log(`Attempting to download image from: ${imageUrl}`);
  try {
    // Generate a unique filename
    const fileExtension = path.extname(new URL(imageUrl).pathname) || ".jpg";
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    console.log(`Generated filename: ${filename}, saving to: ${filePath}`);

    // Download the image
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
      timeout: 15000, // 15 seconds timeout (increased from 10)
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Check if response is valid
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.startsWith("image/")) {
      console.warn(
        `Downloaded content is not an image. Content-Type: ${contentType}`
      );
      return createDefaultThumbnail();
    }

    // Save the image to disk
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        // Return the relative path that can be used in URLs
        const relativePath = `/uploads/${filename}`;
        console.log(
          `Successfully downloaded and saved image to: ${relativePath}`
        );
        resolve(relativePath);
      });
      writer.on("error", (err) => {
        console.error(`Error writing image to disk: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    console.error(
      "Error downloading image:",
      error instanceof Error ? error.message : String(error)
    );
    // Instead of throwing an exception, return the default thumbnail
    return createDefaultThumbnail();
  }
}

/**
 * Check if an image URL is valid
 * @param imageUrl URL to check
 * @returns Boolean indicating if the URL is valid
 */
export async function isValidImageUrl(imageUrl: string): Promise<boolean> {
  console.log(`Validating image URL: ${imageUrl}`);
  try {
    const response = await axios.head(imageUrl, {
      timeout: 8000, // Increased timeout from 5000ms to 8000ms
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Check if the response is an image
    const contentType = response.headers["content-type"];
    const isValid = contentType && contentType.startsWith("image/");
    console.log(
      `Image URL validation result: ${
        isValid ? "Valid" : "Invalid"
      } (Content-Type: ${contentType})`
    );
    return isValid;
  } catch (error) {
    console.warn(
      `Failed to validate image URL: ${imageUrl}`,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Create or return the path to a default thumbnail
 * @returns Path to the default thumbnail
 */
export async function createDefaultThumbnail(): Promise<string> {
  console.log("Using default thumbnail as fallback");
  const defaultPath = DEFAULT_THUMBNAIL;

  // Check if the default thumbnail exists, if not create a simple one
  const absolutePath = path.join(process.cwd(), defaultPath.substring(1));

  if (!fs.existsSync(absolutePath)) {
    try {
      // Create a very simple default image
      // In a real implementation, you would copy a pre-made default image
      // For now, we'll just ensure the file exists
      fs.writeFileSync(absolutePath, "Default thumbnail placeholder");
      console.log(`Created default thumbnail at ${absolutePath}`);
    } catch (error) {
      console.error(
        `Failed to create default thumbnail: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return defaultPath;
}

/**
 * Create or return the path to a default food thumbnail
 * @returns Path to the default food thumbnail
 */
export async function createDefaultFoodThumbnail(): Promise<string> {
  console.log("Using default food thumbnail as fallback");
  const defaultPath = FOOD_THUMBNAIL;

  // Check if the default food thumbnail exists, if not create a simple one
  const absolutePath = path.join(process.cwd(), defaultPath.substring(1));

  if (!fs.existsSync(absolutePath)) {
    try {
      // Create a very simple default food image
      // In a real implementation, you would copy a pre-made default food image
      fs.writeFileSync(absolutePath, "Default food thumbnail placeholder");
      console.log(`Created default food thumbnail at ${absolutePath}`);
    } catch (error) {
      console.error(
        `Failed to create default food thumbnail: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return defaultPath;
}

/**
 * Check if an image is likely to be a food image based on its URL
 * This is a simple heuristic that checks if the URL or filename contains food-related keywords
 * @param imageUrl URL of the image to check
 * @returns Boolean indicating if the image is likely to be a food image
 */
export function isFoodImage(imageUrl: string): boolean {
  // Convert URL to lowercase for case-insensitive matching
  const url = imageUrl.toLowerCase();

  // List of food-related keywords to check for in the URL
  const foodKeywords = [
    "food",
    "recipe",
    "meal",
    "dish",
    "cuisine",
    "cooking",
    "baking",
    "dinner",
    "lunch",
    "breakfast",
    "dessert",
    "appetizer",
    "snack",
    "ingredient",
    "kitchen",
    "culinary",
    "gourmet",
    "delicious",
    "tasty",
    "yummy",
    "homemade",
    "restaurant",
    "chef",
    "cook",
    "plate",
    "bowl",
    "serving",
    "portion",
    "menu",
    "dining",
    "eat",
    "eating",
    "edible",
    "nutrition",
    "nutritious",
    "healthy",
    "diet",
    "dietary",
    "vegetarian",
    "vegan",
    "meat",
    "fish",
    "seafood",
    "vegetable",
    "fruit",
    "grain",
    "bread",
    "pasta",
    "rice",
    "potato",
    "salad",
    "soup",
    "stew",
    "sauce",
    "dressing",
    "marinade",
    "seasoning",
    "spice",
    "herb",
    "flavor",
    "taste",
    "aroma",
    "smell",
    "scent",
    "sweet",
    "sour",
    "salty",
    "bitter",
    "umami",
    "savory",
    "spicy",
    "hot",
    "cold",
    "warm",
    "fresh",
    "frozen",
    "canned",
    "preserved",
    "dried",
    "baked",
    "fried",
    "grilled",
    "roasted",
    "boiled",
    "steamed",
    "poached",
    "sauteed",
    "braised",
    "stir-fried",
    "deep-fried",
    "pan-fried",
    "raw",
    "cooked",
    "prepared",
    "ready",
    "finished",
    "plated",
    "garnished",
  ];

  // Check if any of the food keywords are present in the URL
  return foodKeywords.some((keyword) => url.includes(keyword));
}
