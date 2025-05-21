#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS specific commands
    if ! command_exists osascript; then
        echo "Error: osascript is required but not installed." >&2
        exit 1
    fi
    
    # Function to create a new terminal window and run a command
    new_terminal() {
        local cmd=$1
        local title=$2
        osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && echo -e '\\e]1;$title\\a' && $cmd; exec /bin/bash -i\""
    }
else
    # Linux/Unix fallback
    echo "Warning: This script is optimized for macOS. Some features might not work as expected on other systems."
    new_terminal() {
        local cmd=$1
        local title=$2
        xterm -T "$title" -e "bash -c 'cd \"$SCRIPT_DIR\" && $cmd; exec /bin/bash -i'" &
    }
fi

# Start backend server
echo -e "${BLUE}Starting backend server...${NC}"
(
    cd "$SCRIPT_DIR/backend"
    
    # Check if virtual environment exists, if not create it
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv .venv
    fi
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Install dependencies
    echo "Installing backend dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Start the server
    echo "Starting backend server on http://localhost:8084"
    uvicorn src.main:app --reload --host 0.0.0.0 --port 8084
) &

# Give the backend a moment to start
sleep 2

# Start frontend server
echo -e "${GREEN}Starting frontend development server...${NC}"
(
    cd "$SCRIPT_DIR/frontend"
    
    # Install frontend dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    # Start the frontend development server
    echo "Starting frontend development server on http://localhost:3000"
    npm run dev
) &

echo -e "${GREEN}Development servers are starting...${NC}"
echo "- Backend: http://localhost:8084"
echo "- Frontend: http://localhost:3000"
echo "- API Documentation: http://localhost:8084/docs"

# Keep the script running
wait
