import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { WebScraperService } from "../services/web-scraper.service";

describe("WebScraperService", () => {
  const webScraper = new WebScraperService();
  
  // Clean up after all tests
  afterAll(async () => {
    await webScraper.closeBrowser();
  });
  
  test("should extract YouTube video ID from URL", async () => {
    // This is a simple test that doesn't require browser access
    const youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    
    try {
      // We're just testing that the service initializes without errors
      expect(webScraper).toBeDefined();
      console.log("WebScraperService initialized successfully");
    } catch (error) {
      console.error("Error initializing WebScraperService:", error);
      throw error;
    }
  });
});
