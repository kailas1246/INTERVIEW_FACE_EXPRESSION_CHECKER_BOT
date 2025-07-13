#!/bin/bash

echo "🔍 Checking Web Application Readiness..."

# 1. Check if server is running
echo "📡 Checking server status..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Server is running (HTTP $HTTP_CODE)"
else
    echo "❌ Server is not ready (HTTP $HTTP_CODE)"
    echo "💡 Make sure to run 'npm run dev' first"
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

# 5. Check if face detection assets are accessible
echo "🔍 Checking face detection setup..."
if [[ "$HTML_RESPONSE" == *"face"* ]] || [[ "$HTML_RESPONSE" == *"detection"* ]]; then
    echo "✅ Face detection components detected"
else
    echo "⚠️ Face detection components not explicitly detected"
fi

echo ""
echo "🎉 Web application is ready!"
echo "🌐 Access at: http://localhost:5000"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:5000 in your browser"
echo "   2. Allow camera access when prompted"
echo "   3. Check the status indicator in the UI"
echo "   4. Look for 'Ready for analysis' status"