#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Check if .env.sample exists
if [ ! -f "$PROJECT_ROOT/.env.sample" ]; then
    echo "Error: .env.sample does not exist in project root"
    exit 1
fi

# Copy to root .env
cp "$PROJECT_ROOT/.env.sample" "$PROJECT_ROOT/.env"

echo "Successfully copied .env.sample to .env"
echo "Please edit .env and add your API keys"
