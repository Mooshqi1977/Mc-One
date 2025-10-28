#!/bin/bash
# MC One - GitHub Setup Script

echo "Setting up GitHub repository for MC One..."

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: MC One Bank - Banking app with React frontend, Node.js backend, Postgres, and crypto trading"

echo ""
echo "✅ Repository initialized!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository named 'mc-one' (or any name you prefer)"
echo "3. Then run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/mc-one.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Or if you want to use SSH:"
echo "   git remote add origin git@github.com:YOUR_USERNAME/mc-one.git"
echo "   git branch -M main"
echo "   git push -u origin main"

