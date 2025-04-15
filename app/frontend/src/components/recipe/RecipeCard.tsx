import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Heading, Text, Image } from "../ui";

interface RecipeCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  username?: string;
  userId?: number;
  currentUserId?: number;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  username,
  userId,
  currentUserId,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  onDelete,
}) => {
  const isOwner = userId === currentUserId;

  const handleCardClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${isSelectionMode ? "cursor-pointer" : ""} ${
        isSelected ? "ring-2 ring-indigo-500" : ""
      }`}
      padding="none"
      shadow="md"
      hoverEffect={true}
      onClick={isSelectionMode ? handleCardClick : undefined}
    >
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect && onSelect(id)}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            aria-label={`Select recipe ${title}`}
          />
        </div>
      )}
      <div className="relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            className="w-full h-40 sm:h-48"
            objectFit="cover"
            aspectRatio="4:3"
            rounded="none"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
            <Text color="text-gray-400">No image</Text>
          </div>
        )}
        <CardBody className="p-3 sm:p-4">
          <Heading
            level="h2"
            size="xl"
            weight="bold"
            className="mb-1 sm:mb-2 line-clamp-1"
          >
            {title}
          </Heading>
          <Text className="text-gray-600 mb-3 sm:mb-4 line-clamp-2">
            {description || "No description available"}
          </Text>
          {username && (
            <Text size="xs" className="text-gray-500 mb-2">
              By: {username}
            </Text>
          )}
          {!isSelectionMode && (
            <div className="flex justify-between items-center">
              <Link
                to={`/app/recipe/${id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-medium"
              >
                View Recipe →
              </Link>
              {isOwner && (
                <button
                  onClick={handleDeleteClick}
                  className="text-red-600 hover:text-red-800 text-sm sm:text-base font-medium"
                  aria-label={`Delete recipe ${title}`}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </CardBody>
      </div>
    </Card>
  );
};

export default RecipeCard;
