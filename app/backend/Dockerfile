FROM oven/bun:1.2

WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose the port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "start"]
