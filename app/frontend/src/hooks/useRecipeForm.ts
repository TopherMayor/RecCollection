import { useState } from 'react';
import { RecipeFormData, Ingredient, Instruction } from '../types/Recipe';

interface UseRecipeFormProps {
  initialData?: RecipeFormData;
}

interface UseRecipeFormReturn {
  formData: RecipeFormData;
  setFormData: React.Dispatch<React.SetStateAction<RecipeFormData>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  success: string | null;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIngredientChange: (index: number, field: keyof Ingredient, value: string) => void;
  handleInstructionChange: (index: number, field: keyof Instruction, value: string) => void;
  addIngredient: () => void;
  removeIngredient: (index: number) => void;
  addInstruction: () => void;
  removeInstruction: (index: number) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

const defaultFormData: RecipeFormData = {
  title: "",
  description: "",
  cookingTime: undefined,
  prepTime: undefined,
  servingSize: undefined,
  difficultyLevel: "",
  imageUrl: "",
  thumbnailPath: "",
  thumbnailUrl: "",
  sourceUrl: "",
  sourceType: "",
  ingredients: [{ name: "", quantity: "", unit: "" }],
  instructions: [{ stepNumber: 1, description: "" }],
  categories: [],
  tags: [],
  isPrivate: false,
};

export function useRecipeForm({ initialData }: UseRecipeFormProps = {}): UseRecipeFormReturn {
  const [formData, setFormData] = useState<RecipeFormData>(initialData || defaultFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes for simple fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle ingredient changes
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    setFormData((prev) => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value,
      };
      return {
        ...prev,
        ingredients: updatedIngredients,
      };
    });
  };

  // Handle instruction changes
  const handleInstructionChange = (index: number, field: keyof Instruction, value: string) => {
    setFormData((prev) => {
      const updatedInstructions = [...prev.instructions];
      updatedInstructions[index] = {
        ...updatedInstructions[index],
        [field]: value,
      };
      return {
        ...prev,
        instructions: updatedInstructions,
      };
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
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Add a new instruction
  const addInstruction = () => {
    const nextStepNumber = formData.instructions.length + 1;
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, { stepNumber: nextStepNumber, description: "" }],
    }));
  };

  // Remove an instruction
  const removeInstruction = (index: number) => {
    if (formData.instructions.length <= 1) return;
    setFormData((prev) => {
      const updatedInstructions = prev.instructions.filter((_, i) => i !== index);
      // Renumber the steps
      return {
        ...prev,
        instructions: updatedInstructions.map((inst, i) => ({
          ...inst,
          stepNumber: i + 1,
        })),
      };
    });
  };

  // Add a category
  const addCategory = (category: string) => {
    if (!category.trim() || formData.categories.includes(category)) return;
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
  };

  // Remove a category
  const removeCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  // Add a tag
  const addTag = (tag: string) => {
    if (!tag.trim() || formData.tags.includes(tag)) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
  };

  // Remove a tag
  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Validate the form
  const validateForm = (): boolean => {
    // Reset error
    setError(null);

    // Check required fields
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }

    // Validate ingredients (remove empty ones)
    const validIngredients = formData.ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );

    if (validIngredients.length === 0) {
      setError("At least one ingredient is required");
      return false;
    }

    // Validate instructions (remove empty ones)
    const validInstructions = formData.instructions.filter(
      (inst) => inst.description.trim() !== ""
    );

    if (validInstructions.length === 0) {
      setError("At least one instruction step is required");
      return false;
    }

    return true;
  };

  // Reset the form
  const resetForm = () => {
    setFormData(initialData || defaultFormData);
    setError(null);
    setSuccess(null);
    setIsSubmitting(false);
  };

  return {
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
    resetForm,
  };
}
