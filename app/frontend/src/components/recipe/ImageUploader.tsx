import React, { useState } from "react";
import { api } from "../../api";

interface ImageUploaderProps {
  imageUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  onImageChange: (
    field: "imageUrl" | "thumbnailPath" | "thumbnailUrl",
    value: string
  ) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export default function ImageUploader({
  imageUrl,
  thumbnailPath,
  thumbnailUrl,
  onImageChange,
  setError,
  setSuccess,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get the current image URL to display
  const currentImageUrl = () => {
    if (imageUrl && !imageUrl.startsWith("/")) {
      return imageUrl;
    } else if (thumbnailUrl) {
      return thumbnailUrl;
    } else if (thumbnailPath) {
      if (thumbnailPath.startsWith("http")) {
        return thumbnailPath;
      }
      return thumbnailPath;
    } else {
      return "/placeholder-image.jpg";
    }
  };

  // This function is now handled inline in the button click handler

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      const response = await api.upload.image(selectedFile);

      if (response.filePath) {
        onImageChange("thumbnailPath", response.filePath);
        onImageChange("imageUrl", "");
        onImageChange("thumbnailUrl", "");
        setSuccess("Image uploaded successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    }

    // Clear the file input
    setSelectedFile(null);
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onImageChange("imageUrl", url);

    if (url) {
      try {
        new URL(url);
        setSuccess("Image URL updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch {
        setError("Please enter a valid URL");
      }
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    onImageChange("imageUrl", "");
    onImageChange("thumbnailPath", "");
    onImageChange("thumbnailUrl", "");
    setSuccess("Image removed successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Check if we have an image
  const hasImage = imageUrl || thumbnailPath || thumbnailUrl;

  return (
    <div className="mt-2">
      <p className="text-xs sm:text-sm text-gray-500">
        Add an image for your recipe. You can upload an image or provide a URL.
      </p>

      <div className="mt-2 flex flex-col sm:flex-row items-center">
        {hasImage ? (
          <img
            src={currentImageUrl()}
            alt="Recipe"
            className="h-36 w-36 sm:h-48 sm:w-48 object-cover rounded-md mb-3 sm:mb-0"
            loading="lazy"
          />
        ) : (
          <div className="h-36 w-36 sm:h-48 sm:w-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center mb-3 sm:mb-0">
            <span className="text-xs sm:text-sm text-gray-500">No image</span>
          </div>
        )}

        <div className="sm:ml-4 w-full sm:w-auto flex flex-col space-y-2">
          <div className="mb-2">
            <label
              htmlFor="imageUrlInput"
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Image URL
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="imageUrlInput"
                value={imageUrl && !imageUrl.startsWith("/") ? imageUrl : ""}
                onChange={handleUrlChange}
                className="flex-1 min-w-0 block w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />

              <button
                type="button"
                onClick={() => {
                  if (imageUrl) {
                    try {
                      new URL(imageUrl);
                      setSuccess("Image URL set successfully!");
                      setTimeout(() => setSuccess(null), 3000);
                    } catch {
                      setError("Please enter a valid URL");
                    }
                  }
                }}
                className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-r-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Set URL
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mb-2">
            Or upload an image from your device
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files.length > 0) {
                    setSelectedFile(target.files[0]);
                    handleUpload();
                  }
                };
                input.click();
              }}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload Image
            </button>

            {hasImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Remove Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
