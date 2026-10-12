# SmartGigs VPS Deployment Guide

## Issue: SSH Password Authentication Not Working

The VPS server at `162.0.231.193` is rejecting password authentication. This could be because:
- Password authentication is disabled on the server (security best practice)
- SSH key authentication is required
- The password may have changed

## Solution: Set Up SSH Key Authentication

I've generated an SSH key pair for you. To enable passwordless deployment, follow these steps:

### Step 1: Copy the Public Key

Your public key is:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDPKY2MjQFLIRtH8GUqK1hXRhTjVhKvCygDenCsS1V9Qp/bpC70Irz6ebGE+qTbcZuZ1PL6IxBK5PmvkYqIE6BYKzQpLdwVd9cwRrIeDU1BXH4XIleKGdYySC+E7G+5OR5XNqKYvojGOPLLrkPoM82QMzmhbLkCRlF1P2iEGhGKEkbGwJzIPUxkNjq58ctaw0LfvY2hPEuF3SPhBuq30e85oVxHNdBpPu0+z3mB/3KltkboC0LElztTPTJYtZUQsDTxq+N3gh6OGxY1EG3SvzLM3owmlqm+YvFSfSN+SGh4HpLPy/nvYHVV3lmlHJ6bTpXeGxyepu+nAJwqkqtCQtVQkvcGEhp1gDlxmQ0LP2HO1CukSVj2EmrOYipAsZ5nNWurYDWuDSe7ERQaEvpTOIkQnQc0IkPoDbzaOfBpHCCyxcgp/5EAuAxtIuM/CaxdtdfOYUPY4AUI9CUetdwDSvdTJK1xPIhPZANo1vzZUIkbaP9jOkiBhQowpLyjUrGiSu8QmUSxosUm56Wpn8ozPq45rGFcFODhsDvj6UqTYla9jcSxedEhfJIogpuTtYzXZ2ffV0AhX5pbVd1NWBll4Snz+f8EjwNvmgPQiUB1cY6U/cVLPRJMbMTW31D7fZny/zPWbDDAAXi6Z+EIC198G0aWBdcTHAhAUYPMw+0iK9uhmQ== Galaxsay@ARJAN
```

### Step 2: Add Key to Server

**Option A: If you can still SSH with password:**
```bash
ssh root@162.0.231.193
# Enter password when prompted
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDPKY2MjQFLIRtH8GUqK1hXRhTjVhKvCygDenCsS1V9Qp/bpC70Irz6ebGE+qTbcZuZ1PL6IxBK5PmvkYqIE6BYKzQpLdwVd9cwRrIeDU1BXH4XIleKGdYySC+E7G+5OR5XNqKYvojGOPLLrkPoM82QMzmhbLkCRlF1P2iEGhGKEkbGwJzIPUxkNjq58ctaw0LfvY2hPEuF3SPhBuq30e85oVxHNdBpPu0+z3mB/3KltkboC0LElztTPTJYtZUQsDTxq+N3gh6OGxY1EG3SvzLM3owmlqm+YvFSfSN+SGh4HpLPy/nvYHVV3lmlHJ6bTpXeGxyepu+nAJwqkqtCQtVQkvcGEhp1gDlxmQ0LP2HO1CukSVj2EmrOYipAsZ5nNWurYDWuDSe7ERQaEvpTOIkQnQc0IkPoDbzaOfBpHCCyxcgp/5EAuAxtIuM/CaxdtdfOYUPY4AUI9CUetdwDSvdTJK1xPIhPZANo1vzZUIkbaP9jOkiBhQowpLyjUrGiSu8QmUSxosUm56Wpn8ozPq45rGFcFODhsDvj6UqTYla9jcSxedEhfJIogpuTtYzXZ2ffV0AhX5pbVd1NWBll4Snz+f8EjwNvmgPQiUB1cY6U/cVLPRJMbMTW31D7fZny/zPWbDDAAXi6Z+EIC198G0aWBdcTHAhAUYPMw+0iK9uhmQ== Galaxsay@ARJAN" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

**Option B: Via VPS Control Panel (cPanel/Vultr/DigitalOcean/etc):**
1. Log into your VPS control panel
2. Go to SSH Keys section
3. Add the public key above

**Option C: Via VNC/Console in Control Panel:**
1. Access server console via VNC
2. Run the commands from Option A

### Step 3: Test SSH Key Authentication

Once the key is added, test:
```bash
ssh -i ~/.ssh/smartgigs_key root@162.0.231.193
```

Should login without password.

### Step 4: Deploy

After SSH key is working, run:
```bash
.\deploy.ps1
```

Or manually:
```bash
ssh -i ~/.ssh/smartgigs_key root@162.0.231.193 "cd /var/www/smartgigs.oneplusafrica.com && git pull && npm run build && pm2 restart smartgigs"
```

---

## Alternative: Use cPanel File Manager

If you have cPanel access:
1. Log into cPanel
2. Go to File Manager
3. Navigate to `/root/.ssh/`
4. Create or edit `authorized_keys`
5. Paste the public key above
6. Save

---

## Current Status

✅ Code committed and pushed to GitHub
✅ Build passes successfully
✅ Makamesco M-Pesa integration complete
✅ SSH key generated at `~/.ssh/smartgigs_key`
⏳ Waiting for SSH key to be added to server

---

## Deployment Script

The deployment script `deploy.ps1` is ready in the project root. Once SSH key is set up, simply run:
```powershell
.\deploy.ps1
```

This will:
1. Pull latest code from GitHub
2. Build the application
3. Restart PM2 process
