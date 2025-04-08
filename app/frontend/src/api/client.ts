// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
  status?: number;
}

// API client function
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  // Create request config
  const config = {
    ...options,
    headers,
  };
  
  try {
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Parse response as JSON
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      return {
        error: data.error || 'An unexpected error occurred',
        message: data.message,
        success: false,
        status: response.status,
      };
    }
    
    // Return successful response
    return { 
      data, 
      success: true,
      status: response.status,
    };
  } catch (error) {
    // Handle network errors
    return {
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      status: 0,
    };
  }
}
