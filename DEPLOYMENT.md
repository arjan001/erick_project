# SmartGigs Kenya - Deployment Guide

This guide covers deployment of SmartGigs Kenya to **cPanel** and **VPS** environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [cPanel Deployment](#cpanel-deployment)
5. [VPS Deployment](#vps-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Base44 Account** (for backend) OR **Supabase Project** (if using Supabase backend)
- **Domain Name** (e.g., smartgigs.co.ke)
- **SSL Certificate** (Let's Encrypt recommended)

### Payment Gateway Credentials

- **M-Pesa Daraja API** (from https://developer.safaricom.co.ke/)
  - Consumer Key
  - Consumer Secret
  - Short Code
  - Passkey
  - Callback URL

### Email Service Credentials

- **Resend API Key** (recommended) OR
- **SMTP Configuration** (host, port, username, password)

---

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Base44 Backend (Primary)
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=https://api.base44.io
VITE_PUBLISHABLE_KEY=your_publishable_key

# Supabase (Alternative/Backup)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_URL=https://smartgigs.co.ke
VITE_APP_NAME=SmartGigs Kenya
NODE_ENV=production
```

---

## Database Setup

### Option 1: Base44 (Primary)

1. Create a Base44 account at https://base44.io/
2. Create a new application
3. Copy your App ID, Base URL, and Publishable Key
4. Add to environment variables

### Option 2: Supabase (Alternative)

1. Create a Supabase project at https://supabase.com/
2. Run the SQL schema migrations:
   ```bash
   # Run the main schema
   psql -h your-supabase-host -U postgres -d postgres -f database/supabase_schema.sql

   # Run individual migrations as needed
   psql -h your-supabase-host -U postgres -d postgres -f database/migrations/
   ```

3. Enable required extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

4. Configure Storage buckets:
   - `images` - for profile images, logos
   - `videos` - for portfolio videos, showreels
   - `documents` - for CVs, licenses

5. Set up Row Level Security (RLS) policies for security

---

## cPanel Deployment

### Step 1: Upload Files

1. **Build the application locally:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your cPanel `public_html` directory using:
   - File Manager
   - FTP (FileZilla)
   - SFTP

### Step 2: Configure Node.js Application

1. Go to **cPanel > Setup Node.js App**

2. **Create Application:**
   - Node.js version: 18 or higher
   - Application mode: Production
   - Application root: `/home/username/smartgigs`
   - Application URL: `smartgigs.co.ke`
   - Application startup file: `server.js` (create this)

3. **Create `server.js`** (if not exists):
   ```javascript
   const express = require('express');
   const fs = require('fs');
   const path = require('path');

   const app = express();
   const port = process.env.PORT || 3000;

   // Serve static files from dist
   app.use(express.static(path.join(__dirname, 'dist')));

   // SPA fallback
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
   });

   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

4. **Add dependencies to `package.json`:**
   ```json
   {
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Restart the application** in cPanel

### Step 3: Configure SSL

1. Go to **cPanel > SSL/TLS Status**
2. Enable AutoSSL for your domain
3. Force HTTPS redirect (add to `.htaccess`):
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Step 4: Configure Environment Variables

1. Go to **cPanel > Setup Node.js App**
2. Click **Edit** on your application
3. Add environment variables from the [Environment Variables](#environment-variables) section

---

## VPS Deployment

### Step 1: Server Setup

**Ubuntu/Debian:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 2: Clone Repository

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/erick_project.git smartgigs
cd smartgigs

# Install dependencies
npm install
```

### Step 3: Build Application

```bash
# Set environment variables
export NODE_ENV=production
export VITE_BASE44_APP_ID=your_app_id
export VITE_BASE44_APP_BASE_URL=https://api.base44.io
export VITE_PUBLISHABLE_KEY=your_key

# Build
npm run build
```

### Step 4: Configure PM2

```bash
# Create ecosystem file
nano ecosystem.config.js
```

Add the following:

```javascript
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
      PORT: 3000,
      VITE_BASE44_APP_ID: 'your_app_id',
      VITE_BASE44_APP_BASE_URL: 'https://api.base44.io',
      VITE_PUBLISHABLE_KEY: 'your_key'
    }
  }]
}
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 5: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/smartgigs
```

Add the following:

```nginx
server {
    listen 80;
    server_name smartgigs.co.ke www.smartgigs.co.ke;

    root /var/www/smartgigs/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy to Node.js (if using server.js)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smartgigs /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d smartgigs.co.ke -d www.smartgigs.co.ke

# Auto-renewal is configured automatically
```

### Step 7: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Post-Deployment Configuration

### 1. Admin Setup

1. Access the admin panel at `/admin`
2. Create admin account
3. Configure authentication providers (Supabase is default, Clerk is optional backup)
4. Configure payment settings (M-Pesa Daraja credentials)
5. Configure email settings (Resend or SMTP)

### 2. Storage Configuration

**For Supabase:**
- Create storage buckets via Supabase dashboard
- Configure bucket policies (public/private)
- Set up CDN if needed

**For Base44:**
- File uploads are handled automatically via Base44 SDK

### 3. Feature Flags

Configure feature flags in admin:
- Enable/disable crew portal
- Enable/disable auction functionality
- Enable/disable public profiles

### 4. SEO Configuration

- Update meta tags in admin CMS
- Submit sitemap to Google Search Console
- Configure robots.txt

### 5. Analytics

- Add Google Analytics tracking ID in admin settings
- Configure custom analytics if needed

---

## Troubleshooting

### Build Errors

**Issue:** Build fails with module not found errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 502 Bad Gateway

**Issue:** Nginx returns 502 error

**Solution:**
```bash
# Check if PM2 app is running
pm2 status

# Restart app
pm2 restart smartgigs

# Check logs
pm2 logs smartgigs
```

### Environment Variables Not Loading

**Issue:** App behaves as if in development mode

**Solution:**
- Verify `.env.production` file exists
- Check PM2 ecosystem config
- Restart PM2 app after env changes

### Database Connection Issues

**Issue:** Cannot connect to Base44/Supabase

**Solution:**
- Verify API keys are correct
- Check network connectivity
- Review Base44/Supabase dashboard for status
- Check CORS settings

### SSL Certificate Issues

**Issue:** SSL not working or expired

**Solution:**
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## Automated Deployment Script (VPS)

Create `deploy.sh` for automated deployment:

```bash
#!/bin/bash

# Variables
REPO_URL="https://github.com/yourusername/erick_project.git"
APP_DIR="/var/www/smartgigs"
BRANCH="main"

# Pull latest code
cd $APP_DIR
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart smartgigs

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run:
```bash
./deploy.sh
```

---

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs smartgigs

# Monitor in real-time
pm2 monit
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring

Consider installing:
- **Netdata** - Real-time server monitoring
- **Uptime Robot** - External uptime monitoring
- **Sentry** - Error tracking

---

## Backup Strategy

### Database Backup

**For Supabase:**
- Use Supabase dashboard backup feature
- Or use pg_dump for manual backups

**For Base44:**
- Base44 handles backups automatically

### Code Backup

```bash
# Backup entire application
tar -czf smartgigs-backup-$(date +%Y%m%d).tar.gz /var/www/smartgigs

# Backup to remote server
scp smartgigs-backup-*.tar.gz user@backup-server:/backups/
```

---

## Security Checklist

- [ ] SSL certificate installed and valid
- [ ] Firewall configured (only necessary ports open)
- [ ] Environment variables set (not in code)
- [ ] Database credentials secure
- [ ] API keys rotated regularly
- [ ] Automatic security updates enabled
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Input validation implemented
- [ ] File upload validation configured
- [ ] Regular backups scheduled

---

## Support

For deployment issues:
- Check logs: `pm2 logs smartgigs`
- Review Nginx logs: `/var/log/nginx/error.log`
- Contact hosting provider support
- Check Base44/Supabase status pages

---

**Last Updated:** October 9, 2026
