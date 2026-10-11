# Subdomain Setup Guide for oneplusafrica.com

## VPS Configuration Complete ✅

I've configured your VPS to host 3 subdomains:
- **cars.oneplusafrica.com** → /var/www/cars.oneplusafrica.com (Coming Soon page)
- **iptv.oneplusafrica.com** → /var/www/iptv.oneplusafrica.com (Coming Soon page)
- **smartgigs.oneplusafrica.com** → /var/www/smartgigs.oneplusafrica.com (SmartGigs Kenya application)

## Next Step: Add DNS Records in Namecheap

1. **Log in to your Namecheap account**
2. **Go to Domain List** → oneplusafrica.com → **Manage**
3. **Go to Advanced DNS** tab
4. **Add the following A Records:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | cars | 162.0.231.193 | Automatic |
| A Record | iptv | 162.0.231.193 | Automatic |
| A Record | smartgigs | 162.0.231.193 | Automatic |

**Note:** For "Host" field, just enter: `cars`, `iptv`, `smartgigs` (not the full domain)

## After DNS Propagation

DNS propagation typically takes **5-30 minutes**, but can take up to 24 hours in some cases.

Once DNS propagates, your sites will be accessible at:
- http://cars.oneplusafrica.com
- http://iptv.oneplusafrica.com
- http://smartgigs.oneplusafrica.com

## Setup SSL Certificates (Optional but Recommended)

After DNS is working, run these commands on your VPS to enable HTTPS:

```bash
# Install SSL for all 3 subdomains
certbot --nginx -d cars.oneplusafrica.com
certbot --nginx -d iptv.oneplusafrica.com
certbot --nginx -d smartgigs.oneplusafrica.com

# Or all at once
certbot --nginx -d cars.oneplusafrica.com -d iptv.oneplusafrica.com -d smartgigs.oneplusafrica.com
```

## Future SmartGigs Deployments

After making local changes and pushing to GitHub, deploy by running on the VPS:

```bash
cd /var/www/smartgigs
./deploy.sh
```

This will:
1. Pull latest changes from GitHub
2. Install dependencies if needed
3. Build the application
4. Copy files to smartgigs.oneplusafrica.com

## Directory Structure

```
/var/www/
├── cars.oneplusafrica.com/     (Cars subdomain)
│   └── index.html
├── iptv.oneplusafrica.com/     (IPTV subdomain)
│   └── index.html
├── smartgigs.oneplusafrica.com/ (SmartGigs subdomain)
│   ├── index.html
│   ├── assets/
│   └── brands/
└── smartgigs/                   (Git repository)
    ├── dist/
    ├── src/
    ├── deploy.sh
    └── ...
```

## To Deploy Cars or IPTV Projects Later

When you're ready to deploy actual projects to Cars or IPTV:

1. Clone or upload your project to the respective directory
2. Update the Nginx config if needed (currently set up for static HTML)
3. Run `systemctl reload nginx`

For example, if Cars is a React app:
```bash
cd /var/www/cars.oneplusafrica.com
# Build your project here
npm run build
# Move build files to root
```

## VPS Details

- **IP:** 162.0.231.193
- **User:** root
- **Web Server:** Nginx
- **OS:** Ubuntu 24.04

## Security Note

⚠️ **Important:** The VPS root password was shared in our conversation. You should:
1. Change the root password immediately
2. Create a non-root user for deployments
3. Set up SSH key authentication
4. Disable password authentication for SSH

```bash
# Change root password
passwd

# Create deploy user
adduser deploy
usermod -aG sudo deploy
```
