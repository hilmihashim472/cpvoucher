# EC2 Setup Guide for cpvoucher Deployment

This guide will walk you through setting up a new EC2 instance and deploying your full-stack application using PuTTY. Yes

---

## Prerequisites

- AWS Account with billing enabled
- PuTTY installed on your Windows machine
- PuTTYgen installed (usually comes with PuTTY)
- Your GitHub repository: https://github.com/hilmihashim472/cpvoucher.git

---

## Step 1: Launch EC2 Instance

### 1.1 Choose AMI
1. Go to AWS Console → EC2 → Launch Instance
2. **Name**: `cpvoucher-server`
3. **AMI**: Select "Ubuntu Server 22.04 LTS" (Free tier eligible)
4. **Instance Type**: `t2.micro` (Free tier) or `t2.small` (better performance)

### 1.2 Create Key Pair
1. Click "Create new key pair"
2. **Key pair name**: `cpvoucher-key`
3. **Key pair type**: RSA
4. **Private key file format**: `.ppk` (for PuTTY)
5. Click "Create key pair" - this will download `cpvoucher-key.ppk`
6. **IMPORTANT**: Save this file securely! You'll need it for PuTTY

### 1.3 Configure Security Group
Create a new security group with these inbound rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | SSL traffic (optional) |

**Note**: For SSH, use "My IP" instead of 0.0.0.0/0 for better security.

### 1.4 Launch Instance
1. Click "Launch instance"
2. Wait 2-3 minutes for the instance to initialize
3. Note down the **Public IPv4 address** (e.g., `54.123.45.67`)

---

## Step 2: Configure PuTTY

### 2.1 Convert SSH Key (if needed)
If your key is `.pem` format instead of `.ppk`:

1. Open PuTTYgen
2. Click "Load" and select your `.pem` file
3. Click "Save private key" → save as `cpvoucher-key.ppk`

### 2.2 Connect with PuTTY
1. Open PuTTY
2. **Session**:
   - Host Name: `ubuntu@YOUR_EC2_IP` (e.g., `ubuntu@54.123.45.67`)
   - Port: `22`
   - Connection type: `SSH Client`

3. **Connection → SSH → Auth**:
   - Click "Browse" and select `cpvoucher-key.ppk`

4. **Connection → Data**:
   - Auto-login username: `ubuntu`

5. **Session** (back to top):
   - Saved Sessions: `cpvoucher-server`
   - Click "Save" to save this session

6. Click "Open" to connect
7. Accept the security alert (click "Yes")

---

## Step 3: Initial Server Setup

Once connected via PuTTY, run these commands:

### 3.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx
```

### 3.2 Install Node.js
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 22
nvm install 22
nvm use 22

# Verify installation
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

### 3.3 Install PM2
```bash
sudo npm install -g pm2
pm2 --version  # Verify installation
```

### 3.4 Configure Firewall
```bash
# Allow Nginx through firewall
sudo ufw allow 'Nginx Full'

# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Step 4: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### Required Secrets:
```
EC2_HOST = 54.123.45.67  (your EC2 public IP)
EC2_SSH_KEY = (content of cpvoucher-key.ppk file)
GH_TOKEN = (GitHub Personal Access Token)
MONGO_URI = mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majoritydz6borv.mongodb.net/?appName=CarterClone
JWT_SECRET = (generate a secure random string)
EMAIL_USER=<your_gmail_address@gmail.com>
EMAIL_PASS=<your_16_char_app_password>
GEMINI_API_KEY=<your_gemini_api_key>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
```

### How to get each secret:

**EC2_SSH_KEY**:
1. Open `cpvoucher-key.ppk` in Notepad
2. Copy the entire content (all lines)
3. Paste into the secret value

**GH_TOKEN**:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token

**JWT_SECRET**:
Generate a secure random string:
```bash
# On your Windows machine, open PowerShell and run:
[System.Web.Security.Membership]::GeneratePassword(32, 16)
```
Or use an online generator like: https://www.random.org/strings/

---

## Step 5: Test Deployment

### 5.1 Manual Test (Optional)
To test the deployment script manually before using GitHub Actions:

```bash
# On your EC2 instance via PuTTY:
cd ~
git clone https://github.com/hilmihashim472/cpvoucher.git
cd cpvoucher
git checkout master

# Run the deployment steps manually (see deploy.yml for reference)
```

