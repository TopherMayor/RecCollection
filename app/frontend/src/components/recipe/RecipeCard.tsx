import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Heading, Text, Image } from "../ui";
import { formatDistanceToNow } from "date-fns";
import { Recipe as RecipeType } from "../../types/Recipe";

interface RecipeCardProps {
  // Option 1: Pass a complete recipe object
  recipe?: RecipeType;

  // Option 2: Pass individual properties
  id?: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  createdAt?: string;
  username?: string;
  userId?: number;
  currentUserId?: number;

  // Display options
  showAuthor?: boolean;
  showStats?: boolean;
  linkTo?: string;
  className?: string;

  // Selection mode options
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = (props) => {
  // Extract properties from either the recipe object or individual props
  const id = props.recipe?.id || props.id;
  const title = props.recipe?.title || props.title || "";
  const description = props.recipe?.description || props.description || "";
  const imageUrl = props.recipe?.imageUrl || props.imageUrl;
  const thumbnailUrl = props.recipe?.thumbnailUrl || props.thumbnailUrl;
  const thumbnailPath = props.recipe?.thumbnailPath || props.thumbnailPath;
  const createdAt = props.recipe?.createdAt || props.createdAt;
  const username = props.recipe?.user?.username || props.username;
  const userId = props.recipe?.userId || props.recipe?.user?.id || props.userId;
  const likesCount = props.recipe?.likesCount || 0;
  const commentsCount = props.recipe?.commentsCount || 0;

  // Options
  const {
    showAuthor = true,
    showStats = false,
    linkTo,
    className = "",
    currentUserId,
    isSelectionMode = false,
    isSelected = false,
    onSelect,
    onDelete,
  } = props;

  if (!id) {
    console.error("RecipeCard requires either a recipe object or an id prop");
    return null;
  }

  // Determine if the current user is the owner
  const isOwner = userId === currentUserId;

  // Determine the image to display
  let displayImage = thumbnailUrl || imageUrl || "/placeholder-recipe.jpg";

  // Handle thumbnailPath - ensure it has the correct base URL
  if (!displayImage && thumbnailPath) {
    if (thumbnailPath.startsWith("http")) {
      displayImage = thumbnailPath;
    } else {
      // Use proxy URL
      displayImage = thumbnailPath;
    }
  }

  // Format the date
  const formattedDate = createdAt
    ? formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
      })
    : "Recently";

  // Determine the link destination
  const destination = linkTo || `/app/recipe/${id}`;

  // Handle card click for selection mode
  const handleCardClick = () => {
    if (isSelectionMode && onSelect && id) {
      onSelect(id);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && id) {
      onDelete(id);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${isSelectionMode ? "cursor-pointer" : ""} ${
        isSelected ? "ring-2 ring-indigo-500" : ""
      } ${className}`}
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
            onChange={() => onSelect && id && onSelect(id)}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            aria-label={`Select recipe ${title}`}
          />
        </div>
      )}
      <div className="relative">
        {displayImage ? (
          <Image
            src={displayImage}
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
          {description && (
            <Text className="text-gray-600 mb-3 sm:mb-4 line-clamp-2">
              {description}
            </Text>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            {showAuthor && username && (
              <div className="flex items-center space-x-2">
                <span>{formattedDate}</span>
                <span>•</span>
                <span>by {username}</span>
              </div>
            )}

            {showStats && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{likesCount}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{commentsCount}</span>
                </div>
              </div>
            )}
          </div>

          {!isSelectionMode && (
            <div className="flex justify-between items-center mt-3">
              <Link
                to={destination}
                className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-medium"
              >
                View Recipe →
              </Link>
              {isOwner && onDelete && (
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
