import React from 'react';
import { Instruction } from '../../types/Recipe';

interface InstructionListProps {
  instructions: Instruction[];
  onInstructionChange: (index: number, field: keyof Instruction, value: string) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
  errors?: Record<string, string>;
}

export default function InstructionList({
  instructions,
  onInstructionChange,
  onAddInstruction,
  onRemoveInstruction,
  errors = {},
}: InstructionListProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
      
      {instructions.map((instruction, index) => (
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
                errors[`instructions[${index}].description`] ? "text-red-500" : ""
              }`}
            >
              Step Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={instruction.description}
              onChange={(e) =>
                onInstructionChange(index, 'description', e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe this step..."
              rows={3}
              required
            />
          </div>
          
          <div className="col-span-2 flex items-end justify-end space-x-1">
            <button
              type="button"
              onClick={onAddInstruction}
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
            
            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveInstruction(index)}
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
  );
}
