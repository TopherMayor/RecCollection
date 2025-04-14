import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  orderIndex?: number;
}

interface Instruction {
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel: "easy" | "medium" | "hard" | "";
  imageUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceType?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  categories: string[];
  tags: string[];
  isPrivate: boolean;
}

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    cookingTime: undefined,
    prepTime: undefined,
    servingSize: undefined,
    difficultyLevel: "",
    imageUrl: "",
    thumbnailPath: undefined,
    thumbnailUrl: undefined,
    sourceUrl: undefined,
    sourceType: undefined,
    ingredients: [{ name: "", quantity: "", unit: "", orderIndex: 0 }],
    instructions: [{ stepNumber: 1, description: "" }],
    categories: [],
    tags: [],
    isPrivate: false,
  });

  // New category and tag inputs
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle number inputs
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" ? undefined : parseInt(value),
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle ingredient changes
  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  // Add new ingredient
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          name: "",
          quantity: "",
          unit: "",
          orderIndex: formData.ingredients.length,
        },
      ],
    });
  };

  // Remove ingredient
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = [...formData.ingredients];
      updatedIngredients.splice(index, 1);

      // Update orderIndex values
      updatedIngredients.forEach((ingredient, idx) => {
        ingredient.orderIndex = idx;
      });

      setFormData({
        ...formData,
        ingredients: updatedIngredients,
      });
    }
  };

  // Handle instruction changes
  const handleInstructionChange = (
    index: number,
    field: keyof Instruction,
    value: string
  ) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      [field]: field === "stepNumber" ? parseInt(value) : value,
    };
    setFormData({
      ...formData,
      instructions: updatedInstructions,
    });
  };

  // Add new instruction
  const addInstruction = () => {
    const nextStepNumber = formData.instructions.length + 1;
    setFormData({
      ...formData,
      instructions: [
        ...formData.instructions,
        { stepNumber: nextStepNumber, description: "" },
      ],
    });
  };

  // Remove instruction
  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const updatedInstructions = [...formData.instructions];
      updatedInstructions.splice(index, 1);

      // Update step numbers
      updatedInstructions.forEach((instruction, idx) => {
        instruction.stepNumber = idx + 1;
      });

      setFormData({
        ...formData,
        instructions: updatedInstructions,
      });
    }
  };

  // Add category
  const addCategory = () => {
    if (
      newCategory.trim() &&
      !formData.categories.includes(newCategory.trim())
    ) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory.trim()],
      });
      setNewCategory("");
    }
  };

  // Remove category
  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    });
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      setError("Recipe title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Recipe description is required");
      return;
    }

    // Validate ingredients
    const validIngredients = formData.ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );
    if (validIngredients.length === 0) {
      setError("At least one ingredient is required");
      return;
    }

    // Validate instructions
    const validInstructions = formData.instructions.filter(
      (ins) => ins.description.trim() !== ""
    );
    if (validInstructions.length === 0) {
      setError("At least one instruction step is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare data for API
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cookingTime: formData.cookingTime,
        prepTime: formData.prepTime,
        servingSize: formData.servingSize,
        difficultyLevel: formData.difficultyLevel || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        thumbnailPath: formData.thumbnailPath?.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl?.trim() || undefined,
        sourceUrl: formData.sourceUrl?.trim() || undefined,
        sourceType: formData.sourceType || undefined,
        isPrivate: formData.isPrivate,
        ingredients: formData.ingredients
          .filter((ing) => ing.name.trim() !== "")
          .map((ing, index) => ({
            name: ing.name.trim(),
            quantity: ing.quantity ? parseFloat(ing.quantity) : undefined,
            unit: ing.unit?.trim() || undefined,
            orderIndex: index,
            notes: ing.notes?.trim() || undefined,
          })),
        instructions: formData.instructions
          .filter((ins) => ins.description.trim() !== "")
          .map((ins, index) => ({
            stepNumber: index + 1,
            description: ins.description.trim(),
            imageUrl: ins.imageUrl?.trim() || undefined,
          })),
        // For now, omit categories since we don't have a way to select category IDs
        categories: undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      // Handle duplicate URLs to avoid validation errors
      // If imageUrl and thumbnailPath are the same, clear thumbnailPath
      if (
        recipeData.imageUrl &&
        recipeData.thumbnailPath &&
        recipeData.imageUrl === recipeData.thumbnailPath
      ) {
        recipeData.thumbnailPath = undefined;
      }

      // If imageUrl and thumbnailUrl are the same, clear thumbnailUrl
      if (
        recipeData.imageUrl &&
        recipeData.thumbnailUrl &&
        recipeData.imageUrl === recipeData.thumbnailUrl
      ) {
        recipeData.thumbnailUrl = undefined;
      }

      // If thumbnailPath and thumbnailUrl are the same, clear thumbnailUrl
      if (
        recipeData.thumbnailPath &&
        recipeData.thumbnailUrl &&
        recipeData.thumbnailPath === recipeData.thumbnailUrl
      ) {
        recipeData.thumbnailUrl = undefined;
      }

      // Handle image fields based on source
      // If we have a source (YouTube, TikTok, Instagram) with a thumbnail, prioritize that
      if (
        recipeData.sourceType &&
        (recipeData.thumbnailUrl || recipeData.thumbnailPath)
      ) {
        // If we have a source with a thumbnail, keep that and clear imageUrl
        // This preserves the connection to the original source
        if (recipeData.thumbnailUrl) {
          // If we have a thumbnailUrl from the source, use that and clear other fields
          recipeData.imageUrl = "";
          recipeData.thumbnailPath = "";
        } else if (recipeData.thumbnailPath) {
          // If we have a thumbnailPath from the source, use that and clear other fields
          recipeData.imageUrl = "";
          recipeData.thumbnailUrl = "";
        }
      } else {
        // No source or no source thumbnail, so prioritize: imageUrl > thumbnailUrl > thumbnailPath
        if (recipeData.imageUrl) {
          // If imageUrl is a file path (starts with '/'), move it to thumbnailPath
          if (recipeData.imageUrl.startsWith("/")) {
            // Keep the path in thumbnailPath and clear imageUrl
            recipeData.thumbnailPath = recipeData.imageUrl;
            recipeData.imageUrl = ""; // Clear imageUrl since it's not a valid URL
          }
          // Clear thumbnailUrl regardless
          recipeData.thumbnailUrl = "";
        } else if (recipeData.thumbnailUrl) {
          // If we have a thumbnailUrl but no imageUrl, use thumbnailUrl as the main image
          recipeData.imageUrl = recipeData.thumbnailUrl;
          recipeData.thumbnailUrl = "";
        } else if (recipeData.thumbnailPath) {
          // If we only have thumbnailPath, keep it as is
          // Make sure imageUrl is empty to avoid validation errors
          recipeData.imageUrl = "";
        }
      }

      // Final validation check - ensure we don't send file paths as URLs
      if (recipeData.imageUrl && recipeData.imageUrl.startsWith("/")) {
        recipeData.thumbnailPath = recipeData.imageUrl;
        recipeData.imageUrl = "";
      }

      if (recipeData.thumbnailUrl && recipeData.thumbnailUrl.startsWith("/")) {
        recipeData.thumbnailPath = recipeData.thumbnailUrl;
        recipeData.thumbnailUrl = "";
      }

      console.log("Submitting recipe:", recipeData);
      console.log(
        "Submitting recipe (stringified):",
        JSON.stringify(recipeData, null, 2)
      );

      const response = await api.recipes.create(recipeData);
      console.log("Recipe created:", response);

      setSuccess("Recipe created successfully!");

      // Redirect to the recipe page after a short delay
      setTimeout(() => {
        navigate(`/app/recipe/${response.recipe.id}`);
      }, 1500);
    } catch (err: unknown) {
      console.error("Error creating recipe:", err);

      // Try to extract detailed error information
      let errorMessage = "Failed to create recipe. Please try again.";

      // Type guard for error object with details
      interface ErrorWithDetails {
        details?: Record<string, string>;
        message?: string;
      }

      // Check if error is an object with the expected properties
      if (err && typeof err === "object") {
        const errorObj = err as ErrorWithDetails;

        if (errorObj.details && typeof errorObj.details === "object") {
          // Format validation errors
          const validationErrors = Object.entries(errorObj.details)
            .map(([field, message]) => `${field}: ${message}`)
            .join("\n");

          errorMessage = `Validation errors:\n${validationErrors}`;
          console.error("Validation errors:", errorObj.details);
        } else if (errorObj.message && typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        }

        // Log the full error object for debugging
        try {
          console.log("Full error object:", JSON.stringify(err, null, 2));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.log("Error object could not be stringified", err);
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Create New Recipe
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            {error.includes("\n") ? (
              <div>
                <p>Please fix the following issues:</p>
                <ul className="list-disc pl-5 mt-2">
                  {error
                    .split("\n")
                    .filter(
                      (line) =>
                        line.trim() && !line.includes("Validation errors:")
                    )
                    .map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                </ul>
              </div>
            ) : (
              <p>{error}</p>
            )}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Success</p>
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recipe Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="prepTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="prepTime"
                    name="prepTime"
                    value={formData.prepTime || ""}
                    onChange={handleNumberChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cookingTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cooking Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="cookingTime"
                    name="cookingTime"
                    value={formData.cookingTime || ""}
                    onChange={handleNumberChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="servingSize"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Servings
                  </label>
                  <input
                    type="number"
                    id="servingSize"
                    name="servingSize"
                    value={formData.servingSize || ""}
                    onChange={handleNumberChange}
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="difficultyLevel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Difficulty Level
                  </label>
                  <select
                    id="difficultyLevel"
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Image URL and Thumbnail URL fields removed in favor of the image display section with upload/remove buttons */}

                <div>
                  <label
                    htmlFor="sourceUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Source URL
                  </label>
                  <input
                    type="url"
                    id="sourceUrl"
                    name="sourceUrl"
                    value={formData.sourceUrl || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/original-recipe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sourceType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Source Type
                  </label>
                  <select
                    id="sourceType"
                    name="sourceType"
                    value={formData.sourceType || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a source type</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="website">Website</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recipe Image
                </h3>

                {formData.imageUrl ||
                formData.thumbnailPath ||
                formData.thumbnailUrl ? (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {formData.sourceType &&
                      (formData.thumbnailPath || formData.thumbnailUrl)
                        ? `This recipe has a thumbnail image from ${formData.sourceType}.`
                        : "Current recipe image:"}
                      {formData.sourceType &&
                        (formData.thumbnailPath || formData.thumbnailUrl) && (
                          <span className="ml-1 text-indigo-600">
                            When a recipe is imported from social media, we
                            prioritize using the original thumbnail.
                          </span>
                        )}
                    </p>
                    <div className="mt-2 flex items-center">
                      <img
                        src={
                          formData.imageUrl
                            ? formData.imageUrl.startsWith("/")
                              ? `${import.meta.env.VITE_API_URL || ""}${
                                  formData.imageUrl
                                }`
                              : formData.imageUrl
                            : formData.thumbnailPath
                            ? `${import.meta.env.VITE_API_URL || ""}${
                                formData.thumbnailPath
                              }`
                            : formData.thumbnailUrl
                        }
                        alt="Recipe image"
                        className="h-48 w-48 object-cover rounded-md"
                      />
                      <div className="ml-4 flex flex-col space-y-2">
                        <div className="mb-2">
                          <label
                            htmlFor="imageUrlInput"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Change Image URL
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                              type="text"
                              name="imageUrlInput"
                              id="imageUrlInput"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="https://example.com/image.jpg"
                              value={
                                formData.imageUrl &&
                                !formData.imageUrl.startsWith("/")
                                  ? formData.imageUrl
                                  : ""
                              }
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  imageUrl: e.target.value,
                                  thumbnailPath: "",
                                  thumbnailUrl: "",
                                }));
                              }}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() => {
                                if (formData.imageUrl) {
                                  // Validate URL
                                  try {
                                    new URL(formData.imageUrl);
                                    setSuccess(
                                      "Image URL updated successfully!"
                                    );
                                    setTimeout(() => setSuccess(null), 3000);
                                  } catch {
                                    setError("Please enter a valid URL");
                                  }
                                } else {
                                  setError("Please enter an image URL");
                                }
                              }}
                            >
                              Update
                            </button>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 mb-2">
                          Or upload a new image:
                        </div>

                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            // Open a file dialog to upload a new image
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                try {
                                  setIsSubmitting(true);
                                  setError(null);

                                  // Upload the file
                                  const response = await api.upload.image(file);

                                  // Update the form data with the new image URL
                                  setFormData((prev) => ({
                                    ...prev,
                                    imageUrl: response.imageUrl,
                                    thumbnailPath: "",
                                    thumbnailUrl: "",
                                  }));

                                  setSuccess("Image uploaded successfully!");
                                  // Clear success message after 3 seconds
                                  setTimeout(() => setSuccess(null), 3000);
                                } catch (err) {
                                  console.error("Error uploading image:", err);
                                  setError(
                                    "Failed to upload image. Please try again."
                                  );
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }
                            };
                            input.click();
                          }}
                        >
                          Upload New Image
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            // Clear all image fields
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: "",
                              thumbnailPath: "",
                              thumbnailUrl: "",
                            }));
                          }}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      No image has been set for this recipe. You can add one by
                      providing an Image URL, uploading an image, or importing
                      from a social media source.
                    </p>

                    <div className="mt-4">
                      <label
                        htmlFor="imageUrlInput"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Image URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="imageUrlInput"
                          id="imageUrlInput"
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                          placeholder="https://example.com/image.jpg"
                          value={
                            formData.imageUrl &&
                            !formData.imageUrl.startsWith("/")
                              ? formData.imageUrl
                              : ""
                          }
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                              thumbnailPath: "",
                              thumbnailUrl: "",
                            }));
                          }}
                        />
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            if (formData.imageUrl) {
                              // Validate URL
                              try {
                                new URL(formData.imageUrl);
                                setSuccess("Image URL set successfully!");
                                setTimeout(() => setSuccess(null), 3000);
                              } catch {
                                setError("Please enter a valid URL");
                              }
                            } else {
                              setError("Please enter an image URL");
                            }
                          }}
                        >
                          Set URL
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Or</span>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          // Open a file dialog to upload a new image
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              try {
                                setIsSubmitting(true);
                                setError(null);

                                // Upload the file
                                const response = await api.upload.image(file);

                                // Update the form data with the new image URL
                                setFormData((prev) => ({
                                  ...prev,
                                  imageUrl: response.imageUrl,
                                  thumbnailPath: "",
                                  thumbnailUrl: "",
                                }));

                                setSuccess("Image uploaded successfully!");
                                // Clear success message after 3 seconds
                                setTimeout(() => setSuccess(null), 3000);
                              } catch (err) {
                                console.error("Error uploading image:", err);
                                setError(
                                  "Failed to upload image. Please try again."
                                );
                              } finally {
                                setIsSubmitting(false);
                              }
                            }
                          };
                          input.click();
                        }}
                      >
                        Upload Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPrivate"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Make this recipe private (only visible to you)
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ingredients
            </h2>

            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-start"
                >
                  <div className="col-span-3">
                    <label
                      className={`block text-sm font-medium text-gray-700 ${
                        index !== 0 ? "sr-only" : ""
                      }`}
                    >
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="2"
                    />
                  </div>

                  <div className="col-span-2">
                    <label
                      className={`block text-sm font-medium text-gray-700 ${
                        index !== 0 ? "sr-only" : ""
                      }`}
                    >
                      Unit
                    </label>
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, "unit", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="cups"
                    />
                  </div>

                  <div className="col-span-5">
                    <label
                      className={`block text-sm font-medium text-gray-700 ${
                        index !== 0 ? "sr-only" : ""
                      }`}
                    >
                      Ingredient <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) =>
                        handleIngredientChange(index, "name", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Flour"
                      required
                    />
                  </div>

                  <div className="col-span-2 flex items-end justify-end space-x-1">
                    {index === formData.ingredients.length - 1 && (
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}

                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Instructions
            </h2>

            <div className="space-y-6">
              {formData.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  <div className="col-span-1 flex justify-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 text-white font-bold">
                      {instruction.stepNumber}
                    </div>
                  </div>

                  <div className="col-span-9">
                    <label
                      className={`block text-sm font-medium text-gray-700 ${
                        index !== 0 ? "sr-only" : ""
                      }`}
                    >
                      Step Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={instruction.description}
                      onChange={(e) =>
                        handleInstructionChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe this step..."
                      required
                    />
                  </div>

                  <div className="col-span-2 flex items-end justify-end space-x-1">
                    {index === formData.instructions.length - 1 && (
                      <button
                        type="button"
                        onClick={addInstruction}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}

                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories and Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Categories & Tags
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.categories.map((category) => (
                    <div
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-1.5 text-indigo-600 hover:text-indigo-900"
                      >
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a category"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="h-3 w-3"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Recipe...
                </>
              ) : (
                "Create Recipe"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
