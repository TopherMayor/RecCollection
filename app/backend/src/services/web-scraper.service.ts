import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import axios from "axios";
import { HTTPException } from "hono/http-exception";
import {
  downloadImage,
  isValidImageUrl,
  createDefaultThumbnail,
} from "../utils/image";

// We don't need to declare DOM types as they're available in the browser context during page.evaluate

/**
 * Web Scraper Service
 *
 * This service provides methods to scrape content from various social media platforms
 * as a fallback when APIs are not available or have limitations.
 */
export class WebScraperService {
  private browser: any = null;

  /**
   * Initialize the browser instance
   */
  private async initBrowser(): Promise<any> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    return this.browser;
  }

  /**
   * Close the browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape content from a YouTube video
   * @param videoId YouTube video ID
   * @param downloadThumbnail Whether to download the thumbnail
   */
  async scrapeYouTube(
    videoId: string,
    downloadThumbnail: boolean = false
  ): Promise<{
    title: string;
    description: string;
    thumbnailUrl?: string;
    localThumbnailPath?: string;
  }> {
    try {
      console.log(`Scraping YouTube video: ${videoId}`);
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Set a user agent to avoid being blocked
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      // Navigate to the YouTube video page
      await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for the title to be available
      await page.waitForSelector("h1.title", { timeout: 5000 }).catch(() => {});

      // Extract the video information
      const videoData = await page.evaluate(() => {
        const title =
          document.querySelector("h1.title")?.textContent?.trim() ||
          document
            .querySelector('meta[property="og:title"]')
            ?.getAttribute("content") ||
          "Unknown YouTube Video";

        // Try to get description from various possible elements
        let description = "";
        const descriptionElement =
          document.querySelector("#description-inline-expander") ||
          document.querySelector("#description") ||
          document.querySelector('meta[property="og:description"]');

        if (descriptionElement) {
          if (descriptionElement instanceof HTMLMetaElement) {
            description = descriptionElement.getAttribute("content") || "";
          } else {
            description = descriptionElement.textContent?.trim() || "";
          }
        }

        // Get thumbnail URL
        const thumbnailUrl =
          document
            .querySelector('meta[property="og:image"]')
            ?.getAttribute("content") || undefined;

        return { title, description, thumbnailUrl };
      });

      await page.close();

      // If we couldn't get the data from the page, try using the oEmbed API as a fallback
      if (!videoData.title || videoData.title === "Unknown YouTube Video") {
        const oEmbedData = await this.getYouTubeOEmbed(videoId);
        if (oEmbedData) {
          videoData.title = oEmbedData.title;
          if (!videoData.thumbnailUrl) {
            videoData.thumbnailUrl = oEmbedData.thumbnailUrl;
          }
        }
      }

      // Download the thumbnail if requested
      if (downloadThumbnail) {
        // Use our improved downloadThumbnail method that handles multiple strategies
        // It will try to download from URL first, then capture screenshots, then use default
        videoData.localThumbnailPath = await this.downloadThumbnail(
          videoData.thumbnailUrl,
          videoId // Pass the videoId to enable screenshot capture
        );
      }

      return videoData;
    } catch (error) {
      console.error("Error scraping YouTube:", error);
      throw new HTTPException(500, {
        message: "Failed to scrape YouTube video",
      });
    }
  }

  /**
   * Get YouTube video data using the oEmbed API
   * @param videoId YouTube video ID
   */
  private async getYouTubeOEmbed(videoId: string): Promise<{
    title: string;
    thumbnailUrl?: string;
  } | null> {
    try {
      const response = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      return {
        title: response.data.title,
        thumbnailUrl: response.data.thumbnail_url,
      };
    } catch (error) {
      console.error("Error getting YouTube oEmbed data:", error);
      return null;
    }
  }

  /**
   * Scrape content from a TikTok video
   * @param videoId TikTok video ID
   * @param username Optional TikTok username
   * @param downloadThumbnail Whether to download the thumbnail
   */
  async scrapeTikTok(
    videoId: string,
    username?: string,
    downloadThumbnail: boolean = false
  ): Promise<{
    title: string;
    description: string;
    thumbnailUrl?: string;
    localThumbnailPath?: string;
    username?: string;
  }> {
    try {
      console.log(`Scraping TikTok video: ${videoId}`);
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Set a user agent to avoid being blocked
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      // Construct the URL based on whether we have the username or not
      const url = username
        ? `https://www.tiktok.com/@${username}/video/${videoId}`
        : `https://www.tiktok.com/t/${videoId}`;

      // Navigate to the TikTok video page
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for the content to load
      await page
        .waitForSelector('meta[property="og:title"]', { timeout: 5000 })
        .catch(() => {});

      // Extract the video information
      const videoData = await page.evaluate(() => {
        // Get title and description from meta tags
        const title =
          document
            .querySelector('meta[property="og:title"]')
            ?.getAttribute("content") || "TikTok Video";
        const description =
          document
            .querySelector('meta[property="og:description"]')
            ?.getAttribute("content") || "";

        // Get thumbnail URL
        const thumbnailUrl =
          document
            .querySelector('meta[property="og:image"]')
            ?.getAttribute("content") || undefined;

        // Try to get username if not provided
        const usernameElement = document
          .querySelector('meta[property="og:url"]')
          ?.getAttribute("content");
        let username;
        if (usernameElement) {
          const usernameMatch = usernameElement.match(/@([^/]+)/);
          if (usernameMatch && usernameMatch[1]) {
            username = usernameMatch[1];
          }
        }

        return { title, description, thumbnailUrl, username };
      });

      await page.close();

      // Download the thumbnail if requested
      if (downloadThumbnail) {
        if (videoData.thumbnailUrl) {
          // If we have a thumbnail URL, try to download it
          videoData.localThumbnailPath = await this.downloadThumbnail(
            videoData.thumbnailUrl
          );
        } else {
          // If no thumbnail URL is available, try to capture a screenshot
          // We'll use the videoId as a unique identifier
          console.log(
            `WebScraperService: No thumbnail URL available for TikTok video ${videoId}, attempting to capture screenshot`
          );
          videoData.localThumbnailPath = await this.downloadThumbnail(
            undefined,
            videoId // Pass the videoId to enable screenshot capture
          );
        }
      }

      return videoData;
    } catch (error) {
      console.error("Error scraping TikTok:", error);

      // Return a basic result if scraping fails
      // Create a default thumbnail
      const defaultThumbnailPath = await createDefaultThumbnail();
      console.log(
        `WebScraperService: Created default thumbnail for failed TikTok scrape: ${defaultThumbnailPath}`
      );

      return {
        title: "TikTok Recipe Video",
        description: `TikTok video ${videoId}${
          username ? ` by @${username}` : ""
        }. This appears to be a cooking video showing recipe preparation.`,
        username,
        localThumbnailPath: defaultThumbnailPath,
      };
    }
  }

  /**
   * Scrape content from an Instagram post
   * @param postId Instagram post ID
   * @param downloadThumbnail Whether to download the thumbnail
   */
  async scrapeInstagram(
    postId: string,
    downloadThumbnail: boolean = false
  ): Promise<{
    title: string;
    description: string;
    thumbnailUrl?: string;
    localThumbnailPath?: string;
    username?: string;
  }> {
    try {
      console.log(`Scraping Instagram post: ${postId}`);
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Set a user agent to avoid being blocked
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      // Navigate to the Instagram post page
      await page.goto(`https://www.instagram.com/p/${postId}/`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for the content to load
      await page
        .waitForSelector('meta[property="og:title"]', { timeout: 5000 })
        .catch(() => {});

      // Extract the post information
      const postData = await page.evaluate(() => {
        // Get title and description from meta tags
        const title =
          document
            .querySelector('meta[property="og:title"]')
            ?.getAttribute("content") || "Instagram Post";
        const description =
          document
            .querySelector('meta[property="og:description"]')
            ?.getAttribute("content") || "";

        // Get thumbnail URL
        const thumbnailUrl =
          document
            .querySelector('meta[property="og:image"]')
            ?.getAttribute("content") || undefined;

        // Try to get username
        let username;
        if (title) {
          // Title is usually in format "Username on Instagram: ..."
          const usernameMatch = title.match(/^([^:]+) on Instagram/);
          if (usernameMatch && usernameMatch[1]) {
            username = usernameMatch[1].trim();
          }
        }

        return { title, description, thumbnailUrl, username };
      });

      await page.close();

      // Download the thumbnail if requested
      if (downloadThumbnail) {
        if (postData.thumbnailUrl) {
          // If we have a thumbnail URL, try to download it
          postData.localThumbnailPath = await this.downloadThumbnail(
            postData.thumbnailUrl
          );
        } else {
          // If no thumbnail URL is available, try to create a default thumbnail
          console.log(
            `WebScraperService: No thumbnail URL available for Instagram post ${postId}, creating default thumbnail`
          );
          postData.localThumbnailPath = await createDefaultThumbnail();
        }
      }

      return postData;
    } catch (error) {
      console.error("Error scraping Instagram:", error);

      // Return a basic result if scraping fails
      // Create a default thumbnail
      const defaultThumbnailPath = await createDefaultThumbnail();
      console.log(
        `WebScraperService: Created default thumbnail for failed Instagram scrape: ${defaultThumbnailPath}`
      );

      return {
        title: "Instagram Recipe Post",
        description: `Instagram post ${postId}. This appears to be a food post showing a delicious recipe.`,
        localThumbnailPath: defaultThumbnailPath,
      };
    }
  }

  /**
   * Download a thumbnail image from a URL or capture from video
   * @param thumbnailUrl URL of the thumbnail to download
   * @param videoId Optional YouTube video ID for capturing screenshots if thumbnail download fails
   * @returns Local path to the saved image, screenshot path, or default thumbnail path if all methods fail
   */
  async downloadThumbnail(
    thumbnailUrl: string | undefined,
    videoId?: string
  ): Promise<string | null> {
    console.log(
      `WebScraperService: Attempting to download thumbnail from: ${
        thumbnailUrl || "undefined URL"
      }${videoId ? `, video ID: ${videoId}` : ""}`
    );

    // Try multiple methods to get a good food thumbnail
    let thumbnailPath: string | null = null;

    // Method 1: Try to download the provided thumbnail URL
    if (thumbnailUrl) {
      try {
        console.log(
          `WebScraperService: Validating thumbnail URL: ${thumbnailUrl}`
        );
        const isValid = await isValidImageUrl(thumbnailUrl);
        if (isValid) {
          console.log(
            `WebScraperService: Downloading video thumbnail from: ${thumbnailUrl}`
          );
          thumbnailPath = await downloadImage(thumbnailUrl);
          console.log(
            `WebScraperService: Successfully downloaded video thumbnail to ${thumbnailPath}`
          );
          // If we successfully downloaded the thumbnail, return it immediately
          // without trying to capture screenshots
          return thumbnailPath;
        } else {
          console.warn(
            `WebScraperService: Invalid image URL: ${thumbnailUrl}, will try alternative methods`
          );
        }
      } catch (error) {
        console.error(
          "WebScraperService: Error downloading thumbnail from URL:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Method 2: If we have a video ID, try to capture screenshots from the video
    if (!thumbnailPath && videoId) {
      try {
        console.log(
          `WebScraperService: Attempting to capture screenshots from video: ${videoId}`
        );
        // We only want a single screenshot here, not all of them
        // For TikTok videos, we'll use a different approach than YouTube
        // TikTok video IDs are typically longer than YouTube IDs
        const isTikTokVideo = videoId.length > 15;

        if (isTikTokVideo) {
          console.log(
            `WebScraperService: Detected TikTok video ID: ${videoId}`
          );
          // For TikTok, we'll create a default thumbnail since we can't easily capture screenshots
          thumbnailPath = await createDefaultThumbnail();
          console.log(
            `WebScraperService: Created default thumbnail for TikTok video: ${thumbnailPath}`
          );
        } else {
          // Assume it's a YouTube video
          const screenshotResult = await this.captureVideoScreenshot(
            videoId,
            false
          );

          // Make sure we got a string (path) and not an array of screenshots
          if (typeof screenshotResult === "string") {
            thumbnailPath = screenshotResult;
            console.log(
              `WebScraperService: Successfully captured video screenshot to ${thumbnailPath}`
            );
          }
        }
      } catch (error) {
        console.error(
          "WebScraperService: Error capturing video screenshot:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Method 3: If all else fails, use a default thumbnail
    if (!thumbnailPath) {
      console.warn(
        "WebScraperService: All thumbnail methods failed, using default thumbnail"
      );
      thumbnailPath = await createDefaultThumbnail();
    }

    return thumbnailPath;
  }

  /**
   * Capture multiple screenshots from a YouTube video at different timestamps
   * @param videoId YouTube video ID
   * @param returnAllScreenshots Whether to return all screenshots or just the best one
   * @returns Local path to the best food-related screenshot, array of all screenshots, or null if failed
   */
  async captureVideoScreenshot(
    videoId: string,
    returnAllScreenshots: boolean = false
  ): Promise<string | null | { path: string; timestamp: number }[]> {
    console.log(
      `WebScraperService: Attempting to capture food screenshots from video: ${videoId}`
    );

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      // Define timestamps to capture (in seconds)
      // We'll try several points in the video to increase chances of capturing food
      // Most recipe videos show the final dish in the middle and end portions
      const timestamps = [15, 30, 45, 60, 90, 120, 180];
      const screenshots = [];

      for (const timestamp of timestamps) {
        try {
          const page = await browser.newPage();

          // Navigate to the YouTube video embed page with specific start time
          // Using embed page is more lightweight than the full YouTube page
          await page.goto(
            `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${timestamp}`,
            {
              waitUntil: "networkidle2",
              timeout: 30000,
            }
          );

          // Wait a bit for the video to start playing at the timestamp
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Take a screenshot
          const screenshotBuffer = await page.screenshot();

          // Save the screenshot temporarily
          const fs = require("fs");
          const path = require("path");
          const { v4: uuidv4 } = require("uuid");

          const filename = `${uuidv4()}.jpg`;
          const uploadDir = path.join(process.cwd(), "uploads");
          const filePath = path.join(uploadDir, filename);

          fs.writeFileSync(filePath, screenshotBuffer);

          screenshots.push({
            path: `/uploads/${filename}`,
            timestamp: timestamp,
          });

          console.log(
            `WebScraperService: Captured video screenshot at ${timestamp}s to /uploads/${filename}`
          );

          await page.close();
        } catch (error) {
          console.error(
            `WebScraperService: Error capturing screenshot at timestamp ${timestamp}s:`,
            error instanceof Error ? error.message : String(error)
          );
          // Continue with other timestamps even if one fails
        }
      }

      await browser.close();

      if (screenshots.length === 0) {
        console.error("WebScraperService: Failed to capture any screenshots");
        return null;
      }

      // If we want to return all screenshots for user selection
      if (returnAllScreenshots) {
        console.log(
          `WebScraperService: Returning all ${screenshots.length} screenshots for user selection`
        );
        return screenshots.map((screenshot) => ({
          path: screenshot.path,
          timestamp: screenshot.timestamp,
        }));
      }

      // Otherwise, select the best screenshot (middle of the video)
      // For now, we'll use the screenshot from the middle of the video (most likely to show food)
      // In a more advanced implementation, we could use image recognition to detect food
      const middleIndex = Math.min(
        Math.floor(screenshots.length / 2),
        screenshots.length - 1
      );
      const middleScreenshot = screenshots[middleIndex];

      if (!middleScreenshot) {
        console.error("WebScraperService: Failed to select a valid screenshot");
        return null;
      }

      console.log(
        `WebScraperService: Selected best food screenshot from timestamp ${middleScreenshot.timestamp}s: ${middleScreenshot.path}`
      );

      // Delete the other screenshots to save space
      const fs = require("fs");
      const path = require("path");

      for (const screenshot of screenshots) {
        if (screenshot.path !== middleScreenshot.path) {
          try {
            const fullPath = path.join(
              process.cwd(),
              screenshot.path.substring(1)
            );
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          } catch (error) {
            console.error(
              `WebScraperService: Error deleting unused screenshot ${screenshot.path}:`,
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      }

      return middleScreenshot.path;
    } catch (error) {
      console.error(
        "WebScraperService: Error in screenshot capture process:",
        error instanceof Error ? error.message : String(error)
      );
      return null;
    }
  }

  /**
   * Get the HTML content of a webpage
   * @param url URL to fetch
   */
  async getHtml(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching HTML:", error);
      throw new HTTPException(500, { message: "Failed to fetch HTML content" });
    }
  }

  /**
   * Parse HTML content using cheerio
   * @param html HTML content
   */
  parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }
}
