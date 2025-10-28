# How to Upload MC One to GitHub

## Option 1: Manual Setup (Recommended)

### Step 1: Install Xcode Command Line Tools
Open Terminal and run:
```bash
xcode-select --install
```
Accept the license agreement and wait for installation to complete.

### Step 2: Run the Setup Script
After tools are installed, run:
```bash
cd /Users/matthewtallent/Desktop/Mc-One
./setup-github.sh
```

### Step 3: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `mc-one` (or your choice)
3. Description: `Banking app with React frontend, Node.js backend, Postgres, and crypto trading`
4. Select **Private** or **Public**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Step 4: Push Your Code
Run these commands (replace YOUR_USERNAME with your GitHub username):
```bash
git remote add origin https://github.com/YOUR_USERNAME/mc-one.git
git branch -M main
git push -u origin main
```

Enter your GitHub username and password when prompted.

---

## Option 2: Use GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in
3. File → Add Local Repository
4. Browse to: `/Users/matthewtallent/Desktop/Mc-One`
5. Click "Add Repository"
6. Click "Publish repository" in GitHub Desktop
7. Choose name: `mc-one`
8. Click "Publish Repository"

---

## What's Included
- ✅ Complete banking app with frontend and backend
- ✅ Docker Compose configuration
- ✅ Postgres database integration
- ✅ Real-time crypto price feeds (Binance/Coinbase)
- ✅ All necessary configurations
- ✅ .gitignore (excludes node_modules, build files, etc.)

## What's Excluded (via .gitignore)
- `node_modules/` folders
- Build outputs (`dist/`, `build/`)
- Environment files (`.env`)
- IDE settings
- Docker volumes

