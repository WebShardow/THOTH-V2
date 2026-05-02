#!/bin/bash
# Server Stopper for Unix/Linux/macOS

echo "=== Server Stopper ==="

# Stop all Node.js processes
echo "Checking for Node.js processes..."
if pgrep -f "node" > /dev/null; then
    echo "Found Node.js processes, stopping them..."
    pkill -f "node"
    sleep 2
    
    # Verify
    if pgrep -f "node" > /dev/null; then
        echo "⚠️  Warning: Some processes may still be running"
    else
        echo "✅ Successfully stopped all Node.js processes"
    fi
else
    echo "✅ No Node.js processes found - nothing to stop"
fi

# Ask about Docker containers
echo ""
read -p "Stop Docker containers too? (y/N): " response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Stopping Docker containers..."
    if command -v docker-compose &> /dev/null; then
        docker-compose down 2>/dev/null && echo "✅ Docker containers stopped" || echo "No Docker containers to stop"
    else
        echo "Docker Compose not found"
    fi
fi

echo ""
echo "✅ All servers stopped successfully!"
