import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent, CardHeader, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../context/RecipeContext';
import { useUI } from '../../context/UIContext';
import { aiService } from '../../api/ai';

// Ingredient type
interface IngredientInput {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  orderIndex: number;
  notes?: string;
}

// Instruction type
interface InstructionInput {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

export function CreateRecipePage() {
  const { user } = useAuth();
  const { createRecipe } = useRecipes();
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookingTime, setCookingTime] = useState<number | undefined>(undefined);
  const [prepTime, setPrepTime] = useState<number | undefined>(undefined);
  const [servingSize, setServingSize] = useState<number | undefined>(undefined);
  const [difficultyLevel, setDifficultyLevel] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { id: '1', name: '', quantity: undefined, unit: '', orderIndex: 1, notes: '' },
  ]);
  const [instructions, setInstructions] = useState<InstructionInput[]>([
    { id: '1', stepNumber: 1, description: '', imageUrl: '' },
  ]);
  const [categories, setCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Add ingredient
  const addIngredient = () => {
    const newOrderIndex = ingredients.length + 1;
    setIngredients([
      ...ingredients,
      {
        id: Date.now().toString(),
        name: '',
        quantity: undefined,
        unit: '',
        orderIndex: newOrderIndex,
        notes: '',
      },
    ]);
  };
  
  // Remove ingredient
  const removeIngredient = (id: string) => {
    if (ingredients.length === 1) {
      showToast('Recipe must have at least one ingredient', 'warning');
      return;
    }
    
    const newIngredients = ingredients.filter((ingredient) => ingredient.id !== id);
    // Update order indices
    const updatedIngredients = newIngredients.map((ingredient, index) => ({
      ...ingredient,
      orderIndex: index + 1,
    }));
    
    setIngredients(updatedIngredients);
  };
  
  // Update ingredient
  const updateIngredient = (id: string, field: keyof IngredientInput, value: any) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };
  
  // Add instruction
  const addInstruction = () => {
    const newStepNumber = instructions.length + 1;
    setInstructions([
      ...instructions,
      {
        id: Date.now().toString(),
        stepNumber: newStepNumber,
        description: '',
        imageUrl: '',
      },
    ]);
  };
  
  // Remove instruction
  const removeInstruction = (id: string) => {
    if (instructions.length === 1) {
      showToast('Recipe must have at least one instruction', 'warning');
      return;
    }
    
    const newInstructions = instructions.filter((instruction) => instruction.id !== id);
    // Update step numbers
    const updatedInstructions = newInstructions.map((instruction, index) => ({
      ...instruction,
      stepNumber: index + 1,
    }));
    
    setInstructions(updatedInstructions);
  };
  
  // Update instruction
  const updateInstruction = (id: string, field: keyof InstructionInput, value: any) => {
    setInstructions(
      instructions.map((instruction) =>
        instruction.id === id ? { ...instruction, [field]: value } : instruction
      )
    );
  };
  
  // Add tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim().toLowerCase();
    
    if (tags.includes(newTag)) {
      showToast('Tag already exists', 'warning');
      return;
    }
    
    setTags([...tags, newTag]);
    setTagInput('');
  };
  
  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  // Generate recipe name with AI
  const generateRecipeName = async () => {
    // Check if we have enough ingredients and instructions
    if (ingredients.filter(i => i.name.trim()).length === 0 || 
        instructions.filter(i => i.description.trim()).length === 0) {
      showToast('Please add some ingredients and instructions first', 'warning');
      return;
    }
    
    setIsGeneratingName(true);
    
    try {
      const response = await aiService.generateName({
        ingredients: ingredients.map(i => i.name).filter(Boolean),
        instructions: instructions.map(i => i.description).filter(Boolean),
        category: difficultyLevel || undefined
      });
      
      if (response.data?.name) {
        setTitle(response.data.name);
        showToast('Recipe name generated successfully', 'success');
      } else {
        showToast(response.error || 'Failed to generate recipe name', 'error');
      }
    } catch (error) {
      showToast('An error occurred while generating the recipe name', 'error');
    } finally {
      setIsGeneratingName(false);
    }
  };
  
  // Generate recipe description with AI
  const generateRecipeDescription = async () => {
    // Check if we have a title, ingredients, and instructions
    if (!title.trim() || 
        ingredients.filter(i => i.name.trim()).length === 0 || 
        instructions.filter(i => i.description.trim()).length === 0) {
      showToast('Please add a title, ingredients, and instructions first', 'warning');
      return;
    }
    
    setIsGeneratingDescription(true);
    
    try {
      const response = await aiService.generateDescription({
        name: title,
        ingredients: ingredients.map(i => i.name).filter(Boolean),
        instructions: instructions.map(i => i.description).filter(Boolean),
        category: difficultyLevel || undefined
      });
      
      if (response.data?.description) {
        setDescription(response.data.description);
        showToast('Recipe description generated successfully', 'success');
      } else {
        showToast(response.error || 'Failed to generate recipe description', 'error');
      }
    } catch (error) {
      showToast('An error occurred while generating the recipe description', 'error');
    } finally {
      setIsGeneratingDescription(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      newErrors.imageUrl = 'Image URL must be a valid URL';
    }
    
    // Validate ingredients
    const validIngredients = ingredients.filter((ingredient) => ingredient.name.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    
    // Validate instructions
    const validInstructions = instructions.filter((instruction) => instruction.description.trim());
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty ingredients and instructions
      const validIngredients = ingredients
        .filter((ingredient) => ingredient.name.trim())
        .map((ingredient) => ({
          name: ingredient.name.trim(),
          quantity: ingredient.quantity,
          unit: ingredient.unit?.trim() || undefined,
          orderIndex: ingredient.orderIndex,
          notes: ingredient.notes?.trim() || undefined,
        }));
      
      const validInstructions = instructions
        .filter((instruction) => instruction.description.trim())
        .map((instruction) => ({
          stepNumber: instruction.stepNumber,
          description: instruction.description.trim(),
          imageUrl: instruction.imageUrl?.trim() || undefined,
        }));
      
      const recipe = await createRecipe({
        title: title.trim(),
        description: description.trim() || undefined,
        cookingTime,
        prepTime,
        servingSize,
        difficultyLevel: difficultyLevel || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isPrivate,
        ingredients: validIngredients,
        instructions: validInstructions,
        categories: categories.length > 0 ? categories : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      
      if (recipe) {
        showToast('Recipe created successfully', 'success');
        navigate(`/recipes/${recipe.id}`);
      }
    } catch (error) {
      showToast('An error occurred while creating the recipe', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please log in to create recipes</h2>
          <Button onClick={() => navigate('/login')}>Log In</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Basic Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      id="title"
                      label="Recipe Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      error={errors.title}
                      placeholder="Enter recipe title"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRecipeName}
                    isLoading={isGeneratingName}
                    disabled={isGeneratingName}
                  >
                    Generate with AI
                  </Button>
                </div>
                
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your recipe"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRecipeDescription}
                    isLoading={isGeneratingDescription}
                    disabled={isGeneratingDescription}
                  >
                    Generate with AI
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    id="prep-time"
                    label="Prep Time (minutes)"
                    type="number"
                    min="0"
                    value={prepTime === undefined ? '' : prepTime}
                    onChange={(e) => setPrepTime(e.value === '' ? undefined : parseInt(e.target.value))}
                    error={errors.prepTime}
                  />
                  
                  <Input
                    id="cooking-time"
                    label="Cooking Time (minutes)"
                    type="number"
                    min="0"
                    value={cookingTime === undefined ? '' : cookingTime}
                    onChange={(e) => setCookingTime(e.value === '' ? undefined : parseInt(e.target.value))}
                    error={errors.cookingTime}
                  />
                  
                  <Input
                    id="serving-size"
                    label="Serving Size"
                    type="number"
                    min="1"
                    value={servingSize === undefined ? '' : servingSize}
                    onChange={(e) => setServingSize(e.value === '' ? undefined : parseInt(e.target.value))}
                    error={errors.servingSize}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="difficulty-level" className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty-level"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                    >
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    {errors.difficultyLevel && (
                      <p className="mt-1 text-sm text-red-600">{errors.difficultyLevel}</p>
                    )}
                  </div>
                  
                  <Input
                    id="image-url"
                    label="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    error={errors.imageUrl}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="is-private"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <label htmlFor="is-private" className="ml-2 block text-sm text-gray-900">
                    Make this recipe private (only visible to you)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Ingredients</h2>
                <Button type="button" variant="outline" onClick={addIngredient}>
                  Add Ingredient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.ingredients && (
                <p className="mb-4 text-sm text-red-600">{errors.ingredients}</p>
              )}
              
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-2">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <Input
                          id={`ingredient-name-${ingredient.id}`}
                          label="Ingredient"
                          value={ingredient.name}
                          onChange={(e) =>
                            updateIngredient(ingredient.id, 'name', e.target.value)
                          }
                          placeholder="e.g. Flour"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          id={`ingredient-quantity-${ingredient.id}`}
                          label="Quantity"
                          type="number"
                          min="0"
                          step="0.01"
                          value={ingredient.quantity === undefined ? '' : ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(
                              ingredient.id,
                              'quantity',
                              e.target.value === '' ? undefined : parseFloat(e.target.value)
                            )
                          }
                          placeholder="e.g. 2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          id={`ingredient-unit-${ingredient.id}`}
                          label="Unit"
                          value={ingredient.unit}
                          onChange={(e) =>
                            updateIngredient(ingredient.id, 'unit', e.target.value)
                          }
                          placeholder="e.g. cups"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          id={`ingredient-notes-${ingredient.id}`}
                          label="Notes"
                          value={ingredient.notes}
                          onChange={(e) =>
                            updateIngredient(ingredient.id, 'notes', e.target.value)
                          }
                          placeholder="e.g. sifted"
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-8">
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Instructions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Instructions</h2>
                <Button type="button" variant="outline" onClick={addInstruction}>
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.instructions && (
                <p className="mb-4 text-sm text-red-600">{errors.instructions}</p>
              )}
              
              <div className="space-y-6">
                {instructions.map((instruction) => (
                  <div key={instruction.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-lg font-medium">
                        {instruction.stepNumber}
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label
                          htmlFor={`instruction-${instruction.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Step {instruction.stepNumber}
                        </label>
                        <textarea
                          id={`instruction-${instruction.id}`}
                          rows={3}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={instruction.description}
                          onChange={(e) =>
                            updateInstruction(instruction.id, 'description', e.target.value)
                          }
                          placeholder={`Describe step ${instruction.stepNumber}`}
                          required
                        />
                      </div>
                      <Input
                        id={`instruction-image-${instruction.id}`}
                        label="Step Image URL (optional)"
                        value={instruction.imageUrl}
                        onChange={(e) =>
                          updateInstruction(instruction.id, 'imageUrl', e.target.value)
                        }
                        placeholder="https://example.com/step-image.jpg"
                      />
                    </div>
                    <div className="flex-shrink-0 pt-8">
                      <button
                        type="button"
                        onClick={() => removeInstruction(instruction.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Tags */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Tags</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      id="tag-input"
                      label="Add Tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="e.g. vegetarian"
                    />
                  </div>
                  <div className="pt-7">
                    <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/recipes')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Recipe
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
