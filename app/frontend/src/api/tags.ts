import { apiClient } from './client';
import { Tag } from './recipes';

// Types
export interface TagListResponse {
  tags: Tag[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TagWithCount extends Tag {
  count: number;
}

export interface PopularTagsResponse {
  tags: TagWithCount[];
}

// Tag service
export const tagService = {
  // Get all tags
  async getTags(page = 1, limit = 50) {
    return apiClient<TagListResponse>(`/tags?page=${page}&limit=${limit}`);
  },
  
  // Get popular tags
  async getPopularTags(limit = 20) {
    return apiClient<PopularTagsResponse>(`/tags/popular?limit=${limit}`);
  },
  
  // Get a tag by ID
  async getTag(id: number) {
    return apiClient<Tag>(`/tags/${id}`);
  },
  
  // Create a new tag
  async createTag(name: string) {
    return apiClient<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  
  // Delete a tag
  async deleteTag(id: number) {
    return apiClient<{ success: boolean }>(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};
