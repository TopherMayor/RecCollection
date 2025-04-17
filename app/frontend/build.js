#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Run TypeScript compiler
console.log('Running TypeScript compiler...');
try {
  execSync('bun run tsc -b', { stdio: 'inherit' });
  console.log('TypeScript compilation successful!');
} catch (error) {
  console.error('TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Run Vite build
console.log('Building with Vite...');
try {
  execSync('bun run vite build', { stdio: 'inherit' });
  console.log('Vite build successful!');
} catch (error) {
  console.error('Vite build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');
