#!/bin/bash
# Production Server Runner for Unix/Linux/macOS

echo "=== Production Server Runner ==="

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

# Build the project
echo "Building project for production..."
if pnpm run build; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed. Exiting."
    exit 1
fi

# Start production server
echo "Starting production server..."
pnpm start &
PROD_PID=$!

echo "Production server started with PID: $PROD_PID"
echo "Server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"

# Wait for the process
wait $PROD_PID
