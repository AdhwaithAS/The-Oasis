#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================================="
echo "   STARTING HOTEL RESERVATION SYSTEM (JAVA BACKEND + NEXTJS)     "
echo "   Authors: Adhwaith AS (5), Arjun B (16), Martin (35), Naveen (38)"
echo "================================================================="

# Compile backend
mkdir -p backend/bin backend/data backend/logs
javac -d backend/bin $(find backend/src -name "*.java")

# Start Java backend in background
java -cp backend/bin com.hotel.Main &
JAVA_PID=$!
echo "Backend running under PID $JAVA_PID on http://localhost:8080"

# Trap to kill both on exit
cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill $JAVA_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Next.js frontend
cd frontend
echo "Starting Next.js frontend on http://localhost:3000..."
npm run dev
