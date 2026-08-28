#!/usr/bin/env bash
# 開發用啟動腳本：若本機裝了 nvm，會自動切到 .nvmrc 指定的 Node 版本
# (Next.js 需要 Node 18.18+，建議用 20 LTS)。沒有 nvm 也沒關係，會直接
# 用系統目前的 node 執行。
set -e
cd "$(dirname "$0")/.."

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  \. "$NVM_DIR/nvm.sh"
  nvm use >/dev/null 2>&1 || nvm install
fi

exec npm run dev
