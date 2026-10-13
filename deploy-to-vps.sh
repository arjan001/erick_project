#!/bin/bash

# SmartGigs Kenya - VPS Deployment Script
# Run this on your VPS to deploy the application

echo "=== SmartGigs Kenya Deployment ==="

# Variables
APP_DIR="/var/www/smartgigs"
REPO_URL="https://github.com/arjan001/erick_project.git"
BRANCH="main"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create app directory if not exists
if [ ! -d "$APP_DIR" ]; then
    echo "Creating app directory..."
    mkdir -p $APP_DIR
    cd $APP_DIR
    git clone $REPO_URL .
else
    echo "Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create ecosystem.config.js for PM2
echo "Creating PM2 ecosystem config..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'smartgigs',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Create simple Express server
echo "Creating Express server..."
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - all routes go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`SmartGigs Kenya server running on port ${port}`);
});
EOF

# Install express if not in dependencies
if ! grep -q "express" package.json; then
    echo "Installing Express..."
    npm install express
fi

# Stop existing PM2 process if running
pm2 stop smartgigs 2>/dev/null || true
pm2 delete smartgigs 2>/dev/null || true

# Start with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /home/root

echo "=== Deployment Complete ==="
echo "Application is running on port 3000"
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs smartgigs"
