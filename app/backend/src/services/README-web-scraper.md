# Web Scraper Service

This service provides methods to scrape content from various social media platforms as a fallback when APIs are not available or have limitations.

## Features

- Scrape content from YouTube videos
- Scrape content from TikTok videos
- Scrape content from Instagram posts
- Extract metadata, descriptions, and thumbnails
- Robust error handling with fallbacks

## Implementation Details

The Web Scraper Service uses a combination of techniques to extract content:

1. **Puppeteer**: For headless browser automation to scrape content from pages that require JavaScript execution
2. **Cheerio**: For HTML parsing when a simpler approach is sufficient
3. **Axios**: For making HTTP requests to fetch HTML content

## Usage

### YouTube Scraping

```typescript
// Extract content from a YouTube video
const videoId = 'dQw4w9WgXcQ';
const videoData = await webScraperService.scrapeYouTube(videoId);
console.log(videoData.title);
console.log(videoData.description);
console.log(videoData.thumbnailUrl);
```

### TikTok Scraping

```typescript
// Extract content from a TikTok video
const videoId = '7317049860291765546';
const username = 'username'; // Optional
const videoData = await webScraperService.scrapeTikTok(videoId, username);
console.log(videoData.title);
console.log(videoData.description);
console.log(videoData.thumbnailUrl);
console.log(videoData.username);
```

### Instagram Scraping

```typescript
// Extract content from an Instagram post
const postId = 'CzXzXzXzXz';
const postData = await webScraperService.scrapeInstagram(postId);
console.log(postData.title);
console.log(postData.description);
console.log(postData.thumbnailUrl);
console.log(postData.username);
```

## Resource Management

The Web Scraper Service manages a single browser instance for all scraping operations to minimize resource usage. When you're done using the service, make sure to close the browser:

```typescript
// Close the browser when done
await webScraperService.closeBrowser();
```

## Error Handling

The service includes robust error handling:

- If scraping fails, it returns basic information rather than throwing an exception
- For YouTube, it falls back to the oEmbed API if direct scraping fails
- For TikTok and Instagram, it provides generic descriptions if scraping fails

## Limitations

- Web scraping is subject to changes in website structure
- Some websites may block scraping attempts
- Performance may be slower than using official APIs
- Content may be incomplete compared to what's available through APIs

## Future Improvements

1. Add support for more social media platforms
2. Implement more robust scraping techniques
3. Add caching to improve performance
4. Add proxy support to avoid rate limiting
5. Implement more sophisticated error handling and retries
