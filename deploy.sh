#!/bin/bash

# AI Video Interview Bot - Deployment Script
# Make this file executable with: chmod +x deploy.sh

echo "🚀 AI Video Interview Bot Deployment Script"
echo "==========================================="

# Function to display usage
usage() {
    echo "Usage: ./deploy.sh [platform]"
    echo "Platforms: vercel, netlify, render, railway"
    echo "Example: ./deploy.sh vercel"
    exit 1
}

# Check if platform is specified
if [ $# -eq 0 ]; then
    usage
fi

PLATFORM=$1

echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

case $PLATFORM in
    "vercel")
        echo "🔵 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
            exit 1
        fi
        ;;
    
    "netlify")
        echo "🟢 Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=dist/public
        else
            echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
            exit 1
        fi
        ;;
    
    "render")
        echo "🟡 For Render deployment:"
        echo "1. Push your code to GitHub"
        echo "2. Connect your repo to Render"
        echo "3. Use the render.yaml configuration"
        echo "4. Render will auto-deploy on git push"
        ;;
    
    "railway")
        echo "🟣 Deploying to Railway..."
        if command -v railway &> /dev/null; then
            railway up
        else
            echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
            exit 1
        fi
        ;;
    
    *)
        echo "❌ Unknown platform: $PLATFORM"
        usage
        ;;
esac

echo "🎉 Deployment process completed!"
echo "📖 Check DEPLOYMENT.md for detailed instructions"