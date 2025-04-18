import { HTTPException } from "hono/http-exception";
import type { RecipeInput } from "./recipe.service.ts";
import { YoutubeTranscript } from "youtube-transcript";
import fetch from "node-fetch";
import "dotenv/config";
import { WebScraperService } from "./web-scraper.service.ts";
import { createDefaultThumbnail } from "../utils/image.ts";

// Response wrapper interface for AI service calls
interface AIResponseWrapper<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    type: string;
    details?: any;
  };
}

// API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Use OpenRouter's Quasar Alpha or Optimus Alpha models as preferred by the user
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemini-2.5-pro-exp-03-25:free"; // Quasar Alpha
const OPENROUTER_FALLBACK_MODEL =
  process.env.OPENROUTER_FALLBACK_MODEL || "google/gemini-2.0-flash-exp:free"; // Fallback model

// Google Gemini API configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Social media URL regex patterns
const YOUTUBE_REGEX = {
  STANDARD:
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i,
  SHORT: /(?:youtube\.com\/shorts\/)([^"&?\/ ]{11})/i,
  WATCH: /youtube\.com\/watch\?v=([^"&?\/ ]{11})/i,
  EMBED: /youtube\.com\/embed\/([^"&?\/ ]{11})/i,
  YOUTU_BE: /youtu\.be\/([^"&?\/ ]{11})/i,
};

const TIKTOK_REGEX = {
  STANDARD: /tiktok\.com\/@[^/]+\/video\/([0-9]+)/i,
  SHORT: /tiktok\.com\/t\/([a-zA-Z0-9]+)/i,
  USERNAME_VIDEO: /tiktok\.com\/@([^/]+)\/video\/([0-9]+)/i,
};

const INSTAGRAM_REGEX = {
  POST: /instagram\.com\/p\/([a-zA-Z0-9_-]+)/i,
  REEL: /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i,
  STORIES: /instagram\.com\/stories\/([^/]+)\/([0-9]+)/i,
};

// Define the supported social media platforms
export type SocialMediaPlatform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "unknown";

// Input for the recipe parser
export interface SocialMediaParseInput {
  url: string;
  platform?: SocialMediaPlatform;
  userId: number;
}

// AI Parser Service
export class AIParserService {
  private webScraper: WebScraperService;

  constructor() {
    this.webScraper = new WebScraperService();
  }

  // Enhanced utility function for safe JSON parsing with multiple fallback mechanisms
  private safeJsonParse(text: string): AIResponseWrapper<any> {
    // Clean up the text to ensure it's valid JSON
    let cleanedText = text.replace(/```json\n|```\n|```json|```/g, "").trim();

    // Log only a preview to avoid flooding logs
    const textPreview =
      cleanedText.length > 100
        ? cleanedText.substring(0, 100) +
          `... (total length: ${cleanedText.length})`
        : cleanedText;
    console.log("Attempting to parse JSON from text:", textPreview);

    try {
      // First attempt: direct JSON parsing
      const parsedJson = JSON.parse(cleanedText);

      // Validate the parsed data has expected structure
      if (this.validateRecipeStructure(parsedJson)) {
        return { success: true, data: parsedJson };
      } else {
        console.warn("Parsed JSON does not have the expected recipe structure");
      }
    } catch (initialParseError) {
      console.warn(
        "Initial JSON parse failed, trying regex extraction",
        initialParseError instanceof Error
          ? initialParseError.message
          : String(initialParseError)
      );
    }

    // Try multiple recovery strategies

    // Strategy 1: regex to find JSON object
    try {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0];
        const parsedJson = JSON.parse(extractedJson);

        if (this.validateRecipeStructure(parsedJson)) {
          console.log("Successfully parsed JSON using regex extraction");
          return { success: true, data: parsedJson };
        }
      }
    } catch (regexError) {
      console.warn(
        "Regex JSON extraction failed",
        regexError instanceof Error ? regexError.message : String(regexError)
      );
    }

    // Strategy 2: find first { and last }
    try {
      const firstBrace = cleanedText.indexOf("{");
      const lastBrace = cleanedText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        const potentialJson = cleanedText.substring(firstBrace, lastBrace + 1);
        const parsedJson = JSON.parse(potentialJson);

        if (this.validateRecipeStructure(parsedJson)) {
          console.log("Successfully parsed JSON using brace extraction");
          return { success: true, data: parsedJson };
        }
      }
    } catch (braceError) {
      console.warn(
        "Brace extraction JSON parsing failed",
        braceError instanceof Error ? braceError.message : String(braceError)
      );
    }

    // Strategy 3: Try to fix common JSON syntax errors
    try {
      console.log("Attempting to fix common JSON syntax errors");
      const fixedJson = this.fixCommonJsonErrors(cleanedText);
      const parsedJson = JSON.parse(fixedJson);

      if (this.validateRecipeStructure(parsedJson)) {
        console.log("Successfully parsed JSON after fixing syntax errors");
        return { success: true, data: parsedJson };
      }
    } catch (fixError) {
      console.warn(
        "Failed to fix JSON syntax errors",
        fixError instanceof Error ? fixError.message : String(fixError)
      );
    }

    // Strategy 4: Try to extract fields individually
    try {
      console.log("Attempting to extract recipe fields individually");
      const extractedRecipe = this.extractRecipeFields(cleanedText);

      if (extractedRecipe) {
        console.log("Successfully extracted recipe fields");
        return { success: true, data: extractedRecipe };
      }
    } catch (fieldExtractionError) {
      console.warn(
        "Failed to extract recipe fields",
        fieldExtractionError instanceof Error
          ? fieldExtractionError.message
          : String(fieldExtractionError)
      );
    }

    // All parsing attempts failed - return a structured error response
    return {
      success: false,
      error: {
        message:
          "Failed to parse JSON from AI response after multiple attempts",
        type: "json_parse_error",
        details: {
          textSample:
            cleanedText.substring(0, 200) +
            (cleanedText.length > 200 ? "..." : ""),
          timestamp: new Date().toISOString(),
          recoveryAttempted: true,
        },
      },
    };
  }

  // Validate that the parsed data has the expected recipe structure
  private validateRecipeStructure(data: any): boolean {
    // Check if data is an object
    if (!data || typeof data !== "object") return false;

    // Check for required recipe fields (at least one of these should exist)
    const requiredFields = ["title", "ingredients", "instructions"];
    return requiredFields.some((field) => field in data);
  }

  // Fix common JSON syntax errors
  private fixCommonJsonErrors(jsonString: string): string {
    let fixed = jsonString;

    // Replace single quotes with double quotes (but not within already valid double quotes)
    fixed = fixed.replace(
      /([{,][\s\n]*['"]?[\w]+['"]?[\s\n]*:)[\s\n]*'([^']*)'([\s\n]*[,}])/g,
      '$1"$2"$3'
    );

    // Add quotes to unquoted keys
    fixed = fixed.replace(/([{,][\s\n]*)([\w]+)([\s\n]*:)/g, '$1"$2"$3');

    // Fix trailing commas in objects and arrays
    fixed = fixed.replace(/,([\s\n]*[}\]])/g, "$1");

    // Add missing commas between elements
    fixed = fixed.replace(/("[\s\n]*)("[\s\n]*:)/g, "$1,$2");

    return fixed;
  }

  // Extract recipe fields from text that might not be valid JSON
  private extractRecipeFields(text: string): any | null {
    const recipe: any = {};

    // Extract title
    const titleMatch =
      text.match(/"title"[\s\n]*:[\s\n]*"([^"]+)"/i) ||
      text.match(/title[\s\n]*:[\s\n]*"([^"]+)"/i) ||
      text.match(/title[\s\n]*:[\s\n]*([^,\n}]+)/i);
    if (titleMatch && titleMatch[1]) recipe.title = titleMatch[1].trim();

    // Extract ingredients
    const ingredientsMatch =
      text.match(/"ingredients"[\s\n]*:[\s\n]*(\[[^\]]+\])/i) ||
      text.match(/ingredients[\s\n]*:[\s\n]*(\[[^\]]+\])/i);
    if (ingredientsMatch && ingredientsMatch[1]) {
      try {
        recipe.ingredients = JSON.parse(ingredientsMatch[1]);
      } catch {
        // If parsing fails, try to extract as array of strings
        const ingredientItems = ingredientsMatch[1].match(/"([^"]+)"/g);
        if (ingredientItems) {
          recipe.ingredients = ingredientItems.map((item) =>
            item.replace(/"/g, "")
          );
        } else {
          // If no ingredients found, add a placeholder
          recipe.ingredients = [
            "Ingredient information could not be extracted",
          ];
        }
      }
    }

    // Extract instructions
    const instructionsMatch =
      text.match(/"instructions"[\s\n]*:[\s\n]*(\[[^\]]+\])/i) ||
      text.match(/instructions[\s\n]*:[\s\n]*(\[[^\]]+\])/i);
    if (instructionsMatch && instructionsMatch[1]) {
      try {
        recipe.instructions = JSON.parse(instructionsMatch[1]);
      } catch {
        // If parsing fails, try to extract as array of strings
        const instructionItems = instructionsMatch[1].match(/"([^"]+)"/g);
        if (instructionItems) {
          recipe.instructions = instructionItems.map((item) =>
            item.replace(/"/g, "")
          );
        } else {
          // If no instructions found, add a placeholder
          recipe.instructions = [
            "Instruction information could not be extracted",
          ];
        }
      }
    }

    // Only return if we have at least title and either ingredients or instructions
    if (recipe.title && (recipe.ingredients || recipe.instructions)) {
      // Set defaults for missing fields
      if (!recipe.ingredients)
        recipe.ingredients = ["Ingredients could not be extracted"];
      if (!recipe.instructions)
        recipe.instructions = ["Instructions could not be extracted"];
      if (!recipe.description)
        recipe.description = `Recipe for ${recipe.title}`;

      return recipe;
    }

    return null;
  }

  // Create a safe response wrapper for AI calls
  private createErrorResponse(
    error: any,
    errorType: string
  ): AIResponseWrapper<any> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`AI service ${errorType} error:`, errorMessage);

    return {
      success: false,
      error: {
        message: errorMessage,
        type: errorType,
        details: error,
      },
    };
  }
  // Detect the platform from the URL
  detectPlatform(url: string): SocialMediaPlatform {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes("tiktok.com")) {
      return "tiktok";
    } else if (
      lowerUrl.includes("instagram.com") ||
      lowerUrl.includes("instagr.am")
    ) {
      return "instagram";
    } else if (
      lowerUrl.includes("youtube.com") ||
      lowerUrl.includes("youtu.be")
    ) {
      return "youtube";
    }

    return "unknown";
  }

  // Extract YouTube video ID from URL
  extractYouTubeVideoId(url: string): string {
    try {
      // Normalize the URL
      const normalizedUrl = url.trim();

      // Try each regex pattern
      let match;

      // Try standard YouTube URL format
      match = normalizedUrl.match(YOUTUBE_REGEX.STANDARD);
      if (match && match[1]) return match[1];

      // Try YouTube Shorts format
      match = normalizedUrl.match(YOUTUBE_REGEX.SHORT);
      if (match && match[1]) return match[1];

      // Try YouTube Watch format
      match = normalizedUrl.match(YOUTUBE_REGEX.WATCH);
      if (match && match[1]) return match[1];

      // Try YouTube Embed format
      match = normalizedUrl.match(YOUTUBE_REGEX.EMBED);
      if (match && match[1]) return match[1];

      // Try youtu.be format
      match = normalizedUrl.match(YOUTUBE_REGEX.YOUTU_BE);
      if (match && match[1]) return match[1];

      // If we get here, none of the patterns matched
      console.warn(`Could not extract YouTube video ID from URL: ${url}`);
      throw new HTTPException(400, { message: "Invalid YouTube URL format" });
    } catch (error) {
      // If there's any error in the regex matching, throw a more helpful error
      console.error(
        `Error extracting YouTube video ID from URL: ${url}`,
        error
      );
      throw new HTTPException(400, {
        message:
          "Invalid YouTube URL format. Please provide a valid YouTube video URL.",
        cause: error,
      });
    }
  }

  // Fetch YouTube video metadata (title, description, etc.)
  async fetchYouTubeMetadata(
    videoId: string,
    captureMultipleScreenshots: boolean = false
  ): Promise<{
    title: string;
    description: string;
    thumbnailUrl?: string;
    localThumbnailPath?: string;
    screenshotOptions?: { path: string; timestamp: number }[];
  }> {
    try {
      console.log(
        `AIParserService: Fetching metadata for YouTube video ID: ${videoId}`
      );

      let oEmbedData = null;
      let localThumbnailPath: string | undefined = undefined;
      let thumbnailUrl: string | undefined = undefined;
      let screenshotOptions: { path: string; timestamp: number }[] | undefined;

      // First try using oEmbed API
      try {
        console.log(
          `AIParserService: Trying YouTube oEmbed API for video ID: ${videoId}`
        );
        const response = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        if (response.ok) {
          oEmbedData = (await response.json()) as any;
          console.log(
            `AIParserService: Successfully fetched oEmbed data for video ID: ${videoId}`
          );
          console.log(
            `AIParserService: Thumbnail URL from oEmbed: ${oEmbedData.thumbnail_url}`
          );
        }
      } catch (oEmbedError) {
        console.warn(
          "AIParserService: oEmbed API failed, falling back to web scraper",
          oEmbedError instanceof Error
            ? oEmbedError.message
            : String(oEmbedError)
        );
      }

      // First try to download the thumbnail if available from oEmbed
      if (oEmbedData?.thumbnail_url) {
        try {
          console.log(
            `AIParserService: Found thumbnail URL from oEmbed: ${oEmbedData.thumbnail_url}`
          );
          const singleThumbnail = await this.webScraper.downloadThumbnail(
            oEmbedData.thumbnail_url
            // Not passing videoId to avoid screenshot capture
          );
          if (singleThumbnail) {
            localThumbnailPath = singleThumbnail;
            console.log(
              `AIParserService: Downloaded thumbnail to: ${localThumbnailPath}`
            );
          }
          // Store the thumbnail URL even if download fails
          thumbnailUrl = oEmbedData.thumbnail_url;
        } catch (error) {
          console.error("Error downloading thumbnail:", error);
          // Still store the thumbnail URL even if download fails
          thumbnailUrl = oEmbedData.thumbnail_url;
        }
      }

      // Only try to get screenshots if we don't have a thumbnail and screenshots are requested
      if (!localThumbnailPath && captureMultipleScreenshots) {
        // Get multiple screenshots
        try {
          const screenshots = await this.webScraper.captureVideoScreenshot(
            videoId,
            true
          );
          if (Array.isArray(screenshots)) {
            screenshotOptions = screenshots;
            // Use the first screenshot as the default
            if (screenshots.length > 0 && screenshots[0]?.path) {
              localThumbnailPath = screenshots[0].path;
              console.log(
                `AIParserService: Captured ${screenshots.length} screenshots for user selection`
              );
            }
          }
        } catch (error) {
          console.error("Error capturing video screenshots:", error);
        }
      }

      // If we still don't have a thumbnail, try to download it again (this is a fallback)
      if (!localThumbnailPath && oEmbedData?.thumbnail_url) {
        try {
          const singleThumbnail = await this.webScraper.downloadThumbnail(
            oEmbedData.thumbnail_url,
            videoId // Pass the videoId to enable screenshot capture
          );
          if (singleThumbnail) {
            localThumbnailPath = singleThumbnail;
            console.log(
              `AIParserService: Downloaded thumbnail to: ${localThumbnailPath}`
            );
          }
        } catch (error) {
          console.error("Error downloading thumbnail:", error);
        }
      }

      // If we still don't have a thumbnail, try to scrape YouTube
      if (!localThumbnailPath) {
        try {
          console.log("AIParserService: Trying to scrape YouTube for metadata");
          const scrapedData = await this.webScraper.scrapeYouTube(videoId);
          if (scrapedData.thumbnailUrl) {
            const singleThumbnail = await this.webScraper.downloadThumbnail(
              scrapedData.thumbnailUrl,
              videoId
            );
            if (singleThumbnail) {
              localThumbnailPath = singleThumbnail;
              console.log(
                `AIParserService: Downloaded scraped thumbnail to: ${localThumbnailPath}`
              );
            }
          }
        } catch (error) {
          console.error("Error scraping YouTube:", error);
        }
      }

      // If we still don't have a thumbnail, create a default one
      if (!localThumbnailPath) {
        try {
          console.warn(
            "AIParserService: Failed to get any thumbnail, creating default"
          );
          localThumbnailPath = await createDefaultThumbnail();
        } catch (error) {
          console.error("Error creating default thumbnail:", error);
        }
      }

      return {
        title: oEmbedData?.title || "YouTube Recipe",
        description: "Recipe video from YouTube",
        thumbnailUrl: thumbnailUrl || oEmbedData?.thumbnail_url,
        localThumbnailPath,
        screenshotOptions: captureMultipleScreenshots
          ? screenshotOptions
          : undefined,
      };
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error);
      return {
        title: "YouTube Recipe",
        description: "Recipe video from YouTube",
      };
    }
  }

  // Fetch YouTube video transcript
  async fetchYouTubeTranscript(videoId: string): Promise<string | null> {
    try {
      console.log(`Fetching transcript for YouTube video ID: ${videoId}`);

      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptItems || transcriptItems.length === 0) {
        console.warn("No transcript items found for video");
        return null;
      }

      // Combine all transcript items into a single text
      return transcriptItems.map((item) => item.text).join(" ");
    } catch (error) {
      console.error("Error fetching YouTube transcript:", error);
      // Instead of throwing an exception, return null to indicate no transcript is available
      return null;
    }
  }

  // Fetch YouTube video description from the page as a fallback
  async fetchYouTubeDescription(videoId: string): Promise<string | null> {
    try {
      console.log(
        `Attempting to fetch YouTube video description for ID: ${videoId}`
      );

      // Use the web scraper to get the video description
      const scrapedData = await this.webScraper.scrapeYouTube(videoId);

      if (scrapedData.description && scrapedData.description.trim() !== "") {
        return scrapedData.description;
      }

      // If scraping fails or returns empty description, use a placeholder
      return "This is a cooking video showing how to prepare a delicious recipe. The chef demonstrates cooking techniques and ingredients preparation.";
    } catch (error) {
      console.error("Error fetching YouTube description:", error);
      return "This appears to be a cooking video with a recipe demonstration.";
    }
  }

  // Extract TikTok video ID from URL
  extractTikTokVideoId(url: string): { videoId: string; username?: string } {
    // Try standard TikTok URL format
    let match = url.match(TIKTOK_REGEX.STANDARD);
    if (match && match[1]) {
      // Try to extract username as well
      const usernameMatch = url.match(TIKTOK_REGEX.USERNAME_VIDEO);
      return {
        videoId: match[1],
        username:
          usernameMatch && usernameMatch[1] ? usernameMatch[1] : undefined,
      };
    }

    // Try short URL format
    match = url.match(TIKTOK_REGEX.SHORT);
    if (match && match[1]) {
      return { videoId: match[1] };
    }

    throw new HTTPException(400, { message: "Invalid TikTok URL format" });
  }

  // Fetch TikTok video content
  async fetchTikTokContent(url: string): Promise<{
    content: string;
    thumbnailPath?: string;
    thumbnailUrl?: string;
  }> {
    try {
      console.log(`Fetching content from TikTok URL: ${url}`);

      // Extract video ID
      const { videoId, username } = this.extractTikTokVideoId(url);
      console.log(
        `Extracted TikTok video ID: ${videoId}, username: ${
          username || "unknown"
        }`
      );

      try {
        // Use web scraper to get TikTok content and download thumbnail
        const scrapedData = await this.webScraper.scrapeTikTok(
          videoId,
          username,
          true // Download thumbnail
        );

        // Construct a detailed description from the scraped data
        let content = `TikTok video: ${scrapedData.title}\n\n`;

        if (scrapedData.username) {
          content += `Creator: @${scrapedData.username}\n\n`;
        } else if (username) {
          content += `Creator: @${username}\n\n`;
        }

        if (scrapedData.description && scrapedData.description.trim() !== "") {
          content += `Description: ${scrapedData.description}\n\n`;
        }

        content +=
          "This appears to be a cooking video showing recipe preparation. ";
        content +=
          "The video likely shows ingredients being prepared and cooked, with step-by-step instructions.";

        return {
          content,
          thumbnailPath: scrapedData.localThumbnailPath,
          thumbnailUrl: scrapedData.thumbnailUrl,
        };
      } catch (scrapingError) {
        console.warn(
          "TikTok scraping failed, using fallback content",
          scrapingError
        );

        // Fallback to a generic description if scraping fails
        const fallbackContent = `TikTok video ${videoId} by ${
          username || "unknown user"
        }. This appears to be a cooking video showing a recipe preparation. The video shows ingredients being prepared and cooked, with step-by-step instructions.`;

        // Create a default thumbnail
        const defaultThumbnailPath = await createDefaultThumbnail();
        console.log(
          `AIParserService: Created default thumbnail for TikTok fallback: ${defaultThumbnailPath}`
        );

        return {
          content: fallbackContent,
          thumbnailPath: defaultThumbnailPath,
        };
      }
    } catch (error) {
      console.error("Error fetching TikTok content:", error);
      if (error instanceof HTTPException) {
        throw error;
      }

      // Create a default thumbnail before throwing the exception
      try {
        const defaultThumbnailPath = await createDefaultThumbnail();
        console.log(
          `AIParserService: Created default thumbnail for TikTok error: ${defaultThumbnailPath}`
        );

        // Return a basic result with the default thumbnail instead of throwing an exception
        return {
          content:
            "This appears to be a TikTok cooking video. The AI couldn't extract detailed information, but you can still create a recipe manually.",
          thumbnailPath: defaultThumbnailPath,
        };
      } catch (thumbnailError) {
        console.error("Error creating default thumbnail:", thumbnailError);
      }

      throw new HTTPException(500, {
        message: "Failed to fetch TikTok content",
      });
    }
  }

  // Extract Instagram post ID from URL
  extractInstagramPostId(url: string): {
    postId: string;
    type: "post" | "reel" | "story";
    username?: string;
  } {
    // Try post format
    let match = url.match(INSTAGRAM_REGEX.POST);
    if (match && match[1]) {
      return { postId: match[1], type: "post" };
    }

    // Try reel format
    match = url.match(INSTAGRAM_REGEX.REEL);
    if (match && match[1]) {
      return { postId: match[1], type: "reel" };
    }

    // Try stories format
    match = url.match(INSTAGRAM_REGEX.STORIES);
    if (match && match[1] && match[2]) {
      return { postId: match[2], type: "story", username: match[1] };
    }

    throw new HTTPException(400, { message: "Invalid Instagram URL format" });
  }

  // Fetch Instagram post content
  async fetchInstagramContent(url: string): Promise<{
    content: string;
    thumbnailPath?: string;
    thumbnailUrl?: string;
  }> {
    try {
      console.log(`Fetching content from Instagram URL: ${url}`);

      // Extract post ID and type
      const { postId, type, username } = this.extractInstagramPostId(url);
      console.log(
        `Extracted Instagram ${type} ID: ${postId}${
          username ? `, username: ${username}` : ""
        }`
      );

      try {
        // Use web scraper to get Instagram content and download thumbnail
        const scrapedData = await this.webScraper.scrapeInstagram(postId, true); // Download thumbnail

        // Construct a detailed description from the scraped data
        let content = `Instagram ${type}: ${scrapedData.title}\n\n`;

        if (scrapedData.username) {
          content += `Creator: @${scrapedData.username}\n\n`;
        } else if (username) {
          content += `Creator: @${username}\n\n`;
        }

        if (scrapedData.description && scrapedData.description.trim() !== "") {
          content += `Caption: ${scrapedData.description}\n\n`;
        }

        content += `This appears to be a food post showing a delicious recipe. `;
        content += `The post includes images of the finished dish and possibly step-by-step preparation instructions in the caption.`;

        return {
          content,
          thumbnailPath: scrapedData.localThumbnailPath,
          thumbnailUrl: scrapedData.thumbnailUrl,
        };
      } catch (scrapingError) {
        console.warn(
          "Instagram scraping failed, using fallback content",
          scrapingError
        );

        // Fallback to a generic description if scraping fails
        const fallbackContent = `Instagram ${type} with ID ${postId}${
          username ? ` by ${username}` : ""
        }. This appears to be a food post showing a delicious recipe. The post includes images of the finished dish and possibly step-by-step preparation instructions in the caption.`;

        // Create a default thumbnail
        const defaultThumbnailPath = await createDefaultThumbnail();
        console.log(
          `AIParserService: Created default thumbnail for Instagram fallback: ${defaultThumbnailPath}`
        );

        return {
          content: fallbackContent,
          thumbnailPath: defaultThumbnailPath,
        };
      }
    } catch (error) {
      console.error("Error fetching Instagram content:", error);
      if (error instanceof HTTPException) {
        throw error;
      }

      // Create a default thumbnail before throwing the exception
      try {
        const defaultThumbnailPath = await createDefaultThumbnail();
        console.log(
          `AIParserService: Created default thumbnail for Instagram error: ${defaultThumbnailPath}`
        );

        // Return a basic result with the default thumbnail instead of throwing an exception
        return {
          content:
            "This appears to be an Instagram food post. The AI couldn't extract detailed information, but you can still create a recipe manually.",
          thumbnailPath: defaultThumbnailPath,
        };
      } catch (thumbnailError) {
        console.error("Error creating default thumbnail:", thumbnailError);
      }

      throw new HTTPException(500, {
        message: "Failed to fetch Instagram content",
      });
    }
  }

  // Extract content from social media URL
  async extractContent(
    url: string,
    platform: SocialMediaPlatform,
    captureMultipleScreenshots: boolean = true
  ): Promise<{
    content: string;
    thumbnailPath?: string;
    thumbnailUrl?: string;
    screenshotOptions?: { path: string; timestamp: number }[];
  }> {
    try {
      console.log(`Extracting content from ${platform} URL: ${url}`);

      if (platform === "youtube") {
        // Extract YouTube video ID
        const videoId = this.extractYouTubeVideoId(url);
        console.log(`Extracted YouTube video ID: ${videoId}`);

        // Fetch video metadata with multiple screenshots
        const metadata = await this.fetchYouTubeMetadata(
          videoId,
          captureMultipleScreenshots
        );

        // Fetch video transcript
        const transcript = await this.fetchYouTubeTranscript(videoId);

        // Fetch additional description if transcript is not available
        const additionalDescription = transcript
          ? ""
          : await this.fetchYouTubeDescription(videoId);

        // Build content string with available information
        let content = `Title: ${metadata.title}\n\nDescription: ${metadata.description}`;

        // Add transcript if available
        if (transcript) {
          content += `\n\nTranscript: ${transcript}`;
        } else {
          console.log("No transcript available, using additional description");
          content += `\n\nAdditional Context: ${
            additionalDescription ||
            "This appears to be a cooking video showing recipe preparation."
          }\n\nNote: This video does not have captions or a transcript available. The AI will attempt to generate a recipe based on the title and description.`;
        }

        return {
          content,
          thumbnailPath: metadata.localThumbnailPath,
          thumbnailUrl: metadata.thumbnailUrl,
          screenshotOptions: metadata.screenshotOptions,
        };
      } else if (platform === "tiktok") {
        // Fetch TikTok content
        return await this.fetchTikTokContent(url);
      } else if (platform === "instagram") {
        // Fetch Instagram content
        return await this.fetchInstagramContent(url);
      }

      throw new HTTPException(400, {
        message: `Unsupported platform: ${platform}`,
      });
    } catch (error) {
      console.error(`Error extracting content from ${platform}:`, error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: `Failed to extract content from ${platform}`,
      });
    }
  }

  // Call OpenRouter API to generate recipe from content
  async callOpenRouter(
    content: string,
    useFallbackModel: boolean = false
  ): Promise<AIResponseWrapper<any>> {
    try {
      // Select the model to use
      const model = useFallbackModel
        ? OPENROUTER_FALLBACK_MODEL
        : OPENROUTER_MODEL;
      console.log(`Calling OpenRouter API with model: ${model}...`);

      // Prepare the system prompt for recipe extraction
      const systemPrompt = `You are a helpful AI assistant that specializes in extracting structured recipe information from text.
      Your task is to extract recipe details from the provided content and format them according to the specified JSON structure.

      IMPORTANT RULES:
      1. Return ONLY valid JSON without any markdown formatting, explanations, or additional text
      2. Do not use code blocks or backticks in your response
      3. If you can't find specific information, make reasonable assumptions based on similar recipes
      4. Ensure all JSON fields match the exact format specified
      5. For numeric values, use numbers without quotes (e.g., 30 not "30")
      6. For string values, use proper escaping for quotes and special characters
      7. If the content has limited information, use the title and description to infer a plausible recipe
      8. When information is missing, create a reasonable recipe that matches the title and theme
      9. For YouTube videos without transcripts, focus on the title and any visible ingredients or steps mentioned in the description
      10. For TikTok videos, infer the recipe based on the limited information available, focusing on typical recipes that match the title
      11. For Instagram posts, create a recipe that would match the description of the food shown in the post
      12. Be creative but realistic when filling in missing details from social media posts`;

      // Prepare the user prompt with the content and desired output format
      const userPrompt = `Extract a complete recipe from the following content. The content may be from a YouTube video transcript, social media post, or other source.

Content: ${content}

Please extract and return ONLY a JSON object with the following structure:
{
  "title": "Recipe Title",
  "description": "Brief description of the recipe",
  "cookingTime": number (in minutes),
  "prepTime": number (in minutes),
  "servingSize": number,
  "difficultyLevel": "easy", "medium", or "hard",
  "ingredients": [
    {
      "name": "Ingredient name",
      "quantity": number,
      "unit": "unit of measurement",
      "orderIndex": number (starting from 1)
    }
  ],
  "instructions": [
    {
      "stepNumber": number (starting from 1),
      "description": "Step description"
    }
  ],
  "tags": ["tag1", "tag2"]
}

IMPORTANT: Return ONLY the JSON object with no explanations, markdown formatting, or code blocks. Do not wrap the JSON in backticks. The response should start with '{' and end with '}' and be valid parseable JSON.`;

      try {
        // Make the API request to OpenRouter
        console.log(
          `AIParserService: Making OpenRouter API request with model: ${model}`
        );
        console.log(
          `AIParserService: Using API key: ${
            OPENROUTER_API_KEY
              ? OPENROUTER_API_KEY.substring(0, 10) + "..."
              : "undefined"
          }`
        );

        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://reccollection.app", // Replace with your actual domain
            "X-Title": "RecCollection Recipe Parser",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2, // Lower temperature for more deterministic outputs
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(
            `AIParserService: OpenRouter API error: ${response.status}`,
            errorData
          );
          return this.createErrorResponse(
            new Error(`OpenRouter API error: ${response.status} ${errorData}`),
            "api_error"
          );
        }

        const data = await response.json();
        console.log(
          "AIParserService: OpenRouter API response:",
          JSON.stringify(data, null, 2)
        );

        // Check if there's an error in the response
        if (data.error) {
          console.error(
            `AIParserService: OpenRouter API returned error:`,
            data.error
          );
          return this.createErrorResponse(
            new Error(
              `OpenRouter API returned error: ${
                data.error.message || JSON.stringify(data.error)
              }`
            ),
            "api_error"
          );
        }

        // Extract the generated text from the response
        const generatedText = data.choices?.[0]?.message?.content;
        if (!generatedText) {
          console.error("AIParserService: No content in OpenRouter response");
          return this.createErrorResponse(
            new Error("No content in OpenRouter response"),
            "empty_response"
          );
        }

        console.log(
          "AIParserService: Successfully received response from OpenRouter"
        );
        // Parse the JSON using our safe parser
        return this.safeJsonParse(generatedText);
      } catch (apiError) {
        return this.createErrorResponse(apiError, "openrouter_api_error");
      }
    } catch (error) {
      return this.createErrorResponse(error, "openrouter_unexpected_error");
    }
  }

  // Call Google Gemini API to generate recipe from content
  async callGeminiAPI(content: string): Promise<AIResponseWrapper<any>> {
    try {
      console.log("Calling Google Gemini API...");

      if (!GOOGLE_API_KEY) {
        return this.createErrorResponse(
          new Error("Google Gemini API key not configured"),
          "api_key_missing"
        );
      }

      // Prepare the prompt for recipe extraction
      const prompt = `Extract a complete recipe from the following content. The content may be from a YouTube video transcript, social media post, or other source.

Content: ${content}

Please extract and return ONLY a JSON object with the following structure:
{
  "title": "Recipe Title",
  "description": "Brief description of the recipe",
  "cookingTime": number (in minutes),
  "prepTime": number (in minutes),
  "servingSize": number,
  "difficultyLevel": "easy", "medium", or "hard",
  "ingredients": [
    {
      "name": "Ingredient name",
      "quantity": number,
      "unit": "unit of measurement",
      "orderIndex": number (starting from 1)
    }
  ],
  "instructions": [
    {
      "stepNumber": number (starting from 1),
      "description": "Step description"
    }
  ],
  "tags": ["tag1", "tag2"]
}

IMPORTANT RULES:
1. Return ONLY valid JSON without any markdown formatting, explanations, or additional text
2. Do not use code blocks or backticks in your response
3. If you can't find specific information, make reasonable assumptions based on similar recipes
4. For numeric values, use numbers without quotes (e.g., 30 not "30")
5. For string values, use proper escaping for quotes and special characters
6. If the content has limited information, use the title and description to infer a plausible recipe
7. When information is missing, create a reasonable recipe that matches the title and theme
8. For YouTube videos without transcripts, focus on the title and any visible ingredients or steps mentioned in the description
9. For TikTok videos, infer the recipe based on the limited information available, focusing on typical recipes that match the title
10. For Instagram posts, create a recipe that would match the description of the food shown in the post
11. Be creative but realistic when filling in missing details from social media posts`;

      try {
        // Make the API request to Google Gemini
        const response = await fetch(
          `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2000,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          return this.createErrorResponse(
            new Error(
              `Google Gemini API error: ${response.status} ${errorData}`
            ),
            "api_error"
          );
        }

        const data = await response.json();
        console.log(
          "Google Gemini API response:",
          JSON.stringify(data, null, 2)
        );

        // Extract the generated text from the response
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
          return this.createErrorResponse(
            new Error("No content in Google Gemini response"),
            "empty_response"
          );
        }

        // Parse the JSON using our safe parser
        return this.safeJsonParse(generatedText);
      } catch (apiError) {
        return this.createErrorResponse(apiError, "gemini_api_error");
      }
    } catch (error) {
      return this.createErrorResponse(error, "gemini_unexpected_error");
    }
  }

  // Parse recipe using AI
  async parseRecipeWithAI(contentData: {
    content: string;
    thumbnailPath?: string;
  }): Promise<RecipeInput & { thumbnailPath?: string }> {
    try {
      console.log("AIParserService: Parsing recipe content with AI");

      // Extract content from contentData
      const { content, thumbnailPath } = contentData;

      // Log thumbnail path status
      if (thumbnailPath) {
        console.log(
          `AIParserService: Thumbnail path provided: ${thumbnailPath}`
        );
      } else {
        console.log(
          "AIParserService: No thumbnail path provided, will use default if needed"
        );
      }

      // Track errors for better fallback handling
      const errors: Array<{ service: string; error: any }> = [];

      // First try OpenRouter with preferred model
      if (OPENROUTER_API_KEY) {
        console.log(
          "AIParserService: Attempting to use OpenRouter with preferred model..."
        );
        // Call OpenRouter API to generate recipe with preferred model
        const preferredModelResponse = await this.callOpenRouter(
          content,
          false
        );

        if (preferredModelResponse.success && preferredModelResponse.data) {
          // Validate and format the parsed recipe
          const formattedRecipe = this.formatParsedRecipe(
            preferredModelResponse.data
          );
          // Add thumbnail path if available, otherwise get default
          if (thumbnailPath) {
            console.log(
              `AIParserService: Using provided thumbnail path: ${thumbnailPath}`
            );
            return { ...formattedRecipe, thumbnailPath };
          } else {
            console.log(
              "AIParserService: No thumbnail path available, using default"
            );
            const defaultThumbnail = await createDefaultThumbnail();
            return { ...formattedRecipe, thumbnailPath: defaultThumbnail };
          }
        } else {
          // Log the error for debugging
          console.warn(
            "AIParserService: OpenRouter API with preferred model failed:",
            preferredModelResponse.error?.message
          );
          errors.push({
            service: "openrouter_preferred",
            error: preferredModelResponse.error,
          });

          // Try with fallback model
          console.log(
            "AIParserService: Attempting to use OpenRouter with fallback model..."
          );
          // Call OpenRouter API to generate recipe with fallback model
          const fallbackModelResponse = await this.callOpenRouter(
            content,
            true
          );

          if (fallbackModelResponse.success && fallbackModelResponse.data) {
            // Validate and format the parsed recipe
            const formattedRecipe = this.formatParsedRecipe(
              fallbackModelResponse.data
            );
            // Add thumbnail path if available, otherwise get default
            if (thumbnailPath) {
              console.log(
                `AIParserService: Using provided thumbnail path: ${thumbnailPath}`
              );
              return { ...formattedRecipe, thumbnailPath };
            } else {
              console.log(
                "AIParserService: No thumbnail path available, using default"
              );
              const defaultThumbnail = await createDefaultThumbnail();
              return { ...formattedRecipe, thumbnailPath: defaultThumbnail };
            }
          } else {
            // Log the error for debugging
            console.warn(
              "OpenRouter API with fallback model failed:",
              fallbackModelResponse.error?.message
            );
            errors.push({
              service: "openrouter_fallback",
              error: fallbackModelResponse.error,
            });
          }
        }
      } else {
        console.warn(
          "OpenRouter API key not found, will try Google Gemini API"
        );
      }

      // Try Google Gemini API as a fallback
      if (GOOGLE_API_KEY) {
        console.log("Attempting to use Google Gemini API...");
        const geminiResponse = await this.callGeminiAPI(content);

        if (geminiResponse.success && geminiResponse.data) {
          const formattedRecipe = this.formatParsedRecipe(geminiResponse.data);
          // Add thumbnail path if available, otherwise get default
          if (thumbnailPath) {
            console.log(
              `AIParserService: Using provided thumbnail path: ${thumbnailPath}`
            );
            return { ...formattedRecipe, thumbnailPath };
          } else {
            console.log(
              "AIParserService: No thumbnail path available, using default"
            );
            const defaultThumbnail = await createDefaultThumbnail();
            return { ...formattedRecipe, thumbnailPath: defaultThumbnail };
          }
        } else {
          // Log the error for debugging
          console.warn(
            "Google Gemini API failed:",
            geminiResponse.error?.message
          );
          errors.push({
            service: "gemini",
            error: geminiResponse.error,
          });
        }
      } else {
        console.warn("Google Gemini API key not found");
      }

      // If we have JSON parsing errors, try to extract basic recipe info
      const hasJsonParsingError = errors.some(
        (e) =>
          e.error?.type === "json_parse_error" ||
          (e.error?.message &&
            (e.error.message.includes("JSON") ||
              e.error.message.includes("parse")))
      );

      if (hasJsonParsingError) {
        console.warn(
          "JSON parsing errors detected, attempting to extract basic recipe information"
        );
        // Try to extract basic recipe information from the content
        const basicRecipe = this.extractBasicRecipeInfo(contentData.content);
        // Add thumbnail path if available, otherwise get default
        if (contentData.thumbnailPath) {
          console.log(
            `AIParserService: Using provided thumbnail path for basic recipe: ${contentData.thumbnailPath}`
          );
          return { ...basicRecipe, thumbnailPath: contentData.thumbnailPath };
        } else {
          console.log(
            "AIParserService: No thumbnail path available for basic recipe, using default"
          );
          const defaultThumbnail = await createDefaultThumbnail();
          return { ...basicRecipe, thumbnailPath: defaultThumbnail };
        }
      }

      // If all APIs fail, use mock data but preserve the real thumbnail if available
      console.warn(
        "AIParserService: ⚠️ All AI APIs failed, using MOCK RECIPE DATA ⚠️"
      );
      console.error(
        "AIParserService: Errors encountered:",
        JSON.stringify(errors, null, 2)
      );

      // Get mock recipe data
      const mockRecipe = this.getMockRecipe(content);

      // Add a flag to indicate this is mock data
      mockRecipe.isMockData = true;

      // Add a note to the description to indicate this is mock data
      if (mockRecipe.description) {
        mockRecipe.description = `[NOTE: This is mock recipe data due to AI service failure] ${mockRecipe.description}`;
      } else {
        mockRecipe.description =
          "[NOTE: This is mock recipe data due to AI service failure]";
      }

      // Add thumbnail path if available, otherwise get default
      if (thumbnailPath) {
        console.log(
          `AIParserService: ✅ Using REAL thumbnail path for mock recipe: ${thumbnailPath}`
        );
        return { ...mockRecipe, thumbnailPath };
      } else {
        console.log(
          "AIParserService: No thumbnail path available for mock recipe, using default"
        );
        const defaultThumbnail = await createDefaultThumbnail();
        return { ...mockRecipe, thumbnailPath: defaultThumbnail };
      }
    } catch (error) {
      console.error("Unexpected error parsing recipe with AI:", error);

      // Fallback to mock data in case of unexpected errors
      console.log("Falling back to mock recipe data due to unexpected error");
      const mockRecipe = this.getMockRecipe(contentData.content);
      // Add thumbnail path if available
      return { ...mockRecipe, thumbnailPath: contentData.thumbnailPath };
    }
  }

  // Format and validate the parsed recipe
  formatParsedRecipe(parsedRecipe: any): RecipeInput {
    // Ensure all required fields are present
    const recipe: RecipeInput = {
      title: parsedRecipe.title || "Untitled Recipe",
      description: parsedRecipe.description || "",
      cookingTime: parsedRecipe.cookingTime
        ? Number(parsedRecipe.cookingTime)
        : undefined,
      prepTime: parsedRecipe.prepTime
        ? Number(parsedRecipe.prepTime)
        : undefined,
      servingSize: parsedRecipe.servingSize
        ? Number(parsedRecipe.servingSize)
        : undefined,
      difficultyLevel: parsedRecipe.difficultyLevel || undefined,
      isPrivate: false,
      ingredients: [],
      instructions: [],
      tags: parsedRecipe.tags || [],
    };

    // Format ingredients
    if (Array.isArray(parsedRecipe.ingredients)) {
      recipe.ingredients = parsedRecipe.ingredients.map(
        (ingredient: any, index: number) => ({
          name: ingredient.name || "Unknown ingredient",
          quantity: ingredient.quantity
            ? Number(ingredient.quantity)
            : undefined,
          unit: ingredient.unit || "",
          orderIndex: ingredient.orderIndex || index + 1,
          notes: ingredient.notes,
        })
      );
    }

    // Format instructions
    if (Array.isArray(parsedRecipe.instructions)) {
      recipe.instructions = parsedRecipe.instructions.map(
        (instruction: any, index: number) => ({
          stepNumber: instruction.stepNumber || index + 1,
          description: instruction.description || "Missing step",
          imageUrl: instruction.imageUrl,
        })
      );
    }

    return recipe;
  }

  // Extract basic recipe information from content
  extractBasicRecipeInfo(content: string): RecipeInput {
    try {
      console.log("Extracting basic recipe information from content");

      // Extract title from content
      let title = "Unknown Recipe";
      const titleMatch = content.match(/Title:\s*([^\n]+)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }

      // Extract description from content
      let description = "";
      const descMatch = content.match(/Description:\s*([^\n]+)/);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      }

      // Create a basic recipe with minimal information
      return {
        title,
        description,
        isPrivate: false,
        ingredients: [
          { name: "Ingredient 1", quantity: 1, unit: "", orderIndex: 1 },
          { name: "Ingredient 2", quantity: 1, unit: "", orderIndex: 2 },
        ],
        instructions: [
          {
            stepNumber: 1,
            description:
              "Step 1 - Please edit this recipe with the correct steps.",
          },
          {
            stepNumber: 2,
            description:
              "Step 2 - The AI couldn't fully parse the recipe details.",
          },
        ],
        tags: ["imported"],
      };
    } catch (error) {
      console.error("Error extracting basic recipe info:", error);
      // If all else fails, return a completely generic recipe
      return this.getMockRecipe();
    }
  }

  // Get mock recipe data for fallback
  getMockRecipe(content?: string): RecipeInput {
    // If content is provided, try to extract a title from it
    let title = "Homemade Pasta";
    let description =
      "A simple and delicious homemade pasta recipe perfect for any occasion.";

    if (content) {
      const titleMatch = content.match(/Title:\s*([^\n]+)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
        description = `Recipe based on ${title}`;
      }
    }

    return {
      title,
      description,
      cookingTime: 3,
      prepTime: 45,
      servingSize: 4,
      difficultyLevel: "medium",
      isPrivate: false,
      ingredients: [
        { name: "All-purpose flour", quantity: 2, unit: "cups", orderIndex: 1 },
        { name: "Eggs", quantity: 3, unit: "", orderIndex: 2 },
        { name: "Salt", quantity: 1, unit: "tsp", orderIndex: 3 },
      ],
      instructions: [
        { stepNumber: 1, description: "Mix flour and salt in a large bowl." },
        {
          stepNumber: 2,
          description: "Create a well in the center and add eggs.",
        },
        {
          stepNumber: 3,
          description: "Gradually mix together and knead until smooth.",
        },
        { stepNumber: 4, description: "Cover and let rest for 30 minutes." },
        {
          stepNumber: 5,
          description: "Roll out the dough and cut into desired shapes.",
        },
        {
          stepNumber: 6,
          description: "Cook in boiling water for 2-3 minutes until al dente.",
        },
      ],
      tags: ["pasta", "italian", "homemade"],
    };
  }

  // Main method to parse recipe from social media
  async parseRecipeFromSocialMedia(
    input: SocialMediaParseInput & { captureMultipleScreenshots?: boolean }
  ): Promise<{
    recipe: RecipeInput & { sourceUrl: string; sourceType: string };
    screenshotOptions?: { path: string; timestamp: number }[];
  }> {
    try {
      // Detect platform if not provided
      const platform = input.platform || this.detectPlatform(input.url);

      if (platform === "unknown") {
        throw new HTTPException(400, {
          message: "Unsupported social media platform",
        });
      }

      try {
        // Extract content from the social media post
        const contentData = await this.extractContent(
          input.url,
          platform,
          input.captureMultipleScreenshots
        );

        // Parse the recipe using AI
        const parsedRecipe = await this.parseRecipeWithAI(contentData);

        // Add source information
        return {
          recipe: {
            ...parsedRecipe,
            sourceUrl: input.url,
            sourceType: platform,
          },
          screenshotOptions: contentData.screenshotOptions,
        };
      } catch (contentError) {
        console.error(`Error processing ${platform} content:`, contentError);

        // Create a basic recipe with minimal information from the URL
        const basicRecipe = {
          title: `Recipe from ${platform}`,
          description: `This recipe was imported from ${platform} but could not be fully parsed. Please edit it to add the correct details.`,
          isPrivate: false,
          ingredients: [
            { name: "Ingredient 1", quantity: 1, unit: "", orderIndex: 1 },
            { name: "Ingredient 2", quantity: 1, unit: "", orderIndex: 2 },
          ],
          instructions: [
            {
              stepNumber: 1,
              description: `Step 1 - Please edit this recipe with the correct steps. The original content from ${platform} could not be processed.`,
            },
            {
              stepNumber: 2,
              description:
                "Step 2 - The AI couldn't fully parse the recipe details.",
            },
          ],
          tags: ["imported", platform],
          sourceUrl: input.url,
          sourceType: platform,
        };

        return {
          recipe: basicRecipe,
          screenshotOptions: [],
        };
      }
    } catch (error) {
      console.error("Error parsing recipe from social media:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      // Log the detailed error but only send a generic message to the client
      console.error(
        "Detailed error:",
        error instanceof Error ? error.message : String(error)
      );
      throw new HTTPException(500, {
        message: "Failed to parse recipe from social media",
      });
    }
  }

  // In a real implementation, you would add methods to integrate with OpenAI or other AI services
  // For example:
  /*
  async callOpenAI(content: string): Promise<any> {
    // Call OpenAI API to analyze the content
    // Parse the response into a structured recipe
  }
  */

  // Cleanup resources
  async cleanup(): Promise<void> {
    try {
      // Close the browser instance in the web scraper
      await this.webScraper.closeBrowser();
      console.log("AI Parser Service cleanup completed");
    } catch (error) {
      console.error("Error during AI Parser Service cleanup:", error);
    }
  }
}
