# SmartGigs Kenya - VPS SSL Setup & Deployment

## Current Issue
Your site (https://smartgigs.oneplusafrica.com) is showing the default Webuzo page instead of your React application. This means:
1. The build files haven't been deployed to the web server directory
2. The web server (Apache/Nginx) isn't configured to serve the React app
3. SSL certificate needs to be configured

## Solution

### Step 1: SSH into your VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Clone or Update the Repository
```bash
cd /var/www
git clone https://github.com/arjan001/erick_project.git smartgigs
cd smartgigs
```

### Step 3: Install Dependencies and Build
```bash
npm install
npm run build
```

### Step 4: Configure Web Server

#### Option A: If using Apache (Webuzo default)

1. Create Apache configuration:
```bash
nano /etc/apache2/sites-available/smartgigs.conf
```

Add this content:
```apache
<VirtualHost *:80>
    ServerName smartgigs.oneplusafrica.com
    ServerAlias www.smartgigs.oneplusafrica.com

    DocumentRoot /var/www/smartgigs/dist

    <Directory /var/www/smartgigs/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA fallback
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/smartgigs_error.log
    CustomLog ${APACHE_LOG_DIR}/smartgigs_access.log combined
</VirtualHost>
```

2. Enable the site:
```bash
a2ensite smartgigs.conf
systemctl restart apache2
```

#### Option B: If using Nginx

1. Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/smartgigs
```

Add this content:
```nginx
server {
    listen 80;
    server_name smartgigs.oneplusafrica.com www.smartgigs.oneplusafrica.com;

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

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

2. Enable the site:
```bash
ln -s /etc/nginx/sites-available/smartgigs /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 5: Install SSL Certificate (Let's Encrypt)

#### For Apache:
```bash
# Install Certbot
apt install -y certbot python3-certbot-apache

# Obtain SSL certificate
certbot --apache -d smartgigs.oneplusafrica.com -d www.smartgigs.oneplusafrica.com
```

#### For Nginx:
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d smartgigs.oneplusafrica.com -d www.smartgigs.oneplusafrica.com
```

Certbot will automatically:
- Install the SSL certificate
- Configure the web server to use HTTPS
- Set up auto-renewal

### Step 6: Verify

1. Check if the site is accessible:
   ```bash
   curl -I http://smartgigs.oneplusafrica.com
   ```

2. Check SSL:
   ```bash
   curl -I https://smartgigs.oneplusafrica.com
   ```

3. Check web server logs:
   ```bash
   # Apache
   tail -f /var/log/apache2/smartgigs_error.log

   # Nginx
   tail -f /var/log/nginx/error.log
   ```

### Step 7: Force HTTPS Redirect (Optional)

Add this to your web server config to force all traffic to HTTPS:

#### Apache (already handled by Certbot):
```apache
<VirtualHost *:80>
    ServerName smartgigs.oneplusafrica.com
    Redirect permanent / https://smartgigs.oneplusafrica.com/
</VirtualHost>
```

#### Nginx:
```nginx
server {
    listen 80;
    server_name smartgigs.oneplusafrica.com www.smartgigs.oneplusafrica.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name smartgigs.oneplusafrica.com www.smartgigs.oneplusafrica.com;

    # SSL certificates (added by Certbot)
    ssl_certificate /etc/letsencrypt/live/smartgigs.oneplusafrica.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smartgigs.oneplusafrica.com/privkey.pem;

    # ... rest of config
}
```

## Troubleshooting

### Issue: Still showing Webuzo default page
**Solution:**
1. Check if files are in the right place:
   ```bash
   ls -la /var/www/smartgigs/dist/
   ```
2. Check Apache/Nginx config is pointing to the right directory
3. Restart web server:
   ```bash
   systemctl restart apache2  # or nginx
   ```

### Issue: SSL not working
**Solution:**
1. Check certificate status:
   ```bash
   certbot certificates
   ```
2. Renew manually:
   ```bash
   certbot renew
   ```
3. Check port 443 is open:
   ```bash
   ufw allow 443/tcp
   ```

### Issue: Build not working on VPS
**Solution:**
1. Build locally and upload `dist` folder
2. Or ensure Node.js 18+ is installed on VPS

## Quick Deploy Script

I've created `deploy-to-vps.sh` in the project root. Upload it to your VPS and run:

```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

Then follow Steps 4-7 above to configure the web server and SSL.
