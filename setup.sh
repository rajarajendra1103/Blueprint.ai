#!/usr/bin/env bash
set -e

echo "=============================================="
echo "  Blueprint.ai - Quick Setup & Start"
echo "=============================================="
echo ""
echo "[1/2] Installing dependencies across all workspaces..."
npm install

echo ""
echo "[2/2] Launching Blueprint.ai dev servers..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
npm run dev
