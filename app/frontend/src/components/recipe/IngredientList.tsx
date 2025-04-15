import React from "react";
import { Ingredient } from "../../types/Recipe";

interface IngredientListProps {
  ingredients: Ingredient[];
  onIngredientChange: (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  errors?: Record<string, string>;
}

export default function IngredientList({
  ingredients,
  onIngredientChange,
  onAddIngredient,
  onRemoveIngredient,
  errors = {},
}: IngredientListProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-medium text-gray-900">
        Ingredients
      </h3>

      {ingredients.map((ingredient, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-2 sm:gap-4 items-start"
        >
          <div className="col-span-5">
            <label
              className={`block text-xs sm:text-sm font-medium text-gray-700 ${
                errors[`ingredients[${index}].name`] ? "text-red-500" : ""
              }`}
            >
              Ingredient{" "}
              {index === 0 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) =>
                onIngredientChange(index, "name", e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Flour"
              required={index === 0}
            />
          </div>

          <div className="col-span-2">
            <label
              className={`block text-xs sm:text-sm font-medium text-gray-700 ${
                errors[`ingredients[${index}].quantity`] ? "text-red-500" : ""
              }`}
            >
              Quantity
            </label>
            <input
              type="text"
              value={ingredient.quantity}
              onChange={(e) =>
                onIngredientChange(index, "quantity", e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="2"
            />
          </div>

          <div className="col-span-3">
            <label
              className={`block text-xs sm:text-sm font-medium text-gray-700 ${
                errors[`ingredients[${index}].unit`] ? "text-red-500" : ""
              }`}
            >
              Unit
            </label>
            <input
              type="text"
              value={ingredient.unit}
              onChange={(e) =>
                onIngredientChange(index, "unit", e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="cups"
            />
          </div>

          <div className="col-span-2 flex items-end justify-end space-x-1">
            <button
              type="button"
              onClick={onAddIngredient}
              className="inline-flex items-center p-1.5 sm:p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Add ingredient"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
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

            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveIngredient(index)}
                className="inline-flex items-center p-1.5 sm:p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Remove ingredient"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
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
  );
}
