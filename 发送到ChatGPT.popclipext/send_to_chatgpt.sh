#!/bin/zsh

set -euo pipefail

text="${POPCLIP_TEXT:-}"
[[ -z "$text" ]] && exit 0

previous_clipboard="$(pbpaste 2>/dev/null || true)"
printf '%s' "$text" | pbcopy

if ! osascript <<'APPLESCRIPT'
tell application "ChatGPT" to activate
delay 0.35
tell application "System Events"
  tell process "ChatGPT"
    set frontmost to true
    -- Avoid global Cmd+N hotkey conflicts (e.g. Alfred); click menu item instead.
    try
      click menu item "New Chat" of menu "File" of menu bar item "File" of menu bar 1
    on error
      try
        click menu item "新建聊天" of menu "文件" of menu bar item "文件" of menu bar 1
      end try
    end try
  end tell
  delay 0.25
  keystroke "v" using command down
  delay 0.15
  key code 36
end tell
APPLESCRIPT
then
  open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" >/dev/null 2>&1 || true
  osascript <<'APPLESCRIPT' >/dev/null 2>&1 || true
display dialog "请在 系统设置 > 隐私与安全性 > 辅助功能 中，允许 PopClip（和 osascript）控制你的电脑，然后重试。" buttons {"知道了"} default button "知道了"
APPLESCRIPT
fi

sleep 0.2
printf '%s' "$previous_clipboard" | pbcopy
