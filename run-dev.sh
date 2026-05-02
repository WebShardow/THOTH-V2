#!/bin/bash
# Development Server Runner for Unix/Linux/macOS

echo "=== Development Server Runner ==="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check and kill existing processes
echo "Checking for existing Node.js processes..."
if pgrep -f "node" > /dev/null; then
    echo "Found existing Node.js processes, stopping them..."
    pkill -f "node"
    sleep 2
    echo "Existing processes stopped."
else
    echo "No existing Node.js processes found."
fi

# Start development server
echo "Starting development server..."
pnpm run dev &
DEV_PID=$!

echo "Development server started with PID: $DEV_PID"
echo "Server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"

# Wait for the process
wait $DEV_PID
