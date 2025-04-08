import { apiClient } from './client';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

// Auth service
export const authService = {
  // Register a new user
  async register(data: RegisterData) {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Login a user
  async login(data: LoginData) {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get current user
  async getCurrentUser() {
    return apiClient<User>('/auth/me');
  },
  
  // Update user profile
  async updateProfile(data: UpdateProfileData) {
    return apiClient<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Logout (client-side only)
  logout() {
    localStorage.removeItem('token');
  },
};
