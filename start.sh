#!/bin/bash

# Kill any existing processes
pkill -f "next"
pkill -f "tsx"
pkill -f "uvicorn"
pkill -f "python app.py"

echo "Starting API..."
cd api && npm run dev &
API_PID=$!

echo "Starting Optimizer..."
cd ../optimization && python app.py &
OPT_PID=$!

echo "Starting Frontend (forcing port 3000)..."
cd ../web && npx next dev -p 3000 &
WEB_PID=$!

echo "All services started!"
echo "Press Ctrl+C to stop all."

# Wait for all background processes
wait $API_PID $OPT_PID $WEB_PID
