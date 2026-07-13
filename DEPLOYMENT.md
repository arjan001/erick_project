# Studio22 Deployment Guide

## Overview

This guide covers the deployment process for Studio22 to production environments.

## Prerequisites

- Node.js 18+ installed
- Base44 account with API credentials
- Brevo account for email services
- Domain name configured
- SSL certificate (optional but recommended)
- CDN account (optional but recommended)

## Environment Configuration

### 1. Environment Variables

Copy the example environment file and configure production values:

```bash
cp env.production.example .env.production
```

Edit `.env.production` with your actual values:

**Required Variables:**
- `VITE_BASE44_APP_ID` - Your Base44 application ID
- `VITE_BASE44_APP_BASE_URL` - Base44 API URL
- `VITE_PUBLISHABLE_KEY` - Your Base44 publishable key
- `VITE_BREVO_API_KEY` - Brevo API key for emails
- `VITE_ENCRYPTION_KEY` - Secure key for data encryption

**Optional Variables:**
- `VITE_WS_URL` - WebSocket server URL
- `VITE_CDN_URL` - CDN URL for static assets
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key for payments

### 2. Security Best Practices

- **Never commit `.env.production` to version control**
- Use strong, unique encryption keys
- Rotate API keys regularly
- Enable 2FA for all admin accounts
- Use HTTPS in production

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 3. Test Production Build Locally

```bash
npm run preview
```

This serves the production build locally for testing.

## Deployment Options

### Option 1: Vercel (Recommended)

#### Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Environment Variables in Vercel

Add environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all variables from `.env.production`

#### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable automatic HTTPS

### Option 2: Netlify

#### Setup

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

#### Environment Variables in Netlify

Add environment variables in Netlify dashboard:
- Go to Site Settings → Environment Variables
- Add all variables from `.env.production`

### Option 3: Traditional VPS/Cloud

#### Setup

1. Build the application:
```bash
npm run build
```

2. Upload `dist/` directory to your server
3. Configure web server (Nginx example below)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name studio22.com www.studio22.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name studio22.com www.studio22.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/studio22/dist;
    index index.html;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName studio22.com
    Redirect permanent / https://studio22.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName studio22.com
    DocumentRoot /var/www/studio22/dist

    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key

    <Directory /var/www/studio22/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]

        # Static asset caching
        <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
            ExpiresActive On
            ExpiresDefault "access plus 1 year"
            Header set Cache-Control "public, immutable"
        </FilesMatch>
    </Directory>

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</VirtualHost>
```

## SSL Certificate Setup

### Let's Encrypt (Free)

1. Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate:
```bash
sudo certbot --nginx -d studio22.com -d www.studio22.com
```

3. Auto-renewal is configured automatically

### Commercial SSL

1. Purchase SSL certificate from provider
2. Upload certificate files to server
3. Configure web server with certificate paths
4. Test SSL configuration:
```bash
openssl s_client -connect studio22.com:443
```

## CDN Configuration

### Cloudflare Setup

1. Sign up for Cloudflare account
2. Add your domain to Cloudflare
3. Update nameservers as instructed
4. Configure page rules:
   - Cache static assets (JS, CSS, images)
   - Enable auto-minify
   - Enable Brotli compression
5. Configure DNS records

### AWS CloudFront Setup

1. Create S3 bucket for static assets
2. Upload `dist/` contents to S3
3. Create CloudFront distribution
4. Configure origin as S3 bucket
5. Set up custom domain
6. Configure cache behaviors

## Database Configuration

### Base44 Production Setup

1. Create production Base44 project
2. Configure database schema
3. Run migrations:
```bash
# Apply SQL migrations from database/migrations/
```

4. Verify database connections in production environment

### Backup Strategy

- Enable automatic backups in Base44
- Configure backup retention (30 days recommended)
- Test restore process regularly

## Monitoring & Logging

### Application Monitoring

1. **Sentry** for error tracking:
   - Create Sentry project
   - Add Sentry SDK to application
   - Configure error reporting

2. **Google Analytics** for user analytics:
   - Add tracking ID to environment variables
   - Configure analytics in application

3. **Uptime Monitoring**:
   - Use UptimeRobot or Pingdom
   - Monitor main endpoint every 5 minutes
   - Configure alert notifications

### Log Management

1. Configure application logging
2. Set up log aggregation (e.g., Loggly, Papertrail)
3. Configure log retention (90 days recommended)
4. Set up alerts for critical errors

## Performance Optimization

### Build Optimization

The production build includes:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Runtime Optimization

- Enable gzip compression on web server
- Configure CDN for static assets
- Implement service worker caching
- Enable HTTP/2
- Use modern image formats (WebP)

### Performance Monitoring

- Monitor Core Web Vitals
- Track page load times
- Monitor API response times
- Set up performance budgets

## Security Hardening

### Web Server Security

- Enable HTTPS only
- Configure security headers
- Disable directory listing
- Limit request size
- Enable rate limiting

### Application Security

- Enable CORS restrictions
- Configure CSP headers
- Implement rate limiting
- Enable 2FA for admin accounts
- Regular security audits

### API Security

- Validate all inputs
- Sanitize outputs
- Use parameterized queries
- Implement rate limiting
- Monitor API usage

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] CDN configured (if using)
- [ ] Database migrations applied
- [ ] Backup strategy configured
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Security headers configured
- [ ] Performance optimization enabled
- [ ] Analytics tracking enabled
- [ ] 2FA enabled for admin accounts
- [ ] Rate limiting configured
- [ ] Log aggregation configured
- [ ] Uptime monitoring configured
- [ ] Smoke tests passed
- [ ] User acceptance testing completed

## Rollback Procedure

### If Deployment Fails

1. Revert to previous build:
```bash
# If using Git
git checkout previous-commit
npm run build
```

2. Restore database from backup if needed

3. Clear CDN cache if using

4. Verify application functionality

### Emergency Rollback

1. Switch to maintenance mode
2. Restore previous working version
3. Verify critical functionality
4. Disable maintenance mode

## Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version compatibility
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for missing environment variables

**Deployment Fails:**
- Verify environment variables in deployment platform
- Check build logs for errors
- Ensure all dependencies are installed

**Runtime Errors:**
- Check browser console for errors
- Verify API endpoints are accessible
- Check network requests in browser dev tools
- Review server logs

**Performance Issues:**
- Check bundle size
- Verify CDN is working
- Check server response times
- Review Core Web Vitals

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs, check uptime
- **Monthly**: Review security updates, update dependencies
- **Quarterly**: Security audit, performance review
- **Annually**: SSL certificate renewal, backup verification

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after updates
npm run test
npm run build
```

## Support

For deployment issues:
- Check documentation: `/docs`
- Review error logs
- Contact support: support@studio22.com

---

**Document Version**: 1.0  
**Last Updated**: July 13, 2026
