#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Task Tracker...${NC}"

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"

    # Kill all child processes
    jobs -p | xargs -r kill 2>/dev/null

    # Wait for processes to terminate
    wait

    echo -e "${GREEN}Services stopped successfully.${NC}"
    exit 0
}

# Trap EXIT, INT, and TERM signals
trap cleanup EXIT INT TERM

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/app/server/node_modules" ]; then
    echo -e "${RED}Server dependencies not installed!${NC}"
    echo "Installing server dependencies..."
    cd "$PROJECT_ROOT/app/server" && npm install
fi

if [ ! -d "$PROJECT_ROOT/app/client/node_modules" ]; then
    echo -e "${RED}Client dependencies not installed!${NC}"
    echo "Installing client dependencies..."
    cd "$PROJECT_ROOT/app/client" && npm install
fi

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd "$PROJECT_ROOT/app/server"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Backend failed to start!${NC}"
    exit 1
fi

# Start frontend
echo -e "${GREEN}Starting frontend server...${NC}"
cd "$PROJECT_ROOT/app/client"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Frontend failed to start!${NC}"
    exit 1
fi

echo -e "${GREEN}Services started successfully!${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}Backend:  http://localhost:3001${NC}"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user to press Ctrl+C
wait
