# RecCollection Social Media Import

## Overview
This document outlines the functionality for importing recipes from social media platforms, specifically Instagram and TikTok. This feature will allow users to easily create recipes based on content they find on these platforms.

## Supported Platforms

### Instagram
- Posts containing recipe content
- Recipe carousels (multiple images)
- IGTV videos with recipe content
- Reels with recipe content

### TikTok
- Short-form videos containing recipe content
- Recipe tutorials
- Cooking demonstrations

## Import Process

### User Flow
1. User finds a recipe on Instagram or TikTok
2. User copies the URL of the post/video
3. User navigates to the import page in RecCollection
4. User pastes the URL into the import form
5. System processes the URL and extracts recipe information
6. User reviews and edits the extracted information
7. User saves the recipe to their collection

### Technical Flow
1. Receive URL from user
2. Validate URL format and platform
3. Fetch content from the social media platform
4. Process content to extract recipe information
   - For text: Use AI to identify ingredients and instructions
   - For images: Use image recognition (future enhancement)
   - For videos: Use transcription and AI processing
5. Structure the extracted information into recipe format
6. Present to user for review and editing
7. Save the finalized recipe to the database

## Implementation Details

### URL Validation
The system will validate URLs to ensure they are from supported platforms and have the correct format.

```typescript
function validateSocialMediaURL(url: string): { valid: boolean, platform?: 'instagram' | 'tiktok', error?: string } {
  // Instagram URL pattern
  const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|tv|reel)\/([^\/\?]+)/;
  
  // TikTok URL pattern
  const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com)\/@([^\/]+)\/video\/(\d+)/;
  
  if (instagramPattern.test(url)) {
    return { valid: true, platform: 'instagram' };
  } else if (tiktokPattern.test(url)) {
    return { valid: true, platform: 'tiktok' };
  } else {
    return { valid: false, error: 'URL is not from a supported platform or has an invalid format' };
  }
}
```

### Content Fetching
The system will use different approaches to fetch content from each platform.

#### Instagram
Due to API limitations, the system will use a combination of:
- Instagram Basic Display API (where possible)
- Web scraping techniques (as a fallback)

#### TikTok
The system will use:
- TikTok API (where possible)
- Web scraping techniques (as a fallback)

### Content Processing
The system will use AI to process the fetched content and extract recipe information.

#### Text Processing
For captions and text content:
- Extract ingredient mentions
- Identify quantities and units
- Recognize cooking instructions
- Determine cooking time and difficulty

#### Image Processing (Future Enhancement)
For image content:
- Recognize food items
- Identify cooking techniques
- Extract text from images

#### Video Processing
For video content:
- Transcribe audio to text
- Process transcription for recipe information
- Identify key frames showing ingredients and steps

### AI Integration
The system will use the AI service to:
- Extract structured recipe data from unstructured content
- Generate missing information (e.g., recipe name, description)
- Suggest categories and tags based on the content

## API Endpoints

### Import from Instagram
```
POST /api/import/instagram
```

**Request Body:**
```json
{
  "url": "https://www.instagram.com/p/ABC123/"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Extracted Recipe Title",
    "description": "Extracted or generated description",
    "ingredients": [
      { "name": "Ingredient 1", "quantity": 1, "unit": "cup" },
      { "name": "Ingredient 2", "quantity": 2, "unit": "tbsp" }
    ],
    "instructions": [
      { "step_number": 1, "description": "Step 1 description" },
      { "step_number": 2, "description": "Step 2 description" }
    ],
    "cooking_time": 30,
    "serving_size": 4,
    "difficulty_level": "medium",
    "source_url": "https://www.instagram.com/p/ABC123/",
    "source_type": "instagram",
    "image_url": "https://extracted-image-url.com/image.jpg"
  }
}
```

### Import from TikTok
```
POST /api/import/tiktok
```

**Request Body:**
```json
{
  "url": "https://www.tiktok.com/@user/video/123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Extracted Recipe Title",
    "description": "Extracted or generated description",
    "ingredients": [
      { "name": "Ingredient 1", "quantity": 1, "unit": "cup" },
      { "name": "Ingredient 2", "quantity": 2, "unit": "tbsp" }
    ],
    "instructions": [
      { "step_number": 1, "description": "Step 1 description" },
      { "step_number": 2, "description": "Step 2 description" }
    ],
    "cooking_time": 15,
    "serving_size": 2,
    "difficulty_level": "easy",
    "source_url": "https://www.tiktok.com/@user/video/123456",
    "source_type": "tiktok",
    "image_url": "https://extracted-image-url.com/image.jpg"
  }
}
```

## User Interface

### Import Form
The import form will include:
- URL input field
- Platform selection (auto-detected)
- Import button
- Loading indicator during processing

### Review and Edit Interface
The review and edit interface will include:
- Editable recipe title
- Editable description
- Editable ingredients list (add, remove, modify)
- Editable instructions list (add, remove, modify)
- Editable cooking details (time, servings, difficulty)
- Category and tag selection
- Save button

## Error Handling

### Common Errors
The system will handle the following common errors:
- Invalid URL format
- Unsupported platform
- Private content
- Content not containing recipe information
- API rate limiting
- Network failures

### Error Responses
The system will provide clear error messages to the user:

```json
{
  "success": false,
  "error": "CONTENT_NOT_ACCESSIBLE",
  "message": "The content at this URL is private or not accessible",
  "suggestions": [
    "Make sure the content is public",
    "Try a different URL",
    "Enter the recipe details manually"
  ]
}
```

## Legal Considerations

### Attribution
The system will:
- Store the source URL with the recipe
- Display attribution to the original creator
- Include a link back to the original content

### Copyright
The system will:
- Only extract factual information (ingredients, instructions)
- Not copy creative elements verbatim
- Allow users to modify extracted content
- Provide clear guidelines on fair use

### Terms of Service Compliance
The system will:
- Comply with Instagram and TikTok terms of service
- Implement rate limiting to avoid API abuse
- Respect robots.txt directives
- Not store or cache content unnecessarily

## Future Enhancements

### Additional Platforms
- YouTube cooking videos
- Pinterest recipe pins
- Food blogs and websites

### Enhanced Processing
- Image recognition for ingredients
- Video scene detection for cooking steps
- Nutritional information extraction

### User Experience
- Browser extension for one-click import
- Mobile app integration with share functionality
- Batch import of multiple recipes
