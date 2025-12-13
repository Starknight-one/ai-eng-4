#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Natural Language SQL Interface Launcher ===${NC}\n"

# Проверка наличия node_modules
if [ ! -d "client/node_modules" ]; then
    echo -e "${RED}Client dependencies not installed!${NC}"
    echo -e "Installing client dependencies...\n"
    cd client && npm install && cd ..
fi

# Создание директорий для PID файлов и логов
mkdir -p .pids
mkdir -p logs

# Запуск server
echo -e "${GREEN}Starting backend server...${NC}"
cd server
uv run python server.py > ../logs/server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > ../.pids/server.pid
cd ..
echo -e "Server PID: ${SERVER_PID}"

# Небольшая задержка для запуска server
sleep 2

# Запуск client
echo -e "${GREEN}Starting frontend server...${NC}"
cd client
npm run dev > ../logs/client.log 2>&1 &
CLIENT_PID=$!
echo $CLIENT_PID > ../.pids/client.pid
cd ..
echo -e "Client PID: ${CLIENT_PID}"

echo -e "\n${GREEN}=== Servers started successfully! ===${NC}"
echo -e "${BLUE}Backend:${NC}  http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}API Docs:${NC} http://localhost:8000/docs"
echo -e "\n${BLUE}Logs:${NC}"
echo -e "  Server:  tail -f logs/server.log"
echo -e "  Client:  tail -f logs/client.log"
echo -e "\n${RED}To stop servers, run:${NC} ./stop.sh"
