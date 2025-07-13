# Deployment Guide - AI Video Interview Bot

This guide covers deploying your AI Video Interview Bot to popular hosting platforms like Vercel, Netlify, and Render.

## Overview

The application consists of:
- **Frontend**: React/TypeScript application built with Vite
- **Backend**: Express.js server
- **Database**: PostgreSQL (optional, currently using in-memory storage)

## Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)

Vercel supports both frontend and serverless backend deployment.

#### Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com

#### Steps
1. **Prepare the project:**
   ```bash
   # Build the application
   npm run build
   ```

2. **Deploy:**
   ```bash
   # Login to Vercel
   vercel login

   # Deploy
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No
   - What's your project's name? ai-interview-bot
   - In which directory is your code located? ./

4. **Configure environment variables** in Vercel dashboard:
   - Go to your project settings
   - Add environment variables if needed (DATABASE_URL, etc.)

#### Vercel Configuration
The project includes `vercel.json` for proper configuration.

---

### Option 2: Netlify (Frontend Only)

Netlify is excellent for static site deployment but requires serverless functions for backend.

#### Prerequisites
1. Create a Netlify account at https://netlify.com
2. Install Netlify CLI: `npm install -g netlify-cli`

#### Steps
1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   ```bash
   # Login to Netlify
   netlify login

   # Deploy
   netlify deploy --prod --dir=dist/public
   ```

#### Note for Netlify
Since Netlify is primarily for static sites, you'll need to:
- Convert backend routes to Netlify Functions
- Or use a separate backend service
- The current setup works best with full-stack platforms

---

### Option 3: Render (Full-Stack Support)

Render supports both static sites and backend services.

#### Prerequisites
1. Create a Render account at https://render.com
2. Connect your GitHub repository

#### Steps
1. **Create a Web Service:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**
   ```
   Name: ai-interview-bot
   Region: Choose closest to your users
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set environment variables:**
   - `NODE_ENV=production`
   - Add any other required variables

4. **Deploy:**
   - Render will automatically build and deploy

---

### Option 4: Railway

Railway provides easy full-stack deployment.

#### Steps
1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

---

## Configuration Files

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "dist/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Environment Variables

Set these in your hosting platform:

### Required
- `NODE_ENV=production`

### Optional
- `DATABASE_URL` (if using PostgreSQL)
- `PORT` (usually set automatically)

---

## Build Scripts

Make sure your `package.json` has these scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
```

---

## Domain and HTTPS

### Custom Domain
1. **Vercel**: Add domain in project settings
2. **Netlify**: Add domain in site settings
3. **Render**: Add custom domain in service settings

### HTTPS
All platforms provide automatic HTTPS certificates.

---

## Performance Optimization

### Frontend Optimization
- Static assets are optimized by Vite
- Images and videos are compressed
- Code splitting is enabled

### Backend Optimization
- Express.js with production settings
- Gzip compression enabled
- Static file serving optimized

---

## Monitoring and Analytics

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage analytics

### Performance Monitoring
- Use built-in platform analytics
- Monitor Core Web Vitals
- Track API response times

---

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Camera/Microphone Issues:**
- Ensure HTTPS is enabled (required for WebRTC)
- Check browser permissions
- Test on different browsers

**Database Connection:**
- Verify DATABASE_URL environment variable
- Check network access between services
- Use connection pooling for production

### Debug Mode
Enable debug logs by setting:
```
DEBUG=express:*
NODE_ENV=development
```

---

## Security Considerations

### Production Settings
- Never expose sensitive keys in client code
- Use environment variables for secrets
- Enable CORS only for your domain
- Implement rate limiting for API endpoints

### Camera/Microphone Access
- Requires HTTPS in production
- Implement proper permission handling
- Add user consent flows

---

## Scaling Considerations

### Traffic Growth
- Use CDN for static assets
- Implement caching strategies
- Consider database read replicas
- Monitor resource usage

### Features
- Add user authentication if needed
- Implement data persistence
- Add real-time features with WebSockets
- Consider microservices architecture

---

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs
3. Test locally first
4. Check environment variables
5. Verify all dependencies are installed

Each platform has excellent documentation and support communities for troubleshooting specific deployment issues.