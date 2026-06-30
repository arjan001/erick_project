#!/bin/bash
# Vuta kodi mpya kutoka GitHub
git pull origin main

# Build upya Docker Image na kuwasha container safi
docker build --no-cache -t studio22-app .
docker stop studio22-container || true
docker rm studio22-container || true
docker run -d --name studio22-container -p 8080:80 --restart always studio22-app
