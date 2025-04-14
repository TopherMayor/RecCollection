import React from 'react';
import { RecipeFormData } from '../../types/Recipe';
import FormField from '../form/FormField';
import IngredientList from './IngredientList';
import InstructionList from './InstructionList';
import ImageUploader from './ImageUploader';
import TagsInput from './TagsInput';

interface RecipeFormProps {
  formData: RecipeFormData;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIngredientChange: (index: number, field: string, value: string) => void;
  handleInstructionChange: (index: number, field: string, value: string) => void;
  addIngredient: () => void;
  removeIngredient: (index: number) => void;
  addInstruction: () => void;
  removeInstruction: (index: number) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<RecipeFormData>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  submitButtonText?: string;
}

export default function RecipeForm({
  formData,
  isSubmitting,
  error,
  success,
  handleSubmit,
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
  setFormData,
  setError,
  setSuccess,
  submitButtonText = "Create Recipe",
}: RecipeFormProps) {
  // Function to update image fields
  const handleImageChange = (field: 'imageUrl' | 'thumbnailPath' | 'thumbnailUrl', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {submitButtonText === "Create Recipe" ? "Create New Recipe" : "Edit Recipe"}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            {error.includes('\n') ? (
              <div>
                <p>Please fix the following issues:</p>
                <ul className="list-disc pl-5 mt-2">
                  {error.split('\n').map((line, index) => (
                    line.trim() && <li key={index}>{line}</li>
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
              <FormField
                id="title"
                label="Recipe Title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter recipe title"
                required
              />
              
              <FormField
                id="description"
                label="Description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your recipe"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  id="prepTime"
                  label="Preparation Time (minutes)"
                  type="number"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  placeholder="30"
                  min={0}
                />
                
                <FormField
                  id="cookingTime"
                  label="Cooking Time (minutes)"
                  type="number"
                  value={formData.cookingTime}
                  onChange={handleInputChange}
                  placeholder="45"
                  min={0}
                />
                
                <FormField
                  id="servingSize"
                  label="Serving Size"
                  type="number"
                  value={formData.servingSize}
                  onChange={handleInputChange}
                  placeholder="4"
                  min={1}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="difficultyLevel"
                  label="Difficulty Level"
                  type="select"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </FormField>
                
                <FormField
                  id="sourceUrl"
                  label="Source URL"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/original-recipe"
                />
              </div>
              
              <FormField
                id="sourceType"
                label="Source Type"
                type="select"
                value={formData.sourceType}
                onChange={handleInputChange}
              >
                <option value="">Select a source type</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="website">Website</option>
                <option value="manual">Manual Entry</option>
              </FormField>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recipe Image
                </h3>
                
                <ImageUploader
                  imageUrl={formData.imageUrl}
                  thumbnailPath={formData.thumbnailPath}
                  thumbnailUrl={formData.thumbnailUrl}
                  onImageChange={handleImageChange}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              </div>
            </div>
          </div>
          
          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <IngredientList
              ingredients={formData.ingredients}
              onIngredientChange={handleIngredientChange}
              onAddIngredient={addIngredient}
              onRemoveIngredient={removeIngredient}
            />
          </div>
          
          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <InstructionList
              instructions={formData.instructions}
              onInstructionChange={handleInstructionChange}
              onAddInstruction={addInstruction}
              onRemoveInstruction={removeInstruction}
            />
          </div>
          
          {/* Categories and Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Categories and Tags
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TagsInput
                title="Categories"
                items={formData.categories}
                onAdd={addCategory}
                onRemove={removeCategory}
                placeholder="Add a category"
                tagClassName="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
              />
              
              <TagsInput
                title="Tags"
                items={formData.tags}
                onAdd={addTag}
                onRemove={removeTag}
                placeholder="Add a tag"
                tagClassName="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              />
            </div>
            
            <div className="mt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Make this recipe private (only visible to you)
                </span>
              </label>
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
                  Submitting...
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
