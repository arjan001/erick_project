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

# Build the application with production environment
echo "Building application..."
export NODE_ENV=production
npm run build

# Copy to smartgigs subdomain directory
echo "Copying to smartgigs subdomain..."
cp -r dist/* /var/www/smartgigs.oneplusafrica.com/

echo "Deployment complete!"
echo "Site is available at: https://smartgigs.oneplusafrica.com"
