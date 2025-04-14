import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

interface Ingredient {
  id?: number;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  orderIndex?: number;
}

interface Instruction {
  id?: number;
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

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

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
    ingredients: [{ name: "", quantity: "", unit: "" }],
    instructions: [{ stepNumber: 1, description: "" }],
    categories: [],
    tags: [],
    isPrivate: false,
  });

  // Fetch recipe data when component mounts
  useEffect(() => {
    if (!id || isLoading || !isAuthenticated) return;

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.recipes.getById(parseInt(id));
        console.log("Fetched recipe data:", data);

        // Handle both response formats (direct recipe object or {success, recipe} format)
        const recipe = data.recipe || data;

        if (recipe) {
          // Check if current user is the recipe owner
          if (user && recipe.user && user.id === recipe.user.id) {
            setIsOwner(true);

            // Format the recipe data for the form
            setFormData({
              title: recipe.title || "",
              description: recipe.description || "",
              cookingTime: recipe.cookingTime,
              prepTime: recipe.prepTime,
              servingSize: recipe.servingSize,
              difficultyLevel:
                (recipe.difficultyLevel as "easy" | "medium" | "hard" | "") ||
                "",
              imageUrl: recipe.imageUrl || "",
              thumbnailPath: recipe.thumbnailPath || undefined,
              thumbnailUrl: recipe.thumbnailUrl || undefined,
              sourceUrl: recipe.sourceUrl || undefined,
              sourceType: recipe.sourceType || undefined,
              ingredients: recipe.ingredients?.length
                ? recipe.ingredients.map(
                    (ing: {
                      id: number;
                      name: string;
                      quantity?: number;
                      unit?: string;
                      notes?: string;
                      orderIndex: number;
                    }) => ({
                      id: ing.id,
                      name: ing.name,
                      quantity: ing.quantity?.toString() || "",
                      unit: ing.unit,
                      notes: ing.notes,
                      orderIndex: ing.orderIndex,
                    })
                  )
                : [{ name: "", quantity: "", unit: "" }],
              instructions: recipe.instructions?.length
                ? recipe.instructions.map(
                    (inst: {
                      id: number;
                      stepNumber: number;
                      description: string;
                      imageUrl?: string;
                    }) => ({
                      id: inst.id,
                      stepNumber: inst.stepNumber,
                      description: inst.description,
                      imageUrl: inst.imageUrl,
                    })
                  )
                : [{ stepNumber: 1, description: "" }],
              categories:
                recipe.categories?.map((c: { name: string }) => c.name) || [],
              tags: recipe.tags?.map((t: { name: string }) => t.name) || [],
              isPrivate: recipe.isPrivate || false,
            });
          } else {
            // Not the owner, redirect to recipe view
            setError("You don't have permission to edit this recipe");
            setTimeout(() => {
              navigate(`/app/recipe/${id}`);
            }, 2000);
          }
        } else {
          setError("Recipe not found");
          setTimeout(() => {
            navigate("/app/recipes");
          }, 2000);
        }
      } catch (err: unknown) {
        console.error("Error fetching recipe:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, isLoading, isAuthenticated, navigate, user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = value === "" ? undefined : parseInt(value, 10);
    setFormData((prev) => ({ ...prev, [name]: numberValue }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle ingredient changes
  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value,
      };
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  // Add a new ingredient
  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "", unit: "" }],
    }));
  };

  // Remove an ingredient
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length <= 1) return;

    setFormData((prev) => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients.splice(index, 1);
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  // Handle instruction changes
  const handleInstructionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedInstructions = [...prev.instructions];
      updatedInstructions[index] = {
        ...updatedInstructions[index],
        description: value,
      };
      return { ...prev, instructions: updatedInstructions };
    });
  };

  // Add a new instruction
  const addInstruction = () => {
    setFormData((prev) => {
      const newStepNumber =
        prev.instructions.length > 0
          ? prev.instructions[prev.instructions.length - 1].stepNumber + 1
          : 1;

      return {
        ...prev,
        instructions: [
          ...prev.instructions,
          { stepNumber: newStepNumber, description: "" },
        ],
      };
    });
  };

  // Remove an instruction
  const removeInstruction = (index: number) => {
    if (formData.instructions.length <= 1) return;

    setFormData((prev) => {
      const updatedInstructions = [...prev.instructions];
      updatedInstructions.splice(index, 1);

      // Renumber the steps
      const renumberedInstructions = updatedInstructions.map((inst, idx) => ({
        ...inst,
        stepNumber: idx + 1,
      }));

      return { ...prev, instructions: renumberedInstructions };
    });
  };

  // Handle categories input
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categoriesString = e.target.value;
    const categoriesArray = categoriesString
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat !== "");

    setFormData((prev) => ({
      ...prev,
      categories: categoriesArray,
    }));
  };

  // Handle tags input
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    setFormData((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setError("Recipe ID is missing");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate ingredients (remove empty ones)
      const validIngredients = formData.ingredients.filter(
        (ing) => ing.name.trim() !== ""
      );

      if (validIngredients.length === 0) {
        setError("At least one ingredient is required");
        return;
      }

      // Validate instructions (remove empty ones)
      const validInstructions = formData.instructions.filter(
        (inst) => inst.description.trim() !== ""
      );

      if (validInstructions.length === 0) {
        setError("At least one instruction step is required");
        return;
      }

      // Prepare data for submission
      const recipeData = {
        ...formData,
        ingredients: validIngredients.map((ing, index) => ({
          ...ing,
          orderIndex: index,
          quantity: ing.quantity ? parseFloat(ing.quantity) || 0 : null,
        })),
        instructions: validInstructions,
      };

      // Handle duplicate URLs to avoid validation errors
      // If imageUrl and thumbnailPath are the same, clear thumbnailPath
      if (
        recipeData.imageUrl &&
        recipeData.thumbnailPath &&
        recipeData.imageUrl === recipeData.thumbnailPath
      ) {
        recipeData.thumbnailPath = "";
      }

      // If imageUrl and thumbnailUrl are the same, clear thumbnailUrl
      if (
        recipeData.imageUrl &&
        recipeData.thumbnailUrl &&
        recipeData.imageUrl === recipeData.thumbnailUrl
      ) {
        recipeData.thumbnailUrl = "";
      }

      // If thumbnailPath and thumbnailUrl are the same, clear thumbnailUrl
      if (
        recipeData.thumbnailPath &&
        recipeData.thumbnailUrl &&
        recipeData.thumbnailPath === recipeData.thumbnailUrl
      ) {
        recipeData.thumbnailUrl = "";
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

      // Log the data being sent to the API
      console.log(
        "Submitting recipe data:",
        JSON.stringify(recipeData, null, 2)
      );

      // Debug: Check for any potential issues with the data
      const debugIssues: string[] = [];

      // Convert any null values to empty strings for string fields
      if (recipeData.imageUrl === null) {
        debugIssues.push("imageUrl is null, converting to empty string");
        recipeData.imageUrl = "";
      }

      if (recipeData.thumbnailPath === null) {
        debugIssues.push("thumbnailPath is null, converting to empty string");
        recipeData.thumbnailPath = "";
      }

      if (recipeData.thumbnailUrl === null) {
        debugIssues.push("thumbnailUrl is null, converting to empty string");
        recipeData.thumbnailUrl = "";
      }

      if (recipeData.sourceUrl === null) {
        debugIssues.push("sourceUrl is null, converting to empty string");
        recipeData.sourceUrl = "";
      }

      if (recipeData.sourceType === null) {
        debugIssues.push("sourceType is null, converting to empty string");
        recipeData.sourceType = "";
      }

      if (recipeData.description === null) {
        debugIssues.push("description is null, converting to empty string");
        recipeData.description = "";
      }

      // Check ingredients
      recipeData.ingredients.forEach((ing, index) => {
        if (ing.notes === null) {
          debugIssues.push(`Ingredient ${index} has null notes`);
          ing.notes = "";
        }
        if (ing.unit === null) {
          debugIssues.push(`Ingredient ${index} has null unit`);
          ing.unit = "";
        }
      });

      // Check instructions
      recipeData.instructions.forEach((inst, index) => {
        if (inst.imageUrl === null) {
          debugIssues.push(`Instruction ${index} has null imageUrl`);
          inst.imageUrl = "";
        }
      });

      // Check if any tags are null
      if (recipeData.tags) {
        const validTags = recipeData.tags.filter((tag) => tag !== null);
        if (validTags.length !== recipeData.tags.length) {
          debugIssues.push("Found null tags, filtering them out");
          recipeData.tags = validTags;
        }
      }

      if (debugIssues.length > 0) {
        console.warn("Potential data issues found:", debugIssues);
        console.log("Fixed recipe data:", JSON.stringify(recipeData, null, 2));
      }

      // Submit the updated recipe
      const response = await api.recipes.update(parseInt(id), recipeData);

      console.log("Recipe updated successfully:", response);
      setSuccess("Recipe updated successfully!");

      // Redirect to the recipe detail page after a short delay
      setTimeout(() => {
        navigate(`/app/recipe/${id}`);
      }, 1500);
    } catch (err: unknown) {
      console.error("Error updating recipe:", err);

      // Try to extract detailed error information
      let errorMessage = "Failed to update recipe. Please try again.";

      // Type guard for error object with details
      interface ErrorWithDetails {
        details?: Record<string, string>;
        message?: string;
        error?: string;
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
        } else if (errorObj.error && typeof errorObj.error === "string") {
          errorMessage = errorObj.error;
        }

        // Log the full error object for debugging
        try {
          console.log("Full error object:", JSON.stringify(err, null, 2));
        } catch {
          console.log("Error object could not be stringified", err);
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isOwner && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Permission Denied</p>
          <p>You don't have permission to edit this recipe.</p>
          <p className="mt-2">Redirecting to recipe page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Recipe</h1>

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

              <div className="mt-4">
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

              {/* Image fields removed in favor of the image display section with upload/remove buttons */}

              <div className="mt-4">
                <label
                  htmlFor="sourceUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source URL{" "}
                  <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="sourceUrl"
                    name="sourceUrl"
                    value={formData.sourceUrl || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/original-recipe"
                  />
                  {formData.sourceUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sourceUrl: "",
                        }))
                      }
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="sourceType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source Type{" "}
                  <span className="text-xs text-gray-500">(optional)</span>
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
            </div>

            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="isPrivate"
                    className="font-medium text-gray-700"
                  >
                    Private Recipe (only visible to you)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ingredients
            </h2>

            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-wrap mb-4 -mx-2">
                <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Ingredient {index + 1}
                  </label>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Flour"
                  />
                </div>

                <div className="w-1/2 md:w-1/4 px-2 mb-4 md:mb-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2"
                  />
                </div>

                <div className="w-1/2 md:w-1/4 px-2 mb-4 md:mb-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. cups"
                  />
                </div>

                <div className="w-full px-2 flex items-center mt-2">
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-800 mr-4"
                    disabled={formData.ingredients.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Instructions
            </h2>

            {formData.instructions.map((instruction, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Step {instruction.stepNumber}
                </label>
                <div className="flex">
                  <textarea
                    value={instruction.description}
                    onChange={(e) =>
                      handleInstructionChange(index, e.target.value)
                    }
                    rows={3}
                    className="w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Describe step ${instruction.stepNumber}...`}
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    disabled={formData.instructions.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addInstruction}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Add Step
            </button>
          </div>

          {/* Categories and Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Categories and Tags
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="categories"
                  className="block text-sm font-medium text-gray-700"
                >
                  Categories (comma separated)
                </label>
                <input
                  type="text"
                  id="categories"
                  value={formData.categories.join(", ")}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Dinner, Italian, Pasta"
                />
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={handleTagChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Quick, Vegetarian, Gluten-free"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate(`/app/recipe/${id}`)}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
