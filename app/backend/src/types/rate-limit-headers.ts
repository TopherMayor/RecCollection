/**
 * Type definitions for standard rate limit headers
 * Based on RFC 6585 and common conventions
 */
export interface RateLimitHeaders {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
  "Retry-After"?: string;
}

export type RateLimitHeadersOverride = Partial<RateLimitHeaders>;
