import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";

// Define the recipe data structure
interface RecipeData {
  title: string;
  description?: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceType: string;
  isPrivate: boolean;
  ingredients: {
    name: string;
    quantity?: number;
    unit?: string;
    orderIndex: number;
    notes?: string;
  }[];
  instructions: {
    stepNumber: number;
    description: string;
    imageUrl?: string;
  }[];
  tags?: string[];
}

export default function ImportRecipe() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // State for the URL input
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<
    "tiktok" | "instagram" | "youtube" | ""
  >("");

  // State for loading and errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the parsed recipe
  const [parsedRecipe, setParsedRecipe] = useState<RecipeData | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // State for the edited recipe (after user modifications)
  const [editedRecipe, setEditedRecipe] = useState<RecipeData | null>(null);

  // State for screenshot selection
  const [screenshotOptions, setScreenshotOptions] = useState<
    { path: string; timestamp: number }[]
  >([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string>("");

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);

    // Auto-detect platform from URL
    const lowerUrl = e.target.value.toLowerCase();
    if (lowerUrl.includes("tiktok.com")) {
      setPlatform("tiktok");
    } else if (
      lowerUrl.includes("instagram.com") ||
      lowerUrl.includes("instagr.am")
    ) {
      setPlatform("instagram");
    } else if (
      lowerUrl.includes("youtube.com") ||
      lowerUrl.includes("youtu.be")
    ) {
      setPlatform("youtube");
    } else {
      setPlatform("");
    }
  };

  // Handle platform selection
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatform(e.target.value as "tiktok" | "instagram" | "youtube" | "");
  };

  // Validate YouTube URL format
  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i,
      /(?:youtube\.com\/shorts\/)([^"&?\/ ]{11})/i,
      /youtube\.com\/watch\?v=([^"&?\/ ]{11})/i,
      /youtube\.com\/embed\/([^"&?\/ ]{11})/i,
      /youtu\.be\/([^"&?\/ ]{11})/i,
    ];

    return youtubeRegex.some((regex) => regex.test(url));
  };

  // Handle parse button click
  const handleParse = async () => {
    try {
      setIsParsing(true);
      setError(null);

      if (!url) {
        setError("Please enter a URL");
        return;
      }

      // If platform is YouTube, validate the URL format
      if (platform === "youtube" && !validateYouTubeUrl(url)) {
        setError(
          "Invalid YouTube URL format. Please provide a valid YouTube video URL."
        );
        setIsParsing(false);
        return;
      }

      // Call the API to parse the recipe
      const response = await fetch("/api/social-import/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          url,
          platform: platform || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract detailed error information if available
        const errorMessage =
          data.message || data.error || "Failed to parse recipe";
        const errorDetails = data.details || "";

        // Log detailed error for debugging
        console.error("API Error:", {
          message: errorMessage,
          details: errorDetails,
          status: response.status,
        });

        // Handle different error types with specific messages
        if (
          response.status === 400 &&
          errorMessage.includes("YouTube URL format")
        ) {
          setError(
            "Invalid YouTube URL format. Please check the URL and try again. Make sure it's a valid YouTube video URL."
          );
          setIsParsing(false);
          return;
        }

        // For transcript/captions errors, we can still proceed with limited information
        if (response.status === 422 && errorMessage.includes("captions")) {
          console.warn(
            "Proceeding with limited information (no transcript available)"
          );
          // Show a warning to the user but don't block the process
          setError(
            `Warning: ${errorMessage} The recipe might be less accurate.`
          );

          // If we still have recipe data, we can continue
          if (data.recipe) {
            setParsedRecipe(data.recipe);
            setEditedRecipe(data.recipe);
            return;
          }
        }

        // For authentication errors
        if (response.status === 401) {
          setError("Authentication error. Please log in again.");
          setIsParsing(false);
          return;
        }

        // For other errors, throw an exception to be caught by the catch block
        throw new Error(errorMessage);
      }

      if (data.success && data.recipe) {
        setParsedRecipe(data.recipe);
        setEditedRecipe(data.recipe);

        // Check if we have screenshot options
        if (
          data.screenshotOptions &&
          Array.isArray(data.screenshotOptions) &&
          data.screenshotOptions.length > 0
        ) {
          console.log("Setting screenshot options:", data.screenshotOptions);
          setScreenshotOptions(data.screenshotOptions);
          setSelectedScreenshot(data.screenshotOptions[0].path);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error parsing recipe:", error);

      // Provide more helpful error messages based on the error
      if (
        error.message.includes("YouTube") ||
        error.message.includes("video")
      ) {
        setError(
          "There was a problem with the YouTube video URL. Please check that it's a valid video URL and try again."
        );
      } else if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError(
          error.message ||
            "Failed to parse recipe. Please try again with a different URL."
        );
      }
    } finally {
      setIsParsing(false);
    }
  };

  // Handle import button click
  const handleImport = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!editedRecipe) {
        setError("No recipe to import");
        return;
      }

      // Update the recipe with the selected screenshot if available
      if (selectedScreenshot && editedRecipe) {
        editedRecipe.imageUrl = selectedScreenshot;
      }

      // Call the API to import the recipe
      const response = await fetch("/api/social-import/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          url,
          platform: platform || undefined,
          recipeData: editedRecipe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import recipe");
      }

      if (data.success && data.recipe) {
        // Navigate to the recipe detail page
        navigate(`/app/recipe/${data.recipe.id}`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error importing recipe:", error);
      setError(error.message || "Failed to import recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle recipe field changes
  const handleRecipeChange = (field: string, value: any) => {
    if (!editedRecipe) return;

    setEditedRecipe({
      ...editedRecipe,
      [field]: value,
    });
  };

  // Handle ingredient changes
  const handleIngredientChange = (index: number, field: string, value: any) => {
    if (!editedRecipe) return;

    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };

    setEditedRecipe({
      ...editedRecipe,
      ingredients: updatedIngredients,
    });
  };

  // Handle instruction changes
  const handleInstructionChange = (
    index: number,
    field: string,
    value: any
  ) => {
    if (!editedRecipe) return;

    const updatedInstructions = [...editedRecipe.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      [field]: value,
    };

    setEditedRecipe({
      ...editedRecipe,
      instructions: updatedInstructions,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        Import Recipe from Social Media
      </h1>
      <p className="text-gray-600 mb-6">
        Import recipes from your favorite social media platforms. Just paste the
        URL and our AI will extract the recipe details.
      </p>

      {/* URL Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </div>
          <div className="flex items-center bg-black text-white px-3 py-1 rounded-full text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692a6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
            </svg>
            TikTok
          </div>
          <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            Instagram
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">
          Step 1: Enter Social Media URL
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder={
                platform === "tiktok"
                  ? "https://www.tiktok.com/@username/video/1234567890"
                  : platform === "instagram"
                  ? "https://www.instagram.com/p/abcd1234/"
                  : "https://www.youtube.com/watch?v=abcdef12345"
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isParsing || isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={handlePlatformChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isParsing || isSubmitting}
            >
              <option value="">Auto-detect from URL</option>
              <option value="youtube">YouTube - Recipe Videos</option>
              <option value="tiktok">TikTok - Short Recipe Videos</option>
              <option value="instagram">Instagram - Posts & Reels</option>
            </select>
          </div>

          <button
            onClick={handleParse}
            disabled={!url || isParsing || isSubmitting}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isParsing ? "Parsing..." : "Parse Recipe"}
          </button>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Preview Section */}
      {parsedRecipe && editedRecipe && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Step 2: Review and Edit Recipe
          </h2>

          <div className="space-y-6">
            {/* Screenshot Selection */}
            {screenshotOptions.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Thumbnail
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {screenshotOptions.map((screenshot, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded-md overflow-hidden ${
                        selectedScreenshot === screenshot.path
                          ? "border-indigo-500 ring-2 ring-indigo-300"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedScreenshot(screenshot.path)}
                    >
                      <img
                        src={screenshot.path}
                        alt={`Screenshot at ${screenshot.timestamp}s`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-1 text-xs text-center bg-gray-50">
                        {Math.floor(screenshot.timestamp / 60)}:
                        {(screenshot.timestamp % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={editedRecipe.title}
                  onChange={(e) => handleRecipeChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={editedRecipe.imageUrl || ""}
                  onChange={(e) =>
                    handleRecipeChange("imageUrl", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={editedRecipe.description || ""}
                onChange={(e) =>
                  handleRecipeChange("description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Cooking Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="prepTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  value={editedRecipe.prepTime || ""}
                  onChange={(e) =>
                    handleRecipeChange(
                      "prepTime",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="cookingTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cooking Time (minutes)
                </label>
                <input
                  type="number"
                  id="cookingTime"
                  value={editedRecipe.cookingTime || ""}
                  onChange={(e) =>
                    handleRecipeChange(
                      "cookingTime",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="servingSize"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Serving Size
                </label>
                <input
                  type="number"
                  id="servingSize"
                  value={editedRecipe.servingSize || ""}
                  onChange={(e) =>
                    handleRecipeChange(
                      "servingSize",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="difficultyLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty Level
              </label>
              <select
                id="difficultyLevel"
                value={editedRecipe.difficultyLevel || ""}
                onChange={(e) =>
                  handleRecipeChange("difficultyLevel", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting}
              >
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="isPrivate" className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={editedRecipe.isPrivate}
                  onChange={(e) =>
                    handleRecipeChange("isPrivate", e.target.checked)
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Make this recipe private
                </span>
              </label>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ingredients
              </h3>
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={ingredient.quantity || ""}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "quantity",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="Qty"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={ingredient.unit || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    placeholder="Unit"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    placeholder="Ingredient name"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Instructions
              </h3>
              {editedRecipe.instructions.map((instruction, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center mb-1">
                    <span className="bg-indigo-100 text-indigo-800 font-medium px-2 py-1 rounded-full mr-2">
                      {instruction.stepNumber}
                    </span>
                    <input
                      type="text"
                      value={instruction.description}
                      onChange={(e) =>
                        handleInstructionChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={editedRecipe.tags?.join(", ") || ""}
                onChange={(e) =>
                  handleRecipeChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag)
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. healthy, quick, vegetarian"
                disabled={isSubmitting}
              />
            </div>

            {/* Source Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Source Information
              </h3>
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Platform:</span>
                {editedRecipe.sourceType === "youtube" && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    <svg
                      className="inline-block w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube
                  </span>
                )}
                {editedRecipe.sourceType === "tiktok" && (
                  <span className="bg-black text-white text-xs font-medium px-2.5 py-0.5 rounded">
                    <svg
                      className="inline-block w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                    </svg>
                    TikTok
                  </span>
                )}
                {editedRecipe.sourceType === "instagram" && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                    <svg
                      className="inline-block w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                    Instagram
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                <span className="font-medium">URL:</span>{" "}
                <a
                  href={editedRecipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {editedRecipe.sourceUrl}
                </a>
              </p>
            </div>

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? "Importing..." : "Import Recipe"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
