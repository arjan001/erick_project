# SmartGigs Deployment Script for Windows
# Usage: .\deploy.ps1

$SERVER = "162.0.231.193"
$USER = "root"
$DEPLOY_PATH = "/var/www/smartgigs.oneplusafrica.com"
$PASSWORD = "hj8AIJXbNWbzCj0VQF"

Write-Host "🚀 Deploying SmartGigs to $SERVER..." -ForegroundColor Green
Write-Host ""

# Step 1: Pull latest code
Write-Host "📥 Pulling latest code from GitHub..." -ForegroundColor Cyan
$pullCommand = "cd $DEPLOY_PATH; git pull"
plink -batch -pw $PASSWORD $USER@$SERVER $pullCommand
Write-Host ""

# Step 2: Build the application
Write-Host "🔨 Building the application..." -ForegroundColor Cyan
$buildCommand = "cd $DEPLOY_PATH; npm run build"
plink -batch -pw $PASSWORD $USER@$SERVER $buildCommand
Write-Host ""

# Step 3: Restart PM2
Write-Host "🔄 Restarting PM2 process..." -ForegroundColor Cyan
$restartCommand = "cd $DEPLOY_PATH; pm2 restart smartgigs"
plink -batch -pw $PASSWORD $USER@$SERVER $restartCommand
Write-Host ""

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Visit: https://smartgigs.oneplusafrica.com" -ForegroundColor Yellow
