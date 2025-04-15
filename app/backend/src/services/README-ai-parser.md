# AI Recipe Parser Service

This service allows users to import recipes from social media platforms like YouTube, TikTok, and Instagram by using AI to parse the content.

## Features

- Extract recipe information from YouTube videos using video transcripts
- Support for TikTok and Instagram posts (placeholder implementation)
- AI-powered parsing of recipe details (title, ingredients, instructions, etc.)
- Fallback to mock data when API keys are not available or errors occur

## Setup

1. Get an API key from OpenRouter:

   - Go to [OpenRouter](https://openrouter.ai/keys) and create an account
   - Generate an API key
   - Add the key to your `.env` file: `OPENROUTER_API_KEY=your_key_here`
   - Specify the models to use:
     ```
     OPENROUTER_MODEL=openrouter/quasar-alpha
     OPENROUTER_FALLBACK_MODEL=openrouter/optimus-alpha
     ```

2. Alternatively, you can use Google Gemini API:
   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add the key to your `.env` file: `GOOGLE_API_KEY=your_key_here`
   - Update the AI parser service to use Gemini instead of OpenRouter

## How It Works

1. **Platform Detection**: The service detects the platform (YouTube, TikTok, Instagram) from the URL.

2. **Content Extraction**:

   - For YouTube: Extracts video ID, fetches metadata (title, description) and transcript
   - For TikTok/Instagram: Currently uses placeholder implementation

3. **AI Parsing**:

   - First tries OpenRouter's Quasar Alpha model (primary model)
   - If that fails, tries OpenRouter's Optimus Alpha model (fallback model)
   - If both OpenRouter models fail, tries Google Gemini API as a final fallback
   - Uses a carefully crafted prompt to extract recipe information
   - Formats the response into a structured recipe object

4. **Error Handling**:
   - Implements a robust fallback system with multiple AI models
   - Uses a standardized response wrapper for consistent error handling
   - Implements multiple JSON parsing fallback mechanisms to handle malformed AI responses
   - Tracks and logs detailed error information for debugging
   - Falls back to basic recipe extraction when JSON parsing fails
   - Falls back to mock data only if all AI services fail
   - Uses web scraping as a fallback for content extraction when APIs are unavailable
   - Provides detailed error messages for debugging while keeping client-facing errors simple

## API Endpoints

### Parse Recipe from Social Media

```
POST /api/social/parse
```

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=example",
  "platform": "youtube" // Optional, will be auto-detected if not provided
}
```

Response:

```json
{
  "success": true,
  "recipe": {
    "title": "Recipe Title",
    "description": "Recipe description",
    "cookingTime": 30,
    "prepTime": 15,
    "servingSize": 4,
    "difficultyLevel": "medium",
    "ingredients": [...],
    "instructions": [...],
    "tags": [...],
    "sourceUrl": "https://www.youtube.com/watch?v=example",
    "sourceType": "youtube"
  }
}
```

### Import Recipe from Social Media

```
POST /api/social/import
```

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=example",
  "platform": "youtube", // Optional, will be auto-detected if not provided
  "recipeData": { ... } // Optional, will be parsed from URL if not provided
}
```

Response:

```json
{
  "success": true,
  "recipe": {
    "id": 123,
    "title": "Recipe Title",
    "description": "Recipe description",
    "cookingTime": 30,
    "prepTime": 15,
    "servingSize": 4,
    "difficultyLevel": "medium",
    "ingredients": [...],
    "instructions": [...],
    "tags": [...],
    "sourceUrl": "https://www.youtube.com/watch?v=example",
    "sourceType": "youtube",
    "user": {
      "id": 456,
      "username": "user123",
      "displayName": "User Name"
    }
  }
}
```

## Future Improvements

1. Enhance web scraping capabilities for TikTok and Instagram
2. Add support for more social media platforms
3. Improve AI prompt engineering for better recipe extraction
4. Add image extraction from videos and posts
5. Implement caching to avoid repeated API calls for the same content
6. Add more AI model options and fine-tune model selection based on content type
7. Implement rate limiting and quota management for API calls
8. Add telemetry and monitoring for AI service performance
9. Implement adaptive retry mechanisms with exponential backoff
10. Add unit and integration tests for error handling scenarios
