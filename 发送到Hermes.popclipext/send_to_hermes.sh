#!/bin/zsh

set -uo pipefail

text="${POPCLIP_TEXT:-}"
[[ -z "$text" ]] && exit 0

base_url="http://127.0.0.1:8642"
env_file="$HOME/.hermes/.env"
state_dir="$HOME/Library/Application Support/PopClipHermes"
state_file="$state_dir/session-id"
session_title="PopClip 快捷发送"
hermes_db="$HOME/.hermes/state.db"

notify_error() {
  osascript <<APPLESCRIPT >/dev/null 2>&1 || true
display notification "$1" with title "PopClip · Hermes"
APPLESCRIPT
}

api_key="$(awk -F= '/^API_SERVER_KEY=/{sub(/^API_SERVER_KEY=/,""); print; exit}' "$env_file" 2>/dev/null)"
if [[ -z "$api_key" ]]; then
  notify_error "未找到 Hermes API 密钥"
  exit 1
fi

session_exists() {
  local sid="$1"
  [[ -n "$sid" ]] || return 1
  local http_status
  http_status="$(curl -sS --max-time 4 -o /dev/null -w '%{http_code}' \
    -H "Authorization: Bearer $api_key" \
    "$base_url/api/sessions/$sid" 2>/dev/null)" || return 1
  [[ "$http_status" == "200" ]]
}

find_session_by_title() {
  curl -sS --max-time 6 -G \
    -H "Authorization: Bearer $api_key" \
    --data-urlencode "title=$session_title" \
    --data-urlencode "limit=50" \
    --data-urlencode "include_hidden=true" \
    "$base_url/api/sessions" 2>/dev/null |
    /usr/bin/jq -r '.data[0].id // empty' 2>/dev/null
}

latest_desktop_session_since() {
  local since="$1"
  /usr/bin/sqlite3 -readonly "$hermes_db" \
    "select id from sessions
     where source in ('local', 'gui')
       and created_source = 'desktop'
       and started_at >= $since
     order by started_at desc
     limit 1;" 2>/dev/null
}

set_session_title() {
  local sid="$1"
  local payload
  payload="$(/usr/bin/jq -nc --arg title "$session_title" '{title: $title}')" || return 1
  curl -sS --max-time 6 -X PATCH \
    -H "Authorization: Bearer $api_key" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$base_url/api/sessions/$sid" >/dev/null 2>&1
}

send_with_ui() {
  osascript <<'APPLESCRIPT'
tell application "Hermes" to activate
delay 0.7
tell application "System Events"
  tell process "Hermes"
    set frontmost to true
    keystroke "v" using command down
    delay 0.35
    key code 36
  end tell
end tell
APPLESCRIPT
}

create_fixed_session() {
  local since sid
  since="$(/bin/date +%s)"

  if ! osascript <<'APPLESCRIPT'
tell application "Hermes" to activate
delay 0.9
tell application "System Events"
  tell process "Hermes"
    set frontmost to true
    keystroke "n" using command down
  end tell
end tell
APPLESCRIPT
  then
    return 1
  fi

  sleep 0.7
  send_with_ui || return 1

  for _ in {1..20}; do
    sid="$(latest_desktop_session_since "$since")"
    [[ -n "$sid" ]] && break
    sleep 0.4
  done

  [[ -n "$sid" ]] || return 1
  printf '%s\n' "$sid" > "$state_file"
  set_session_title "$sid"
}

mkdir -p "$state_dir"

session_id=""
if [[ -f "$state_file" ]]; then
  session_id="$(tr -d '[:space:]' < "$state_file" 2>/dev/null)"
fi

if ! session_exists "$session_id"; then
  session_id="$(find_session_by_title)"
fi

previous_clipboard="$(pbpaste 2>/dev/null || true)"
printf '%s' "$text" | pbcopy

if [[ -z "$session_id" ]]; then
  if ! create_fixed_session; then
    notify_error "无法创建 Hermes 会话"
    printf '%s' "$previous_clipboard" | pbcopy
    exit 1
  fi
  sleep 0.2
  printf '%s' "$previous_clipboard" | pbcopy
  exit 0
fi

printf '%s\n' "$session_id" > "$state_file"

if ! open "hermes://open/$session_id"; then
  notify_error "无法打开 Hermes 会话"
  printf '%s' "$previous_clipboard" | pbcopy
  exit 1
fi

sleep 1.2

if ! send_with_ui; then
  notify_error "请在辅助功能中允许 PopClip 控制电脑"
  printf '%s' "$previous_clipboard" | pbcopy
  exit 1
fi

sleep 0.2
printf '%s' "$previous_clipboard" | pbcopy
