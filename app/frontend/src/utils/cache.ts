interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  /**
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.defaultTTL);
    
    this.storage.set(key, {
      data,
      timestamp,
      expiresAt,
    });
  }
  
  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item is expired
    if (Date.now() > item.expiresAt) {
      this.storage.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  /**
   * Check if an item exists in the cache and is not expired
   * @param key Cache key
   * @returns True if item exists and is not expired
   */
  has(key: string): boolean {
    const item = this.storage.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check if item is expired
    if (Date.now() > item.expiresAt) {
      this.storage.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.storage.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.storage.clear();
  }
  
  /**
   * Clear expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.storage.entries()) {
      if (now > item.expiresAt) {
        this.storage.delete(key);
      }
    }
  }
  
  /**
   * Get the number of items in the cache
   */
  get size(): number {
    return this.storage.size;
  }
}

// Create a singleton instance
export const cache = new Cache();
