import { cache } from "../utils/cache";

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
  status?: number;
  cached?: boolean;
}

// API client options
export interface ApiClientOptions extends RequestInit {
  cache?: boolean;
  cacheTTL?: number;
  cacheKey?: string;
}

// API client function
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  // Extract cache options
  const {
    cache: useCache = false,
    cacheTTL,
    cacheKey,
    ...fetchOptions
  } = options;

  // Generate cache key
  const finalCacheKey =
    cacheKey || `${endpoint}:${JSON.stringify(fetchOptions)}`;

  // Check cache if enabled and it's a GET request
  if (useCache && (!options.method || options.method === "GET")) {
    const cachedResponse = cache.get<ApiResponse<T>>(finalCacheKey);
    if (cachedResponse) {
      return { ...cachedResponse, cached: true };
    }
  }

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Create request config
  const config = {
    ...fetchOptions,
    headers,
  };

  try {
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Parse response as JSON
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorResponse = {
        error: data.error || "An unexpected error occurred",
        message: data.message,
        success: false,
        status: response.status,
      };

      return errorResponse;
    }

    // Create successful response
    const successResponse = {
      data,
      success: true,
      status: response.status,
    };

    // Cache the response if enabled and it's a GET request
    if (useCache && (!options.method || options.method === "GET")) {
      cache.set(finalCacheKey, successResponse, cacheTTL);
    }

    return successResponse;
  } catch (error) {
    // Handle network errors
    return {
      error: "Network error",
      message: error instanceof Error ? error.message : "Unknown error",
      success: false,
      status: 0,
    };
  }
}
