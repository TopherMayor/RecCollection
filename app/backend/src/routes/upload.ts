import { Hono } from "hono";
import { authenticate } from "../middleware/auth";
import { HTTPException } from "hono/http-exception";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Create a new router
const router = new Hono();

// Define the upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Upload an image
router.post("/image", authenticate, async (c) => {
  try {
    const formData = await c.req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      throw new HTTPException(400, { message: "No image file provided" });
    }

    // Generate a unique filename
    const fileExtension = path.extname(image.name) || ".jpg";
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save the file
    const buffer = await image.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Return the file path
    const relativePath = `/uploads/${filename}`;
    return c.json({
      success: true,
      filePath: relativePath,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "An error occurred while uploading the image",
    });
  }
});

export { router as uploadRoutes };
