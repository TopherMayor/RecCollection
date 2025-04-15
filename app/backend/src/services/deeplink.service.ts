import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";

// Deep link types
export type DeepLinkType = 
  | "recipe_import" 
  | "recipe_view" 
  | "profile_view" 
  | "search";

// Deep link data interface
export interface DeepLinkData {
  type: DeepLinkType;
  params: Record<string, string>;
  expiresAt?: Date;
}

// Deep link service
export class DeepLinkService {
  private pendingImports: Map<string, DeepLinkData>;
  private baseUrl: string;
  private appScheme: string;

  constructor() {
    this.pendingImports = new Map();
    this.baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    this.appScheme = process.env.APP_SCHEME || "reccollection";
  }

  // Create a deep link for recipe import
  createImportDeepLink(url: string, source: string): string {
    try {
      // Generate a unique token
      const token = nanoid(10);
      
      // Store the import data
      this.pendingImports.set(token, {
        type: "recipe_import",
        params: {
          url,
          source,
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      
      // Generate deep link URLs for different platforms
      const webUrl = `${this.baseUrl}/import?token=${token}`;
      const appUrl = `${this.appScheme}://import?token=${token}`;
      
      // Return both URLs
      return JSON.stringify({
        webUrl,
        appUrl,
        token,
      });
    } catch (error) {
      console.error("Error creating import deep link:", error);
      throw new HTTPException(500, {
        message: "An error occurred while creating import deep link",
      });
    }
  }

  // Get pending import data by token
  getPendingImport(token: string): DeepLinkData | null {
    try {
      // Get the import data
      const importData = this.pendingImports.get(token);
      
      // Check if import exists
      if (!importData) {
        return null;
      }
      
      // Check if import has expired
      if (importData.expiresAt && new Date() > importData.expiresAt) {
        this.pendingImports.delete(token);
        return null;
      }
      
      return importData;
    } catch (error) {
      console.error("Error getting pending import:", error);
      return null;
    }
  }

  // Delete pending import
  deletePendingImport(token: string): boolean {
    try {
      return this.pendingImports.delete(token);
    } catch (error) {
      console.error("Error deleting pending import:", error);
      return false;
    }
  }

  // Generate a universal link for sharing
  generateUniversalLink(path: string, params: Record<string, string> = {}): string {
    try {
      // Build query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      
      // Generate URL
      const url = `${this.baseUrl}/${path}${queryString ? `?${queryString}` : ""}`;
      
      return url;
    } catch (error) {
      console.error("Error generating universal link:", error);
      throw new HTTPException(500, {
        message: "An error occurred while generating universal link",
      });
    }
  }

  // Generate app-specific deep links
  generateAppDeepLinks(path: string, params: Record<string, string> = {}): Record<string, string> {
    try {
      // Build query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      
      // Generate URLs for different platforms
      const webUrl = `${this.baseUrl}/${path}${queryString ? `?${queryString}` : ""}`;
      const appUrl = `${this.appScheme}://${path}${queryString ? `?${queryString}` : ""}`;
      
      return {
        webUrl,
        appUrl,
        iosUrl: appUrl,
        androidUrl: appUrl,
      };
    } catch (error) {
      console.error("Error generating app deep links:", error);
      throw new HTTPException(500, {
        message: "An error occurred while generating app deep links",
      });
    }
  }
}
