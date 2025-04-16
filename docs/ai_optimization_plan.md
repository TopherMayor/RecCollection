# AI Service Optimization Plan

This plan outlines the steps to optimize the AI service for token usage and agent performance.

## Goals

- Reduce token usage.
- Improve agent performance.
- Reduce costs.

## Plan

1.  **Implement Caching:**

    - Use a caching library (e.g., `node-cache`, `lru-cache`) to store generated recipe names and descriptions.
    - Define a cache key based on the input parameters (e.g., ingredients, instructions, category).
    - Before calling the AI service, check the cache for a matching entry.
    - If a cache hit occurs, return the cached value.
    - If a cache miss occurs, call the AI service, store the result in the cache, and then return the result.
    - Implement a Time-To-Live (TTL) for cache entries to ensure that the cache is refreshed periodically.

2.  **Optimize Prompt Engineering (Once AI Service is Integrated):**

    - Analyze the prompts used for recipe name and description generation.
    - Identify and remove any unnecessary words or phrases.
    - Use concise language and clear instructions.
    - Experiment with different prompt structures to find the most efficient approach.
    - Consider using few-shot learning (providing a few examples in the prompt) to guide the AI model.

3.  **Data Minimization in Database:**

    - Review the `schema.aiGenerations` table schema.
    - Ensure that only essential data is stored (e.g., user ID, generation type, input data, output content, creation timestamp).
    - Consider storing the input data as a JSON string to avoid creating separate columns for each input parameter.
    - If possible, avoid storing redundant information.

4.  **API Call Optimization (Once AI Service is Integrated):**

    - Batch requests: If the AI service supports it, batch multiple requests into a single API call.
    - Rate limiting: Implement rate limiting on the backend to prevent exceeding the AI service's rate limits.
    - Asynchronous processing: Use asynchronous processing to handle AI service calls without blocking the main thread.

5.  **Code Refactoring:**
    - Refactor the `AIService` class to improve its structure and organization.
    - Extract common functionality into separate helper functions.
    - Add comments to explain the code.
