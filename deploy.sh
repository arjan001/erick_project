#!/bin/bash
# SmartGigs Deployment Script
# Usage: ./deploy.sh

SERVER="162.0.231.193"
USER="root"
DEPLOY_PATH="/var/www/smartgigs"
KEY="$HOME/.ssh/smartgigs_key"

echo "🚀 Deploying SmartGigs to $SERVER..."
echo ""

# Step 1: Pull latest code
echo "📥 Pulling latest code from GitHub..."
ssh -i $KEY $USER@$SERVER "cd $DEPLOY_PATH && git pull"
echo ""

# Step 2: Build the application
echo "🔨 Building the application..."
ssh -i $KEY $USER@$SERVER "cd $DEPLOY_PATH && npm run build"
echo ""

# Step 3: Restart PM2
echo "🔄 Restarting PM2 process..."
ssh -i $KEY $USER@$SERVER "cd $DEPLOY_PATH && pm2 restart smartgigs"
echo ""

echo "✅ Deployment complete!"
echo "🌐 Visit: https://smartgigs.oneplusafrica.com"
