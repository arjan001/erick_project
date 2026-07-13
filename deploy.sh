#!/bin/bash

# Studio22 Deployment Script
# This script automates the deployment process for Studio22

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="studio22"
CONTAINER_NAME="${APP_NAME}-container"
IMAGE_NAME="${APP_NAME}-app"
PORT=8080
GIT_BRANCH="main"

echo -e "${GREEN}Starting Studio22 deployment...${NC}"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Please copy env.production.example to .env.production and configure it"
    exit 1
fi

# Pull latest code from GitHub
echo -e "${YELLOW}Pulling latest code from GitHub...${NC}"
git pull origin $GIT_BRANCH

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}Building application for production...${NC}"
npm run build

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build --no-cache -t $IMAGE_NAME .

# Stop and remove existing container
echo -e "${YELLOW}Stopping existing container...${NC}"
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

# Run new container
echo -e "${YELLOW}Starting new container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --restart always \
    --env-file .env.production \
    $IMAGE_NAME

# Health check
echo -e "${YELLOW}Performing health check...${NC}"
sleep 5

if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    echo -e "${GREEN}Deployment successful! Application is running on port $PORT${NC}"
else
    echo -e "${RED}Health check failed. Please check the logs:${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Cleanup old Docker images (keep last 5)
echo -e "${YELLOW}Cleaning up old Docker images...${NC}"
docker image prune -a -f --filter "until=24h"

echo -e "${GREEN}Deployment completed successfully!${NC}"
