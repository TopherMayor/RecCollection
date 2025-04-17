# RecCollection Scripts

This directory contains utility scripts for the RecCollection project.

## Available Scripts

### check-console-logs.sh

This script checks for console statements (log, error, warn, info, debug) in both the frontend and backend code. It's useful for identifying console statements that should be removed before production deployment.

#### Usage

```bash
# Run directly
./scripts/check-console-logs.sh

# Or use npm script
npm run lint:console

# Or use bun script
bun run lint:console:bun
```

The script will:
1. Check for console statements in the frontend code (`app/frontend/src`)
2. Check for console statements in the backend code (`app/backend/src`)
3. Provide a summary of the findings

## Adding New Scripts

When adding new scripts to this directory:

1. Make the script executable: `chmod +x scripts/your-script.sh`
2. Add an entry to the package.json scripts section
3. Update this README.md file with documentation for the script
