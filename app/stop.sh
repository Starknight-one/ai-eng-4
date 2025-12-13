#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Natural Language SQL Interface Shutdown ===${NC}\n"

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

# Дополнительная проверка: убиваем все процессы на портах 8000, 5173, и 8001
echo -e "\n${YELLOW}Checking for processes on ports 8000, 5173, and 8001...${NC}"

# Проверка порта 8000 (server/backend)
SERVER_PORT_PID=$(lsof -ti:8000)
if [ ! -z "$SERVER_PORT_PID" ]; then
    echo -e "${YELLOW}Found process on port 8000 (PID: ${SERVER_PORT_PID}), killing...${NC}"
    kill -9 $SERVER_PORT_PID 2>/dev/null
fi

# Проверка порта 5173 (client/frontend Vite)
CLIENT_PORT_PID=$(lsof -ti:5173)
if [ ! -z "$CLIENT_PORT_PID" ]; then
    echo -e "${YELLOW}Found process on port 5173 (PID: ${CLIENT_PORT_PID}), killing...${NC}"
    kill -9 $CLIENT_PORT_PID 2>/dev/null
fi

# Проверка порта 8001 (webhook server)
WEBHOOK_PORT_PID=$(lsof -ti:8001)
if [ ! -z "$WEBHOOK_PORT_PID" ]; then
    echo -e "${YELLOW}Found process on port 8001 (PID: ${WEBHOOK_PORT_PID}), killing...${NC}"
    kill -9 $WEBHOOK_PORT_PID 2>/dev/null
fi

echo -e "\n${GREEN}=== Shutdown complete ===${NC}"
