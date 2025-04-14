import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useRecipeForm } from "../hooks/useRecipeForm";
import RecipeForm from "../components/recipe/RecipeForm";

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.name.trim() !== "").map((ing, index) => ({
          ...ing,
          orderIndex: index,
          quantity: ing.quantity ? parseFloat(ing.quantity.toString()) || 0 : null,
        })),
        instructions: formData.instructions.filter(inst => inst.description.trim() !== ""),
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
      
      // Submit the recipe
      const response = await api.recipes.create(recipeData);
      
      console.log("Recipe created successfully:", response);
      setSuccess("Recipe created successfully!");
      
      // Redirect to the recipe detail page after a short delay
      setTimeout(() => {
        navigate(`/app/recipe/${response.id}`);
      }, 1500);
    } catch (err: unknown) {
      console.error("Error creating recipe:", err);
      
      // Try to extract detailed error information
      let errorMessage = "Failed to create recipe. Please try again.";
      
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
            You need to be logged in to create a recipe.
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
      submitButtonText="Create Recipe"
    />
  );
}
