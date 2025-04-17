import { Recipe, RecipeFormData } from "../types/Recipe";

// API base URL - using the Vite proxy to avoid CORS issues
const API_BASE_URL = "/api";

// Default headers for JSON requests
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Store the auth token
let authToken = "";

// Function to set the auth token
const setAuthToken = (token: string) => {
  console.log(
    `Setting auth token: ${token ? "[token set]" : "[token cleared]"}`
  );
  authToken = token;
};

// Function to get headers with auth token if available
const getHeaders = () => {
  const headers = { ...defaultHeaders };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  console.log(`API response status: ${response.status} ${response.statusText}`);
  console.log(
    `Response headers:`,
    Object.fromEntries([...response.headers.entries()])
  );

  // Clone the response so we can read it multiple times if needed
  const clonedResponse = response.clone();

  // Try to get the response text for debugging
  let responseText = "";
  try {
    responseText = await clonedResponse.text();
    console.log(
      `Response text: ${responseText.substring(0, 500)}${
        responseText.length > 500 ? "..." : ""
      }`
    );
  } catch (error) {
    console.error("Could not read response text:", error);
  }

  // Handle 401 Unauthorized before trying to parse JSON
  if (response.status === 401) {
    console.error("Authentication error: Unauthorized");
    throw {
      status: 401,
      message: "You are not authorized to access this resource",
      responseText,
    };
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    console.error("Authentication error: Forbidden");
    throw {
      status: 403,
      message: "You do not have permission to access this resource",
      responseText,
    };
  }

  // Handle 400 Bad Request - try to get validation errors
  if (response.status === 400) {
    console.error("Validation error: Bad Request");
    try {
      // Try to parse the response text as JSON
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Could not parse error response as JSON:", jsonError);
        throw {
          status: 400,
          message: "Invalid request data",
          responseText,
        };
      }

      console.log("Validation error details:", errorData);
      throw {
        status: 400,
        message: errorData.error || "Invalid request data",
        details: errorData.details || {},
        responseText,
        errorData,
      };
    } catch (parseError) {
      // If we can't parse the error response
      console.error("Error parsing validation error:", parseError);
      throw {
        status: 400,
        message: "Invalid request data",
        responseText,
        parseError,
      };
    }
  }

  try {
    // Try to parse the response text as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Could not parse response as JSON:", jsonError);
      throw {
        status: response.status,
        message: "Invalid JSON response from server",
        responseText,
      };
    }

    if (!response.ok) {
      console.error(
        `API error: ${response.status} - ${data.error || "Unknown error"}`
      );
      throw {
        status: response.status,
        message: data.error || "An error occurred",
        data,
        responseText,
      };
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Invalid JSON response
      console.error("Invalid JSON response from API:", error);
      throw {
        status: response.status,
        message: "Invalid response from server",
        originalError: error,
        responseText,
      };
    }
    throw error;
  }
};

