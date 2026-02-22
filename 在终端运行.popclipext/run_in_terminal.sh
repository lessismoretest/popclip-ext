#!/bin/zsh

set -euo pipefail

code="${POPCLIP_TEXT:-}"
[[ -z "$code" ]] && exit 1

# Escape content for AppleScript string literal.
escaped=$(printf '%s' "$code" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

osascript <<EOF
tell application "Terminal"
  activate
  do script "$escaped"
end tell
EOF
