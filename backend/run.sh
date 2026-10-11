#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=== Compiling Java OOP Backend ==="
mkdir -p bin data logs
javac -d bin $(find src -name "*.java")

echo "=== Freeing port 8080 if currently occupied ==="
fuser -k 8080/tcp 2>/dev/null || true
sleep 0.5

echo "=== Starting Hotel Reservation System Java Server on port 8080 ==="
exec java -cp bin com.hotel.Main
