#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Task Tracker Shutdown ===${NC}\n"

# Функция для остановки процесса
stop_process() {
    local name=$1
    local pid_file=$2

    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping ${name} (PID: ${PID})...${NC}"
            kill $PID

            # Ждем завершения процесса
            for i in {1..10}; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    echo -e "${GREEN}${name} stopped successfully${NC}"
                    rm "$pid_file"
                    return 0
                fi
                sleep 0.5
            done

            # Если процесс не завершился, принудительно убиваем
            echo -e "${RED}Force killing ${name}...${NC}"
            kill -9 $PID 2>/dev/null
            rm "$pid_file"
        else
            echo -e "${RED}${name} process not running (PID: ${PID})${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${RED}${name} PID file not found${NC}"
    fi
}

# Остановка server
stop_process "Server" ".pids/server.pid"

# Остановка client
stop_process "Client" ".pids/client.pid"

# Дополнительная проверка: убиваем все процессы на портах 3000 и 3001
echo -e "\n${YELLOW}Checking for processes on ports 3000 and 3001...${NC}"

# Проверка порта 3001 (server/backend)
SERVER_PORT_PID=$(lsof -ti:3001)
if [ ! -z "$SERVER_PORT_PID" ]; then
    echo -e "${YELLOW}Found process on port 3001 (PID: ${SERVER_PORT_PID}), killing...${NC}"
    kill -9 $SERVER_PORT_PID 2>/dev/null
fi

# Проверка порта 3000 (client/frontend)
CLIENT_PORT_PID=$(lsof -ti:3000)
if [ ! -z "$CLIENT_PORT_PID" ]; then
    echo -e "${YELLOW}Found process on port 3000 (PID: ${CLIENT_PORT_PID}), killing...${NC}"
    kill -9 $CLIENT_PORT_PID 2>/dev/null
fi

echo -e "\n${GREEN}=== Shutdown complete ===${NC}"
