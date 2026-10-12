#!/bin/bash
# macOS/Linux equivalent of start.bat. Double-click in Finder or run ./start.command
cd "$(dirname "$0")" || exit 1
echo "Starting Sheets Merge Sender Backend Server..."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or not in PATH"
  echo "Install it from https://nodejs.org/ (or: brew install node)"
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install || { echo "Error: Failed to install dependencies"; read -n 1 -s -r -p "Press any key to close..."; exit 1; }
fi

if [ ! -f .env ]; then
  echo "Warning: .env file not found - creating it from env.example"
  cp env.example .env
  echo "Please edit backend/.env with your actual credentials, then run this again."
  open -e .env 2>/dev/null || ${EDITOR:-nano} .env
  read -n 1 -s -r -p "Press any key to continue..."
  echo
fi

echo "Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo
npm start
