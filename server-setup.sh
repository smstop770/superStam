#!/bin/bash
# ============================================================
# One-time server setup for Super STaM
# Run once on the server: bash server-setup.sh
# ============================================================
set -e

DEPLOY_PATH="/root/NewPro/super-stam"
REPO_URL="https://github.com/smstop770/superStam.git"

echo "══════════════════════════════════════"
echo "  Super STaM — Server Setup"
echo "══════════════════════════════════════"

# 1. Install Node.js 20 if missing
if ! command -v node &>/dev/null; then
  echo "[1/6] Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "[1/6] Node.js $(node -v) already installed ✓"
fi

# 2. Install nginx if missing
if ! command -v nginx &>/dev/null; then
  echo "[2/6] Installing nginx..."
  apt-get update && apt-get install -y nginx
else
  echo "[2/6] nginx already installed ✓"
fi

# 3. Clone repo
echo "[3/6] Cloning repository..."
mkdir -p "$(dirname $DEPLOY_PATH)"
if [ -d "$DEPLOY_PATH" ]; then
  echo "      Directory exists — pulling instead..."
  cd "$DEPLOY_PATH" && git pull origin main
else
  git clone "$REPO_URL" "$DEPLOY_PATH"
fi
cd "$DEPLOY_PATH"

# 4. Create .env if missing
if [ ! -f "server/.env" ]; then
  echo "[4/6] Creating server/.env from example..."
  cp server/.env.example server/.env
  echo ""
  echo "  ⚠️  IMPORTANT: Edit server/.env with your real values!"
  echo "      nano $DEPLOY_PATH/server/.env"
  echo ""
else
  echo "[4/6] server/.env already exists ✓"
fi

# 5. Install dependencies & build
echo "[5/6] Installing & building..."
cd server && npm install --omit=dev && npm run build && cd ..
cd client && npm install && npm run build && cd ..

# 6. Setup nginx
echo "[6/6] Configuring nginx..."
cp nginx.conf /etc/nginx/sites-available/super-stam
ln -sf /etc/nginx/sites-available/super-stam /etc/nginx/sites-enabled/super-stam
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Start with PM2
echo "── Starting with PM2 ──"
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash || true

echo ""
echo "══════════════════════════════════════"
echo "  ✅ Setup complete!"
echo ""
echo "  Site:   http://38.242.215.142"
echo "  Admin:  http://38.242.215.142/admin"
echo ""
echo "  ⚠️  Don't forget to edit server/.env:"
echo "      nano $DEPLOY_PATH/server/.env"
echo "══════════════════════════════════════"
