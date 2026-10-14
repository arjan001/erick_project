# VPS Deployment Instructions

## Quick Deployment

### 1. Connect to VPS
Open your terminal or SSH client and run:

```bash
ssh root@162.0.231.193
```

**Password:** `LPsrt8J5nEyl4EZ793`

### 2. Navigate to Project Directory
```bash
cd /var/www/smartgigs
```

### 3. Pull Latest Changes
```bash
git pull
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Build the Project
```bash
npm run build
```

### 6. Restart the Application
```bash
pm2 restart smartgigs
```

### 7. Check Status
```bash
pm2 status
```

### 8. View Logs (if needed)
```bash
pm2 logs smartgigs
```

---

## Apply Database Migrations

After deploying to VPS, apply the following migrations in your Supabase SQL Editor:

1. **add_missing_artist_columns.sql**
   - Adds missing columns to artists table
   - Location: `database/migrations/add_missing_artist_columns.sql`

2. **fix_connections_schema.sql**
   - Fixes connections table schema
   - Location: `database/migrations/fix_connections_schema.sql`

3. **fix_messages_schema.sql**
   - Fixes messages table schema
   - Location: `database/migrations/fix_messages_schema.sql`

4. **fix_client_profiles_rls.sql**
   - Fixes RLS policies for client-profiles bucket
   - Location: `database/migrations/fix_client_profiles_rls.sql`

---

## Verify Deployment

1. **Check the site:** https://smartgigs.oneplusafrica.com
2. **Test login:** Sign in with test credentials
3. **Test modules:** Navigate through Artist, Client, Network, Messages
4. **Check console:** Open browser DevTools and check for errors

---

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

### PM2 Issues
```bash
# Restart PM2
pm2 restart smartgigs

# If not working, stop and start
pm2 stop smartgigs
pm2 start npm --name "smartgigs" -- start
pm2 save
```

### Nginx Issues
```bash
# Restart Nginx
systemctl restart nginx

# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Environment Variables

Ensure `.env` file on VPS has correct values:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAKAMESCO_PUBLIC_KEY=your_makamesco_key
VITE_MAKAMESCO_SECRET_KEY=your_makamesco_secret
VITE_RESEND_API_KEY=your_resend_key
```

---

## SSL Certificate

SSL is already configured with Let's Encrypt. If you need to renew:

```bash
certbot renew
systemctl reload nginx
```

---

## Deployment Check List

- [ ] SSH into VPS
- [ ] Navigate to /var/www/smartgigs
- [ ] Run `git pull`
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `pm2 restart smartgigs`
- [ ] Check `pm2 status`
- [ ] Apply database migrations in Supabase
- [ ] Test site at https://smartgigs.oneplusafrica.com
- [ ] Test authentication
- [ ] Test Artist module
- [ ] Test Client module
- [ ] Test Network module
- [ ] Test Messaging module
- [ ] Check browser console for errors

---

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs smartgigs`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check browser console for JavaScript errors
4. Verify Supabase connection
5. Verify environment variables

---

*Last Updated: October 14, 2026*
