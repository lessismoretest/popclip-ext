#!/bin/zsh

set -euo pipefail

code="${POPCLIP_TEXT:-}"
[[ -z "$code" ]] && exit 1

open -na Ghostty.app --args -e /bin/zsh -lc "$code"
