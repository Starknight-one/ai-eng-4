#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Stopping Task Tracker...${NC}"

# Kill any running start.sh processes
echo -e "${GREEN}Killing start.sh processes...${NC}"
pkill -f "start.sh" 2>/dev/null

# Kill webhook server
echo -e "${GREEN}Killing webhook server...${NC}"
pkill -f "trigger_webhook.py" 2>/dev/null

# Kill processes on specific ports (3000 - frontend, 3001 - backend)
echo -e "${GREEN}Killing processes on ports 3000 and 3001...${NC}"
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null

echo -e "${GREEN}Services stopped successfully!${NC}"
