#!/bin/bash

# Create the database if it doesn't exist
echo "Creating database if it doesn't exist..."
createdb reccollection 2>/dev/null || echo "Database already exists"

# Run migrations and seed data
echo "Setting up database..."
bun run db:setup

echo "Database setup complete!"
