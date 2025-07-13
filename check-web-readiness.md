# How to Check if the Web Application is Ready

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Start Development Server**
```bash
npm run dev
```

### 3. **Check Server Status**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
```
- **200**: Server is ready ✅
- **000**: Server is not ready ❌

## 📊 **Application Readiness Status**

The face detection application has multiple readiness states:

### **Frontend Status (in browser)**
The application shows status in the UI:
- `"Initializing face detection..."` - Loading face detection models
- `"Starting camera..."` - Requesting webcam access
- `"Camera access error"` - Cannot access camera
- `"Face detection error"` - Error in face detection system
- `"Camera not active"` - Camera not started
- `"Analyzing facial features..."` - Currently analyzing
- `"Ready for analysis"` - ✅ Fully ready

### **Backend Status Checks**

#### **1. Basic Health Check**
```bash
# Check if server responds
curl -s http://localhost:5000
```

#### **2. Status Code Check**
```bash
# Get HTTP status code
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
```

#### **3. API Endpoint Check**
```bash
# Check if API routes are working (if any are defined)
curl -s http://localhost:5000/api/health
```

## 🔧 **Automated Readiness Script**

Create a script to check all readiness states:

```bash
#!/bin/bash
# check-readiness.sh

echo "🔍 Checking Web Application Readiness..."

# 1. Check if server is running
echo "📡 Checking server status..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Server is running (HTTP $HTTP_CODE)"
else
    echo "❌ Server is not ready (HTTP $HTTP_CODE)"
    exit 1
fi

# 2. Check if HTML is being served
echo "📄 Checking HTML content..."
HTML_RESPONSE=$(curl -s http://localhost:5000)
if [[ "$HTML_RESPONSE" == *"<!DOCTYPE html>"* ]]; then
    echo "✅ HTML content is being served"
else
    echo "❌ HTML content not found"
    exit 1
fi

# 3. Check if Vite is running
echo "⚡ Checking Vite development server..."
if [[ "$HTML_RESPONSE" == *"@vite/client"* ]]; then
    echo "✅ Vite development server is active"
else
    echo "❌ Vite development server not detected"
fi

# 4. Check if React is loading
echo "⚛️ Checking React application..."
if [[ "$HTML_RESPONSE" == *"react"* ]] || [[ "$HTML_RESPONSE" == *"root"* ]]; then
    echo "✅ React application detected"
else
    echo "❌ React application not detected"
fi

echo ""
echo "🎉 Web application is ready!"
echo "🌐 Access at: http://localhost:5000"
```

## 🏗️ **Production Readiness**

### **Build and Start Production Server**
```bash
# Build the application
npm run build

# Start production server
npm start
```

### **Production Health Check**
```bash
# Check production server (usually different port)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

## 🔄 **Continuous Monitoring**

### **Watch for Changes**
```bash
# Monitor server status every 5 seconds
watch -n 5 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000'
```

### **Log Monitoring**
```bash
# Watch server logs
npm run dev 2>&1 | grep -E "(error|ready|listening)"
```

## 🐛 **Troubleshooting**

### **Common Issues and Solutions**

1. **Dependencies not installed**
   ```bash
   npm install
   ```

2. **Port already in use**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

3. **Cross-env not found**
   ```bash
   npm install cross-env
   ```

4. **Face detection not working**
   - Check webcam permissions
   - Ensure HTTPS or localhost
   - Check browser compatibility

## 📱 **Frontend Component Readiness**

The application checks multiple component states:

### **Webcam Hook Status**
- `isLoading`: Camera is initializing
- `isActive`: Camera is active and streaming
- `error`: Camera access error

### **Face Detection Hook Status**
- `isInitialized`: Face detection models loaded
- `isAnalyzing`: Currently analyzing faces
- `error`: Face detection error

### **System Status Display**
```javascript
const getStatus = () => {
  if (faceDetectionError) return "Face detection error";
  if (webcamError) return "Camera access error";
  if (!isInitialized) return "Initializing face detection...";
  if (webcamLoading) return "Starting camera...";
  if (!webcamActive) return "Camera not active";
  if (isAnalyzing) return "Analyzing facial features...";
  return "Ready for analysis";
};
```

## 🎯 **Quick Readiness Commands**

```bash
# One-liner to check if web is ready
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200" && echo "✅ Ready" || echo "❌ Not Ready"

# Check with timeout
timeout 5 curl -s http://localhost:5000 > /dev/null && echo "✅ Ready" || echo "❌ Not Ready"

# Full system check
npm run dev > /dev/null 2>&1 & sleep 10 && curl -s http://localhost:5000 > /dev/null && echo "✅ System Ready" || echo "❌ System Not Ready"
```

## 🔍 **Advanced Monitoring**

### **JavaScript Readiness Check**
```javascript
// Check if application is ready via browser console
const checkReadiness = () => {
  const video = document.querySelector('video');
  const canvas = document.querySelector('canvas');
  
  return {
    domReady: document.readyState === 'complete',
    videoElement: !!video,
    canvasElement: !!canvas,
    videoActive: video?.videoWidth > 0,
    timestamp: new Date().toISOString()
  };
};

console.log(checkReadiness());
```

This comprehensive guide covers all aspects of checking if your face detection web application is ready for use!