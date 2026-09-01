#!/bin/bash
# Sync script: Auto-commit and push changes to GitHub
MSG=${1:-"update: auto sync from antigravity"}
git add .
git commit -m "$MSG"
git push origin main
echo "🚀 Berhasil di-sync ke GitHub! Website Anda akan terupdate otomatis dalam ~30 detik."
