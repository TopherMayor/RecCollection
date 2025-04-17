#!/bin/bash

# Script to check for console statements in the codebase
# This helps identify console logs that should be removed before production

# Create scripts directory if it doesn't exist
mkdir -p "$(dirname "$0")"

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Header
echo -e "${GREEN}===== Console Statement Checker =====${NC}"
echo -e "Checking for console statements in the codebase..."
echo -e "This tool helps identify console logs that should be removed before production.\n"

# Function to check for console statements
check_console() {
  local type=$1
  local color=$2
  local dir=$3
  
  echo -e "${color}Checking for console.${type} statements in ${dir}...${NC}"
  
  # Count the occurrences
  local count=$(grep -r "console\.${type}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "$dir" | wc -l)
  
  if [ "$count" -gt 0 ]; then
    echo -e "${YELLOW}Found ${count} console.${type} statements:${NC}"
    grep -r "console\.${type}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "$dir" | sed 's/^/  /'
  else
    echo -e "${GREEN}No console.${type} statements found.${NC}"
  fi
  echo ""
  
  return $count
}

# Check frontend code
echo -e "${BLUE}===== Checking Frontend Code =====${NC}"
frontend_dir="app/frontend/src"
total_frontend=0

check_console "log" "${RED}" "$frontend_dir"
total_frontend=$((total_frontend + $?))

check_console "error" "${YELLOW}" "$frontend_dir"
total_frontend=$((total_frontend + $?))

check_console "warn" "${YELLOW}" "$frontend_dir"
total_frontend=$((total_frontend + $?))

check_console "info" "${BLUE}" "$frontend_dir"
total_frontend=$((total_frontend + $?))

check_console "debug" "${PURPLE}" "$frontend_dir"
total_frontend=$((total_frontend + $?))

# Check backend code
echo -e "${BLUE}===== Checking Backend Code =====${NC}"
backend_dir="app/backend/src"
total_backend=0

check_console "log" "${RED}" "$backend_dir"
total_backend=$((total_backend + $?))

check_console "error" "${YELLOW}" "$backend_dir"
total_backend=$((total_backend + $?))

check_console "warn" "${YELLOW}" "$backend_dir"
total_backend=$((total_backend + $?))

check_console "info" "${BLUE}" "$backend_dir"
total_backend=$((total_backend + $?))

check_console "debug" "${PURPLE}" "$backend_dir"
total_backend=$((total_backend + $?))

# Summary
total=$((total_frontend + total_backend))
echo -e "${GREEN}===== Summary =====${NC}"
echo -e "Total console statements found: ${total}"
echo -e "  Frontend: ${total_frontend}"
echo -e "  Backend: ${total_backend}"

if [ "$total" -gt 0 ]; then
  echo -e "\n${YELLOW}Consider removing console statements before production deployment.${NC}"
else
  echo -e "\n${GREEN}No console statements found. Code is ready for production!${NC}"
fi

echo -e "\n${GREEN}Done checking for console statements.${NC}"
