#!/bin/bash
# macOS/Linux version of make_release.ps1. Builds dist/sheets_merge_sender-v<version>-mac.zip
# Usage: scripts/make_release.sh            (Apple Silicon; ARCH=x64 for Intel Macs)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
ARCH="${ARCH:-arm64}"
VERSION="$(node -p "require('$BACKEND/package.json').version")"
NAME="sheets_merge_sender-v$VERSION-mac"
STAGE="$ROOT/dist/$NAME"
ZIP="$ROOT/dist/$NAME.zip"

rm -rf "$STAGE" "$ZIP"
mkdir -p "$STAGE/backend"
for f in server.js sheets_merge_sender_browser.html package.json package-lock.json; do
  cp "$BACKEND/$f" "$STAGE/backend/$f"
done
cp "$ROOT/scripts/release_start.command" "$STAGE/start.command"
chmod +x "$STAGE/start.command"
cp "$ROOT/USER_GUIDE.md" "$ROOT/LICENSE" "$STAGE/"

(cd "$STAGE/backend" && npm install --omit=dev --no-audit --no-fund)

# Portable Node (latest v22 LTS), cached between builds
CACHE="$ROOT/dist/cache"; mkdir -p "$CACHE"
VER="$(curl -fsSL https://nodejs.org/dist/index.json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).find(r=>r.version.startsWith('v22.')).version))")"
TARBALL="$CACHE/node-$VER-darwin-$ARCH.tar.gz"
[ -f "$TARBALL" ] || curl -fsSL "https://nodejs.org/dist/$VER/node-$VER-darwin-$ARCH.tar.gz" -o "$TARBALL"
mkdir -p "$STAGE/runtime"
tar -xzf "$TARBALL" -C "$CACHE" "node-$VER-darwin-$ARCH/bin/node" "node-$VER-darwin-$ARCH/LICENSE"
cp "$CACHE/node-$VER-darwin-$ARCH/bin/node" "$STAGE/runtime/node"
cp "$CACHE/node-$VER-darwin-$ARCH/LICENSE" "$STAGE/runtime/NODE_LICENSE.txt"
rm -rf "$CACHE/node-$VER-darwin-$ARCH"

# Sanitized env template
sed -E \
  -e 's/^(TWILIO_PHONE_NUMBER)=.*/\1=+15551234567/' \
  -e 's/^(SECRETARY_EMAIL)=.*/\1=secretary@example.com/' \
  -e 's/^(TEST_PHONE_NUMBER)=.*/\1=+15557654321/' \
  -e 's/^(TEST_EMAIL_ADDR)=.*/\1=you@example.com/' \
  "$BACKEND/env.example" > "$STAGE/backend/env.example"

node "$ROOT/scripts/make_sample_xlsx.js" "$STAGE/SampleMergeList.xlsx"

cat > "$STAGE/README_FIRST.txt" <<TXT
Sheets Merge Sender v$VERSION (macOS)
=====================================

1. Unzip the whole folder somewhere (e.g. Documents).
2. First time only: in Terminal run   xattr -dr com.apple.quarantine <folder>
   (macOS blocks the bundled Node otherwise), then double-click start.command.
   If double-click is blocked: right-click > Open.
3. First run opens backend/.env in TextEdit: enter YOUR Twilio / Gmail details, save, close.
4. Your browser opens to http://localhost:3000 - pick your spreadsheet.
   SampleMergeList.xlsx shows the expected format (sheets: List, Template).

Start with Preview / Test File modes - they send nothing.
See USER_GUIDE.md for full details.
TXT

(cd "$ROOT/dist" && zip -qr "$NAME.zip" "$NAME")
echo "Created $ZIP"
