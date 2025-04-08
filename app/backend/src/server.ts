import { serve } from '@hono/node-server';
import app from './index';
import 'dotenv/config';

// Get the port from environment variables or use 3000 as default
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`Server is running on port ${port}`);

// Start the server
serve({
  fetch: app.fetch,
  port,
});
