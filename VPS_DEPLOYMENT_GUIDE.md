# VPS Deployment Guide - SmartGigs Kenya

## VPS Details
- **IP**: 162.0.231.193
- **Username**: root
- **Subdomain**: george.oneplusafrica.com

## Step 1: DNS Configuration

Before deploying, you need to configure your DNS:

1. Go to your domain registrar (where oneplusafrica.com is registered)
2. Add an A record for the subdomain:
   - **Name**: george
   - **Type**: A
   - **Value**: 162.0.231.193
   - **TTL**: 300 (or default)

It may take 10-30 minutes for DNS to propagate.

## Step 2: Connect to VPS via SSH

```bash
ssh root@162.0.231.193
```

Enter password: `LPsrt8J5nEyl4EZ793`

## Step 3: Update System & Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (version 18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Install Git
apt install -y git

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

## Step 4: Clone the Repository

```bash
cd /var/www
git clone https://github.com/arjan001/erick_project.git smartgigs
cd smartgigs
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Add your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAKAMESCO_PUBLIC_KEY=your_makamesco_key
VITE_MAKAMESCO_SECRET_KEY=your_makamesco_secret
VITE_RESEND_API_KEY=your_resend_key
```

Save with Ctrl+O, Enter, Ctrl+X

## Step 7: Build the Application

```bash
npm run build
```

## Step 8: Start with PM2

```bash
pm2 start npm --name "smartgigs" -- start
pm2 save
pm2 startup
```

The app will run on port 5173 by default.

## Step 9: Configure Nginx

Create Nginx config:
```bash
nano /etc/nginx/sites-available/smartgigs
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name george.oneplusafrica.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/smartgigs /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## Step 10: Setup SSL Certificate

```bash
certbot --nginx -d george.oneplusafrica.com
```

Follow the prompts to get a free Let's Encrypt SSL certificate.

## Step 11: Configure Firewall

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## Step 12: Verify Deployment

Visit: https://george.oneplusafrica.com

## Step 13: Setup Database

1. Go to your Supabase project
2. Open SQL Editor
3. Run `database/supabase_schema.sql`
4. Run migration files from `database/migrations/` in order

## Update Commands

To update the app in the future:

```bash
cd /var/www/smartgigs
git pull
npm install
npm run build
pm2 restart smartgigs
```

## Troubleshooting

**Check PM2 logs:**
```bash
pm2 logs smartgigs
```

**Check Nginx logs:**
```bash
tail -f /var/log/nginx/error.log
```

**Restart services:**
```bash
pm2 restart smartgigs
systemctl restart nginx
```

**Check Node version:**
```bash
node -v
```

## Security Notes

⚠️ **IMPORTANT**: You should NOT use the root user for regular operations. Consider:

1. Creating a non-root user:
```bash
adduser deploy
usermod -aG sudo deploy
```

2. Setting up SSH key authentication instead of password

3. Disabling password login (after setting up SSH keys)

4. Changing the default SSH port from 22

These are optional but recommended for production security.
