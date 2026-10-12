#!/bin/bash
# macOS launcher for the release zip (equivalent of start.bat)
cd "$(dirname "$0")/backend" || exit 1
if [ ! -f .env ]; then
  cp env.example .env
  echo "First run: opening .env so you can enter your Twilio / Gmail details."
  echo "Save and close TextEdit to continue."
  open -W -e .env
fi
NODE="$(cd .. && pwd)/runtime/node"
[ -x "$NODE" ] || NODE="$(command -v node)"
if [ -z "$NODE" ]; then echo "Node.js not found. Install from https://nodejs.org/"; read -n 1 -s -r; exit 1; fi
echo "Starting Sheets Merge Sender on http://localhost:3000"
echo "Leave this window open while using the app. Close it to stop."
(sleep 3; open http://localhost:3000) &
"$NODE" server.js
