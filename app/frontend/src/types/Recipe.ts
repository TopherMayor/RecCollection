// Recipe-related interfaces

export interface Ingredient {
  id?: number;
  name: string;
  quantity: string | number;
  unit: string;
  notes?: string;
  orderIndex?: number;
}

export interface Instruction {
  id?: number;
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: "easy" | "medium" | "hard" | "";
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
  userId?: number;
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeFormData {
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

export interface RecipeListItem {
  id: number;
  title: string;
  description: string;
  userId: number;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceType?: string;
  isPrivate?: boolean;
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ImportedRecipe {
  title: string;
  description?: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
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
  screenshots?: string[];
}