// API client with methods for different endpoints
export const api = {
  // Auth token management
  setAuthToken,
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      try {
        console.log("API login called with email:", email);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: defaultHeaders, // No auth token needed for login
          body: JSON.stringify({ email, password }),
        });

        console.log("Login API response status:", response.status);
        const data = await handleResponse(response);
        console.log("Login API parsed response:", data);
        return data;
      } catch (error) {
        console.error("Error in API login:", error);
        throw error;
      }
    },

    register: async (userData: {
      username: string;
      email: string;
      password: string;
      displayName?: string;
    }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: defaultHeaders, // No auth token needed for registration
          body: JSON.stringify(userData),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error in API register:", error);
        throw error;
      }
    },

    logout: async () => {
      // JWT is stateless, so we don't need to call the backend
      // Just return a successful response
      console.log("API logout called (no backend call needed for JWT)");
      return { success: true };
    },

    me: async () => {
      try {
        console.log("Checking authentication status...");
        // Only make the request if we have a token
        if (!authToken) {
          console.log("No auth token available, skipping auth check");
          return { user: null };
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getHeaders(),
        });

        console.log("Auth status response:", response.status);
        if (response.status === 401) {
          console.log("User is not authenticated");
          return { user: null };
        }

        const data = await handleResponse(response);
        console.log("Auth status data:", data);
        return data;
      } catch (error) {
        console.error("Error checking auth status:", error);
        // Don't throw the error, just return null user
        // This prevents the auth context from clearing localStorage
        return { user: null };
      }
    },

    getUserProfile: async (username: string) => {
      try {
        console.log(`Fetching profile for user: ${username}`);
        const response = await fetch(
          `${API_BASE_URL}/auth/profile/${username}`,
          {
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        throw error;
      }
    },
  },

  // Recipe endpoints
  recipes: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      tag?: string;
    }) => {
      try {
        const queryParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
        }

        const query = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        console.log(`Fetching from: ${API_BASE_URL}/recipes${query}`);

        const response = await fetch(`${API_BASE_URL}/recipes${query}`, {
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error in getAll recipes:", error);
        throw error;
      }
    },

    getFollowing: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      tag?: string;
    }) => {
      try {
        const queryParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
        }

        const query = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        console.log(`Fetching from: ${API_BASE_URL}/recipes/following${query}`);

        const response = await fetch(
          `${API_BASE_URL}/recipes/following${query}`,
          {
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error in getFollowing recipes:", error);
        throw error;
      }
    },

    getById: async (id: number) => {
      try {
        console.log(`Fetching recipe with ID: ${id}`);
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error fetching recipe with ID ${id}:`, error);
        throw error;
      }
    },

    deleteById: async (id: number) => {
      try {
        console.log(`Deleting recipe with ID: ${id}`);
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error deleting recipe with ID ${id}:`, error);
        throw error;
      }
    },

    batchDelete: async (ids: number[]) => {
      try {
        console.log(`Batch deleting recipes with IDs: ${ids.join(", ")}`);
        const response = await fetch(`${API_BASE_URL}/recipes/batch-delete`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ ids }),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error batch deleting recipes:`, error);
        throw error;
      }
    },

    create: async (recipeData: Partial<Recipe> | RecipeFormData) => {
      try {
        console.log("Creating new recipe:", recipeData);

        // Log the exact request being sent
        const requestBody = JSON.stringify(recipeData);
        console.log("Request body being sent:", requestBody);
        console.log("Request headers:", getHeaders());

        const response = await fetch(`${API_BASE_URL}/recipes`, {
          method: "POST",
          headers: getHeaders(),
          body: requestBody,
        });

        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries([...response.headers.entries()])
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
      }
    },

    update: async (
      id: number,
      recipeData: Partial<Recipe> | RecipeFormData
    ) => {
      try {
        console.log(
          `Updating recipe ${id} with data:`,
          JSON.stringify(recipeData, null, 2)
        );

        // Sanitize the data before sending
        const sanitizedData = JSON.parse(JSON.stringify(recipeData));

        // Convert any null string fields to empty strings
        [
          "imageUrl",
          "thumbnailPath",
          "thumbnailUrl",
          "sourceUrl",
          "sourceType",
          "description",
        ].forEach((field) => {
          if (sanitizedData[field] === null) {
            console.log(`Converting null ${field} to empty string`);
            sanitizedData[field] = "";
          }
        });

        // Ensure ingredients don't have null fields
        if (sanitizedData.ingredients) {
          sanitizedData.ingredients = sanitizedData.ingredients.map((ing) => ({
            ...ing,
            notes: ing.notes === null ? "" : ing.notes,
            unit: ing.unit === null ? "" : ing.unit,
          }));
        }

        // Ensure instructions don't have null imageUrl
        if (sanitizedData.instructions) {
          sanitizedData.instructions = sanitizedData.instructions.map(
            (inst) => ({
              ...inst,
              imageUrl: inst.imageUrl === null ? "" : inst.imageUrl,
            })
          );
        }

        // Filter out null tags
        if (sanitizedData.tags) {
          sanitizedData.tags = sanitizedData.tags.filter((tag) => tag !== null);
        }

        console.log(
          `Sanitized data for recipe ${id}:`,
          JSON.stringify(sanitizedData, null, 2)
        );

        const requestBody = JSON.stringify(sanitizedData);
        console.log(`Request body for recipe ${id}:`, requestBody);

        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: requestBody,
        });

        console.log(
          `Update response status for recipe ${id}:`,
          response.status
        );

        // If response is not ok, try to get the response text for debugging
        if (!response.ok) {
          try {
            const responseText = await response.text();
            console.error(`Error response for recipe ${id}:`, responseText);
          } catch (textError) {
            console.error(
              `Could not get error response text for recipe ${id}:`,
              textError
            );
          }
        }

        return handleResponse(response);
      } catch (error) {
        console.error(`Error updating recipe ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error deleting recipe ${id}:`, error);
        throw error;
      }
    },

    like: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}/like`, {
          method: "POST",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error liking recipe ${id}:`, error);
        throw error;
      }
    },

    unlike: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}/like`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error unliking recipe ${id}:`, error);
        throw error;
      }
    },

    save: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}/save`, {
          method: "POST",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error saving recipe ${id}:`, error);
        throw error;
      }
    },

    unsave: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}/save`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error unsaving recipe ${id}:`, error);
        throw error;
      }
    },

    getComments: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}/comments`, {
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error getting comments for recipe ${id}:`, error);
        throw error;
      }
    },

    addComment: async (id: number, content: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}/comments`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ content }),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error adding comment to recipe ${id}:`, error);
        throw error;
      }
    },
  },

  // AI endpoints
  ai: {
    generateRecipe: async (prompt: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/ai/generate-recipe`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ prompt }),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error generating recipe:", error);
        throw error;
      }
    },

    enhanceDescription: async (description: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/ai/enhance-description`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ description }),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error enhancing description:", error);
        throw error;
      }
    },
  },

  // Import endpoints
  import: {
    fromUrl: async (url: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/import/url`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ url }),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error importing from URL:", error);
        throw error;
      }
    },
  },

  // Upload endpoints
  upload: {
    image: async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("image", file);

        // For FormData, we don't want to set Content-Type header
        // The browser will set it automatically with the correct boundary
        const headers: Record<string, string> = {};
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/upload/image`, {
          method: "POST",
          headers,
          body: formData,
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    },
  },

  // Notification endpoints
  notifications: {
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
          {
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
    },

    getUnreadCount: async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/unread-count`,
          {
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error fetching unread notification count:", error);
        throw error;
      }
    },

    markAsRead: async (id: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${id}/read`,
          {
            method: "PATCH",
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        throw error;
      }
    },

    markAllAsRead: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
          method: "PATCH",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
      }
    },

    delete: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error(`Error deleting notification ${id}:`, error);
        throw error;
      }
    },

    getPreferences: async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/preferences`,
          {
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        throw error;
      }
    },

    updatePreferences: async (preferences: { [key: string]: boolean }) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/preferences`,
          {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(preferences),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error updating notification preferences:", error);
        throw error;
      }
    },
  },

  // Collections API
  collections: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/collections`, {
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error fetching collections:", error);
        throw error;
      }
    },

    getById: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error fetching collection:", error);
        throw error;
      }
    },

    create: async (data: { name: string; description?: string }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/collections`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error creating collection:", error);
        throw error;
      }
    },

    update: async (
      id: number,
      data: { name?: string; description?: string }
    ) => {
      try {
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error updating collection:", error);
        throw error;
      }
    },

    delete: async (id: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        return handleResponse(response);
      } catch (error) {
        console.error("Error deleting collection:", error);
        throw error;
      }
    },

    addRecipe: async (collectionId: number, recipeId: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/collections/${collectionId}/recipes`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ recipeId }),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error adding recipe to collection:", error);
        throw error;
      }
    },

    removeRecipe: async (collectionId: number, recipeId: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/collections/${collectionId}/recipes/${recipeId}`,
          {
            method: "DELETE",
            headers: getHeaders(),
          }
        );

        return handleResponse(response);
      } catch (error) {
        console.error("Error removing recipe from collection:", error);
        throw error;
      }
    },
  },
};
