import React from "react";
import { RecipeFormData, Ingredient, Instruction } from "../../types/Recipe";
import {
  FormField,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Container,
  Heading,
  Text,
} from "../ui";
import IngredientList from "./IngredientList";
import InstructionList from "./InstructionList";
import ImageUploader from "./ImageUploader";
import TagsInput from "./TagsInput";

interface RecipeFormProps {
  formData: RecipeFormData;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIngredientChange: (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => void;
  handleInstructionChange: (
    index: number,
    field: keyof Instruction,
    value: string
  ) => void;
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
  const handleImageChange = (
    field: "imageUrl" | "thumbnailPath" | "thumbnailUrl",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container maxWidth="2xl" className="py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <Heading
          level="h1"
          size="2xl"
          weight="bold"
          className="text-gray-900 mb-4 sm:mb-6"
        >
          {submitButtonText === "Create Recipe"
            ? "Create New Recipe"
            : "Edit Recipe"}
        </Heading>

        {error && (
          <Card className="bg-red-100 border-red-400 text-red-700 mb-4 sm:mb-6">
            <CardBody>
              <Heading level="h4" size="lg" weight="bold" className="mb-1">
                Error
              </Heading>
              {error.includes("\n") ? (
                <div>
                  <Text>Please fix the following issues:</Text>
                  <ul className="list-disc pl-4 sm:pl-5 mt-2">
                    {error.split("\n").map(
                      (line, index) =>
                        line.trim() && (
                          <li key={index}>
                            <Text size="sm">{line}</Text>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              ) : (
                <Text>{error}</Text>
              )}
            </CardBody>
          </Card>
        )}

        {success && (
          <Card className="bg-green-100 border-green-400 text-green-700 mb-4 sm:mb-6">
            <CardBody>
              <Heading level="h4" size="lg" weight="bold" className="mb-1">
                Success
              </Heading>
              <Text>{success}</Text>
            </CardBody>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <Card shadow="md" padding="lg">
            <CardHeader>
              <Heading
                level="h2"
                size="xl"
                weight="semibold"
                className="text-gray-900"
              >
                Basic Information
              </Heading>
            </CardHeader>
            <CardBody>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <FormField
                    id="prepTime"
                    label="Preparation Time (minutes)"
                    type="number"
                    value={formData.prepTime}
                    onChange={handleInputChange}
                    placeholder="30"
                    min={0}
                    className="col-span-1"
                  />

                  <FormField
                    id="cookingTime"
                    label="Cooking Time (minutes)"
                    type="number"
                    value={formData.cookingTime}
                    onChange={handleInputChange}
                    placeholder="45"
                    min={0}
                    className="col-span-1"
                  />

                  <FormField
                    id="servingSize"
                    label="Serving Size"
                    type="number"
                    value={formData.servingSize}
                    onChange={handleInputChange}
                    placeholder="4"
                    min={1}
                    className="col-span-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    id="difficultyLevel"
                    label="Difficulty Level"
                    type="select"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="col-span-1"
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
                    className="col-span-1"
                  />
                </div>

                <FormField
                  id="sourceType"
                  label="Source Type"
                  type="select"
                  value={formData.sourceType}
                  onChange={handleInputChange}
                  className="max-w-xs sm:max-w-sm"
                >
                  <option value="">Select a source type</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website</option>
                  <option value="manual">Manual Entry</option>
                </FormField>

                <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
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
            </CardBody>
          </Card>

          {/* Ingredients */}
          <Card shadow="md" padding="lg">
            <CardBody>
              <IngredientList
                ingredients={formData.ingredients}
                onIngredientChange={handleIngredientChange}
                onAddIngredient={addIngredient}
                onRemoveIngredient={removeIngredient}
              />
            </CardBody>
          </Card>

          {/* Instructions */}
          <Card shadow="md" padding="lg">
            <CardBody>
              <InstructionList
                instructions={formData.instructions}
                onInstructionChange={handleInstructionChange}
                onAddInstruction={addInstruction}
                onRemoveInstruction={removeInstruction}
              />
            </CardBody>
          </Card>

          {/* Categories and Tags */}
          <Card shadow="md" padding="lg">
            <CardHeader>
              <Heading
                level="h2"
                size="xl"
                weight="semibold"
                className="text-gray-900"
              >
                Categories and Tags
              </Heading>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

              <div className="mt-3 sm:mt-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-700">
                    Make this recipe private (only visible to you)
                  </span>
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Submit Button */}
          <Card
            shadow="none"
            border={false}
            padding="none"
            className="flex justify-end"
          >
            <CardFooter className="pt-0 border-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
            </CardFooter>
          </Card>
        </form>
      </div>
    </Container>
  );
}
