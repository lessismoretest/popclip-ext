#!/bin/zsh

set -euo pipefail

text="${POPCLIP_TEXT:-}"
[[ -z "$text" ]] && exit 0

BOT_USERNAME="${POPCLIP_OPTION_TARGETUSERNAME:-xiaolin_clawdbot}"
BOT_USERNAME="${BOT_USERNAME#@}"
[[ -z "$BOT_USERNAME" ]] && BOT_USERNAME="xiaolin_clawdbot"
BOT_HANDLE="@${BOT_USERNAME}"

previous_clipboard="$(pbpaste 2>/dev/null || true)"
printf '%s' "$text" | pbcopy

open -a "Telegram" >/dev/null 2>&1 || true

if ! osascript - "$BOT_HANDLE" <<'APPLESCRIPT'
on run argv
set botHandle to item 1 of argv
tell application "Telegram" to activate
delay 0.5
tell application "System Events"
  tell process "Telegram"
    set frontmost to true
  end tell
  -- Use in-app search only to avoid URL scheme confirmation prompts.
  keystroke "k" using command down
  delay 0.2
  keystroke botHandle
  delay 0.2
  key code 36
  delay 0.25
  keystroke "v" using command down
  delay 0.12
  key code 36
end tell
end run
APPLESCRIPT
then
  open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" >/dev/null 2>&1 || true
  osascript <<'APPLESCRIPT' >/dev/null 2>&1 || true
display dialog "请在系统设置中允许 PopClip 的辅助功能权限，然后重试。" buttons {"知道了"} default button "知道了"
APPLESCRIPT
fi

sleep 0.2
printf '%s' "$previous_clipboard" | pbcopy
