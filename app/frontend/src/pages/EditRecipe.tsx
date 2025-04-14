import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useRecipeForm } from "../hooks/useRecipeForm";
import RecipeForm from "../components/recipe/RecipeForm";

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const {
    formData,
    setFormData,
    error,
    setError,
    success,
    setSuccess,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleCheckboxChange,
    handleIngredientChange,
    handleInstructionChange,
    addIngredient,
    removeIngredient,
    addInstruction,
    removeInstruction,
    addCategory,
    removeCategory,
    addTag,
    removeTag,
    validateForm,
  } = useRecipeForm();

  // Fetch recipe data
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const fetchRecipe = async () => {
      try {
        setIsSubmitting(true);

        console.log("Fetching recipe with ID:", id);
        const recipe = await api.recipes.getById(parseInt(id));

        if (recipe) {
          console.log("Recipe fetched:", recipe);
          console.log("Current user:", user);

          // Check if the user is the owner of the recipe
          if (user && recipe.userId === user.id) {
            console.log(
              "User is the owner of the recipe. User ID:",
              user.id,
              "Recipe user ID:",
              recipe.userId
            );
            // Format the data for the form
            setFormData({
              title: recipe.title || "",
              description: recipe.description || "",
              cookingTime: recipe.cookingTime || undefined,
              prepTime: recipe.prepTime || undefined,
              servingSize: recipe.servingSize || undefined,
              difficultyLevel: recipe.difficultyLevel || "",
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
            // Not the owner, show detailed error and redirect to recipe view
            console.error(
              `Permission denied: User ID ${user?.id} does not match recipe owner ID ${recipe.userId}`
            );
            setError(
              `You don't have permission to edit this recipe. Only the recipe creator can edit it.`
            );
            setTimeout(() => {
              navigate(`/app/recipe/${id}`);
            }, 3000);
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
        setIsSubmitting(false);
      }
    };

    fetchRecipe();
  }, [
    id,
    isAuthenticated,
    navigate,
    user,
    setFormData,
    setError,
    setIsSubmitting,
  ]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setError("Recipe ID is missing");
      return;
    }

    // Validate the form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for submission
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients
          .filter((ing) => ing.name.trim() !== "")
          .map((ing, index) => ({
            ...ing,
            orderIndex: index,
            quantity: ing.quantity
              ? parseFloat(ing.quantity.toString()) || 0
              : null,
          })),
        instructions: formData.instructions.filter(
          (inst) => inst.description.trim() !== ""
        ),
      };

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

      // Submit the recipe update
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

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-700 mb-4">
            You need to be logged in to edit a recipe.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show a prominent error message if permission is denied
  if (error && error.includes("permission")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-400 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-700 mb-4">
            Permission Denied
          </h1>
          <div className="text-red-700 mb-6">
            <p className="mb-2">{error}</p>
            <p>You will be redirected to the recipe page shortly.</p>
          </div>
          <button
            onClick={() => navigate(`/app/recipe/${id}`)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Go to Recipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <RecipeForm
      formData={formData}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      handleCheckboxChange={handleCheckboxChange}
      handleIngredientChange={handleIngredientChange}
      handleInstructionChange={handleInstructionChange}
      addIngredient={addIngredient}
      removeIngredient={removeIngredient}
      addInstruction={addInstruction}
      removeInstruction={removeInstruction}
      addCategory={addCategory}
      removeCategory={removeCategory}
      addTag={addTag}
      removeTag={removeTag}
      setFormData={setFormData}
      setError={setError}
      setSuccess={setSuccess}
      submitButtonText="Update Recipe"
    />
  );
}
