# Image Handling in RecCollection

This document outlines how images are handled in the RecCollection application, including the different image fields, validation rules, and best practices.

## Image Fields

The application uses three main fields for handling images:

1. **imageUrl**: Used for external image URLs (e.g., from the web)
2. **thumbnailPath**: Used for local file paths (e.g., uploaded images stored on the server)
3. **thumbnailUrl**: Used for external thumbnail URLs (e.g., from social media platforms)

## Validation Rules

- **imageUrl** and **thumbnailUrl** should only contain valid URLs or be empty strings
- **thumbnailPath** should contain local file paths (starting with `/`) or be an empty string
- File paths (starting with `/`) should never be stored in URL fields
- Null values should be converted to empty strings before sending to the API

## Image Handling Logic

### Form Display
- File paths (starting with `/`) are not displayed in URL input fields
- URL fields only show proper web URLs
- The UI correctly displays the image regardless of where it's stored

### Form Submission
- If `imageUrl` contains a file path (starts with `/`), it's moved to `thumbnailPath` and `imageUrl` is cleared
- If `thumbnailUrl` contains a file path, it's moved to `thumbnailPath` and `thumbnailUrl` is cleared
- Null values are converted to empty strings for all string fields
- Additional validation checks are performed before form submission

### API Requests
- The API client sanitizes the data before sending to the backend
- Null values are converted to empty strings for string fields
- Detailed error handling and logging is implemented

## Best Practices

1. Always use the appropriate field for each type of image source:
   - External URLs → `imageUrl` or `thumbnailUrl`
   - Local file paths → `thumbnailPath`

2. Never store file paths in URL fields

3. Always validate and sanitize image data before sending to the API

4. Handle null values by converting them to empty strings

5. Use the debugging tools in the console to troubleshoot image-related issues
