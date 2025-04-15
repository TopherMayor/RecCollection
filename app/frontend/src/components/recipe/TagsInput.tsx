import React, { useState } from "react";

interface TagsInputProps {
  title: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder?: string;
  tagClassName?: string;
  containerClassName?: string;
}

export default function TagsInput({
  title,
  items,
  onAdd,
  onRemove,
  placeholder = "Add an item",
  tagClassName = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800",
  containerClassName = "",
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={containerClassName}>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>

      <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
        {items.map((item) => (
          <div key={item} className={tagClassName}>
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="ml-1 text-gray-500 hover:text-gray-700"
              aria-label={`Remove ${item}`}
            >
              <svg
                className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 block w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-r-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add
        </button>
      </div>
    </div>
  );
}
