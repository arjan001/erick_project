#!/bin/bash

# SmartGigs Kenya Deployment Script
# Run this on the VPS after pushing changes to GitHub

cd /var/www/smartgigs

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies if package.json changed
if [ package.json -nt node_modules ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building application..."
npm run build

# Restart the service (if using PM2)
# pm2 restart smartgigs || pm2 start npm --name "smartgigs" -- start

echo "Deployment complete!"