### 5.2 Automated Deployment
1. Go to your GitHub repository
2. Make a small change (e.g., update README.md)
3. Commit and push to `master` branch
4. Go to "Actions" tab in GitHub
5. You should see the "Full-Stack CD" workflow running
6. Wait 5-10 minutes for deployment to complete

---

## Step 6: Verify Deployment

### 6.1 Check Backend
```bash
# Via PuTTY on EC2:
pm2 status
pm2 logs cpvoucher-backend
```

You should see:
- Status: `online`
- No errors in logs
- Server listening on port 5000

### 6.2 Check Frontend
```bash
# Via PuTTY on EC2:
sudo systemctl status nginx
curl http://localhost
```

### 6.3 Test in Browser
1. Open browser and go to: `http://YOUR_EC2_IP`
2. You should see your application
3. Test login/registration functionality
4. Check if API calls work (open browser DevTools → Network tab)

---

## Step 7: Configure Custom Domain (Optional)

### 7.1 Point Domain to EC2
1. Go to your domain registrar (e.g., Namecheap, GoDaddy)
2. Add an A record:
   - Host: `@` (or subdomain like `app`)
   - Value: `YOUR_EC2_IP`
   - TTL: 3600

### 7.2 Update deploy.yml
Change the nginx configuration to use your domain:

```yaml
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Add your domain
    # ... rest of config
}
```

### 7.3 Add SSL with Let's Encrypt (Optional)
```bash
# Via PuTTY on EC2:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Common Issues & Troubleshooting

### Issue 1: "Permission denied (publickey)"
**Solution**: 
- Verify you're using the correct `.ppk` file
- Check that the EC2 security group allows SSH from your IP
- Ensure you're connecting as `ubuntu` user

### Issue 2: Backend not starting
**Solution**:
```bash
# Check logs
pm2 logs cpvoucher-backend

# Common fixes:
# 1. Check MongoDB connection
# 2. Verify all environment variables are set
# 3. Check if port 5000 is already in use: sudo lsof -i :5000
```

### Issue 3: Frontend shows blank page
**Solution**:
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify files are in place
ls -la /var/www/html/

# Check nginx configuration
sudo nginx -t
```

### Issue 4: API calls failing (CORS errors)
**Solution**:
- Verify `FRONTEND_URL` in backend `.env` matches your domain
- Check nginx proxy configuration
- Ensure backend is running: `pm2 status`

---

## Useful Commands

### PM2 Commands
```bash
pm2 status                    # Check running processes
pm2 logs cpvoucher-backend    # View logs
pm2 restart cpvoucher-backend # Restart backend
pm2 stop cpvoucher-backend    # Stop backend
pm2 delete cpvoucher-backend  # Remove from pm2
```

### Nginx Commands
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart nginx
sudo nginx -t                 # Test configuration
sudo tail -f /var/log/nginx/access.log  # View access logs
sudo tail -f /var/log/nginx/error.log   # View error logs
```

### Git Commands
```bash
cd ~/cpvoucher
git pull origin master        # Update code
git status                    # Check status
git log --oneline -10         # View recent commits
```

---

## Security Recommendations

1. **Change SSH Port** (Optional but recommended):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change: Port 22 → Port 2222
   sudo systemctl restart sshd
   ```

2. **Enable Automatic Updates**:
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Regular Backups**:
   - Set up automated MongoDB backups
   - Backup EC2 instance regularly

4. **Monitor Logs**:
   ```bash
   # Install monitoring
   sudo apt install -y htop
   htop  # Monitor system resources
   ```

---

## Next Steps

1. ✅ Set up EC2 instance
2. ✅ Configure PuTTY and connect
3. ✅ Install required software
4. ✅ Add GitHub secrets
5. ✅ Push to master and test deployment
6. ✅ Configure custom domain (optional)
7. ✅ Set up SSL (optional)
8. ✅ Configure monitoring and backups

---

## Support

If you encounter issues:
1. Check GitHub Actions logs for deployment errors
2. Check PM2 logs: `pm2 logs cpvoucher-backend`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify all secrets are correctly configured in GitHub

Good luck with your deployment! 🚀