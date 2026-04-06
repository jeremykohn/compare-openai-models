#!/usr/bin/env bash
set -euo pipefail

if ! playwright install --with-deps chromium; then
	echo "playwright install --with-deps chromium failed; falling back to playwright install chromium"
	playwright install chromium
fi
