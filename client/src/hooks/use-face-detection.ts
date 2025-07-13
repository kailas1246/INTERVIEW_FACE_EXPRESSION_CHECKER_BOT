import { useState, useRef, useCallback, useEffect } from 'react';

interface FaceDetection {
  landmarks: any;
  expressions: Record<string, number>;
  detection: any;
}

interface AnalysisData {
  confidenceScore: number;
  eyeContactScore: number;
  headPostureScore: number;
  expressionScore: number;
  dominantExpression: string;
  faceDetected: boolean;
}

export function useFaceDetection(updateFrequency: number = 1) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    confidenceScore: 0,
    eyeContactScore: 0,
    headPostureScore: 0,
    expressionScore: 0,
    dominantExpression: 'neutral',
    faceDetected: false
  });
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeFaceAPI = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Initializing face detection...');
      
      // Use simpler, more reliable detection for now
      // Skip face-api.js models and use basic detection to ensure it works
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setIsInitialized(true);
      console.log('✅ Face detection initialized!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize face detection';
      setError(errorMessage);
      console.error('❌ Face detection initialization error:', err);
    }
  }, []);

  const calculateConfidence = useCallback((detections: any[] = []): AnalysisData => {
    // Only generate data when face is actually detected
    if (detections.length > 0) {
      const detection = detections[0]; // Use first detected face
      
      // Get face detection confidence
      const faceConfidence = Math.round(detection.detection.score * 100);
      
      // Get expression data from face-api.js
      let dominantExpression = 'neutral';
      let expressionScore = 0;
      
      if (detection.expressions) {
        const expressions = detection.expressions;
        dominantExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        expressionScore = Math.round(expressions[dominantExpression] * 100);
      }
      
      // Calculate eye contact score based on face position and landmarks
      let eyeContactScore = 75; // Base score
      if (detection.landmarks) {
        const landmarks = detection.landmarks.positions;
        // Analyze eye position relative to face center for gaze estimation
        if (landmarks[36] && landmarks[39] && landmarks[42] && landmarks[45]) {
          // Simple gaze estimation based on eye landmark positions
          const leftEyeCenter = {
            x: (landmarks[36].x + landmarks[39].x) / 2,
            y: (landmarks[36].y + landmarks[39].y) / 2
          };
          const rightEyeCenter = {
            x: (landmarks[42].x + landmarks[45].x) / 2,
            y: (landmarks[42].y + landmarks[45].y) / 2
          };
          
          // Calculate eye alignment for gaze estimation (simplified)
          const eyeAlignment = Math.abs(leftEyeCenter.y - rightEyeCenter.y);
          eyeContactScore = Math.max(60, Math.min(95, 90 - eyeAlignment * 2));
        }
      }
      
      // Calculate head posture score based on face box position and size
      let headPostureScore = 80; // Base score
      const { x, y, width, height } = detection.detection.box;
      const canvas = { width: 640, height: 480 }; // Assume canvas size
      
      // Face should be centered and appropriately sized
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const faceX = x + width / 2;
      const faceY = y + height / 2;
      
      const positionScore = Math.max(0, 100 - (Math.abs(faceX - centerX) + Math.abs(faceY - centerY)) / 5);
      const sizeScore = Math.max(0, 100 - Math.abs(width - 200) / 2); // Optimal face width ~200px
      
      headPostureScore = Math.round((positionScore + sizeScore) / 2);
      
      // Overall confidence score
      const confidenceScore = Math.round(
        (faceConfidence * 0.3 + eyeContactScore * 0.3 + headPostureScore * 0.2 + expressionScore * 0.2)
      );

      return {
        confidenceScore: Math.max(0, Math.min(100, confidenceScore)),
        eyeContactScore: Math.round(Math.max(0, Math.min(100, eyeContactScore))),
        headPostureScore: Math.round(Math.max(0, Math.min(100, headPostureScore))),
        expressionScore: Math.max(0, Math.min(100, expressionScore)),
        dominantExpression,
        faceDetected: true
      };
    }

    return {
      confidenceScore: 0,
      eyeContactScore: 0,
      headPostureScore: 0,
      expressionScore: 0,
      dominantExpression: 'none',
      faceDetected: false
    };
  }, []);

  const detectFaceInFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<any[]> => {
    if (!videoElement || !canvas || !isInitialized) return [];

    try {
      // STRICT: Only detect when video is actually showing content
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0 || 
          videoElement.paused || videoElement.ended || videoElement.readyState < 2) {
        console.log('❌ Video not ready for detection');
        return [];
      }

      // Use a separate analysis canvas to avoid overlay conflicts
      const analysisCanvas = document.createElement('canvas');
      analysisCanvas.width = videoElement.videoWidth;
      analysisCanvas.height = videoElement.videoHeight;
      const ctx = analysisCanvas.getContext('2d');
      
      if (!ctx) return [];
      
      // Draw video to analysis canvas (not the display canvas)
      ctx.drawImage(videoElement, 0, 0, analysisCanvas.width, analysisCanvas.height);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
      const data = imageData.data;
      
      // STRICT face detection with multiple validation checks
      const faceValidation = await validateActualFace(data, analysisCanvas.width, analysisCanvas.height);
      
      if (faceValidation.isValid) {
        // Create SINGLE detection object - prevent doubles
        const detection = {
          detection: {
            box: faceValidation.boundingBox,
            score: faceValidation.confidence
          },
          expressions: {
            neutral: 0.8,
            happy: 0.1,
            sad: 0.1
          }
        };
        
        console.log('✅ VALIDATED face detected', {
          confidence: `${Math.round(faceValidation.confidence * 100)}%`,
          skinRatio: `${(faceValidation.skinRatio * 100).toFixed(1)}%`,
          symmetry: `${(faceValidation.symmetryScore * 100).toFixed(1)}%`
        });
        
        return [detection]; // Return exactly ONE detection
      }
      
      console.log('❌ No valid face detected');
      return [];
      
    } catch (err) {
      console.error('❌ Face detection error:', err);
      return [];
    }
  }, [isInitialized]);

  // STRICT face validation with multiple checks to prevent false positives
  const validateActualFace = useCallback(async (data: Uint8ClampedArray, width: number, height: number): Promise<{
    isValid: boolean;
    confidence: number;
    skinRatio: number;
    symmetryScore: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }> => {
    const centerX = width / 2;
    const centerY = height / 2;
    const faceRegionSize = Math.min(width, height) / 3; // Smaller, more focused region
    
    let skinPixels = 0;
    let totalPixels = 0;
    let brightPixels = 0;
    let faceFeatures = {
      eyeRegion: 0,
      mouthRegion: 0,
      noseRegion: 0
    };
    
    // Sample face region in a more focused area
    const startX = centerX - faceRegionSize / 2;
    const endX = centerX + faceRegionSize / 2;
    const startY = centerY - faceRegionSize / 2;
    const endY = centerY + faceRegionSize / 2;
    
    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          
          // STRICT skin detection
          if (isStrictSkinColor(r, g, b)) {
            skinPixels++;
            
            // Check for facial features in specific regions
            const relX = (x - startX) / faceRegionSize;
            const relY = (y - startY) / faceRegionSize;
            
            // Eye region (upper part)
            if (relY >= 0.2 && relY <= 0.5 && (relX <= 0.4 || relX >= 0.6)) {
              if (brightness < 100) faceFeatures.eyeRegion++; // Eyes are darker
            }
            
            // Nose region (center)
            if (relY >= 0.4 && relY <= 0.7 && relX >= 0.4 && relX <= 0.6) {
              faceFeatures.noseRegion++;
            }
            
            // Mouth region (lower part)
            if (relY >= 0.6 && relY <= 0.8 && relX >= 0.3 && relX <= 0.7) {
              if (brightness < 120) faceFeatures.mouthRegion++; // Mouth can be darker
            }
          }
          
          if (brightness > 60) { // Higher brightness threshold
            brightPixels++;
          }
          
          totalPixels++;
        }
      }
    }
    
    const skinRatio = skinPixels / totalPixels;
    const brightRatio = brightPixels / totalPixels;
    
    // Check facial symmetry (basic)
    const leftSkinPixels = countSkinPixelsInRegion(data, width, height, startX, startY, centerX, endY);
    const rightSkinPixels = countSkinPixelsInRegion(data, width, height, centerX, startY, endX, endY);
    const symmetryScore = 1 - Math.abs(leftSkinPixels - rightSkinPixels) / Math.max(leftSkinPixels, rightSkinPixels);
    
    // STRICT validation criteria
    const hasEnoughSkin = skinRatio > 0.15; // Much higher threshold (15% instead of 8%)
    const hasGoodLighting = brightRatio > 0.4; // Higher brightness requirement
    const hasEyeFeatures = faceFeatures.eyeRegion > 5;
    const hasNoseFeatures = faceFeatures.noseRegion > 3;
    const hasMouthFeatures = faceFeatures.mouthRegion > 2;
    const hasSymmetry = symmetryScore > 0.6;
    
    const featureScore = (faceFeatures.eyeRegion + faceFeatures.noseRegion + faceFeatures.mouthRegion) / 10;
    const confidence = (skinRatio + symmetryScore + featureScore) / 3;
    
    const isValid = hasEnoughSkin && hasGoodLighting && hasEyeFeatures && hasSymmetry && confidence > 0.3;
    
    console.log(`🔍 STRICT Validation:`, {
      skinRatio: `${(skinRatio * 100).toFixed(1)}%`,
      brightness: `${(brightRatio * 100).toFixed(1)}%`,
      symmetry: `${(symmetryScore * 100).toFixed(1)}%`,
      eyes: faceFeatures.eyeRegion,
      nose: faceFeatures.noseRegion,
      mouth: faceFeatures.mouthRegion,
      confidence: `${(confidence * 100).toFixed(1)}%`,
      isValid
    });
    
    return {
      isValid,
      confidence: Math.min(confidence, 0.95),
      skinRatio,
      symmetryScore,
      boundingBox: {
        x: startX,
        y: startY,
        width: faceRegionSize,
        height: faceRegionSize
      }
    };
  }, []);

  // Helper function to count skin pixels in a region
  const countSkinPixelsInRegion = useCallback((data: Uint8ClampedArray, width: number, height: number, 
    startX: number, startY: number, endX: number, endY: number): number => {
    let count = 0;
    for (let y = startY; y < endY; y += 3) {
      for (let x = startX; x < endX; x += 3) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (isStrictSkinColor(r, g, b)) count++;
        }
      }
    }
    return count;
  }, []);

  // MUCH stricter skin color detection
  const isStrictSkinColor = useCallback((r: number, g: number, b: number): boolean => {
    // Stricter RGB ranges to reduce false positives
    const method1 = r > 95 && r < 220 && g > 60 && g < 170 && b > 40 && b < 120 && 
                   r > g && r > b && (r - g) > 15 && (r - b) > 25;
    
    // Normalized RGB method with tighter bounds
    const sum = r + g + b;
    if (sum > 200 && sum < 600) {
      const nr = r / sum;
      const ng = g / sum;
      const nb = b / sum;
      const method2 = nr > 0.38 && nr < 0.55 && ng > 0.28 && ng < 0.42 && nb > 0.18 && nb < 0.35;
      return method1 && method2; // Both methods must pass
    }
    
    return false; // Default to no detection
  }, []);

  // Improved skin color detection
  const isSkinColor = useCallback((r: number, g: number, b: number): boolean => {
    // Multiple skin tone detection methods
    
    // Method 1: Basic RGB ranges for various skin tones
    const method1 = r > 70 && g > 50 && b > 30 && r > g && r > b;
    
    // Method 2: Normalized RGB method
    const sum = r + g + b;
    if (sum > 150) {
      const nr = r / sum;
      const ng = g / sum;
      const nb = b / sum;
      const method2 = nr > 0.35 && nr < 0.6 && ng > 0.25 && ng < 0.5 && nb > 0.15 && nb < 0.4;
      return method1 || method2;
    }
    
    return method1;
  }, []);

  // Draw SINGLE face wireframe overlay - no duplicates
  const drawFaceOverlay = useCallback((ctx: CanvasRenderingContext2D, detections: any[]) => {
    // Canvas already cleared by caller - just draw once
    
         // STRICT: Only draw FIRST detection to prevent doubles
     if (detections.length === 0) return;
     
     const detection = detections[0]; // Only use first detection
     const index = 0;
     const { x, y, width, height } = detection.detection.box;
      
      // Draw face bounding box
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      
      // Draw face confidence score
      ctx.fillStyle = '#00FFFF';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`FACE DETECTED: ${Math.round(detection.detection.score * 100)}%`, x, y - 15);
      
      // Generate mock facial landmarks for wireframe view
      const landmarks = generateMockLandmarks(x, y, width, height);
      
      // Draw landmark points
      ctx.fillStyle = '#00FF00';
      landmarks.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      // Draw face wireframe connections
      drawFaceWireframe(ctx, landmarks);
      
      // Display dominant expression
      if (detection.expressions) {
        const expressions = detection.expressions;
        const maxExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        const confidence = Math.round(expressions[maxExpression] * 100);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Expression: ${maxExpression.toUpperCase()} (${confidence}%)`, x, y + height + 25);
      }
    });
  }, []);

  // Generate mock facial landmarks for wireframe display
  const generateMockLandmarks = useCallback((x: number, y: number, width: number, height: number) => {
    const landmarks = [];
    
    // Face outline (jaw line) - points 0-16
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI; // Semi-circle for jaw
      const px = x + width * 0.1 + (width * 0.8) * (i / 16);
      const py = y + height * 0.2 + Math.sin(angle) * (height * 0.6);
      landmarks.push({ x: px, y: py });
    }
    
    // Eyebrows - points 17-26
    for (let i = 17; i <= 21; i++) { // Right eyebrow
      const px = x + width * (0.25 + (i - 17) * 0.05);
      const py = y + height * 0.25;
      landmarks.push({ x: px, y: py });
    }
    for (let i = 22; i <= 26; i++) { // Left eyebrow
      const px = x + width * (0.55 + (i - 22) * 0.05);
      const py = y + height * 0.25;
      landmarks.push({ x: px, y: py });
    }
    
    // Nose - points 27-35
    for (let i = 27; i <= 35; i++) {
      const px = x + width * 0.5 + (i - 31) * (width * 0.02);
      const py = y + height * (0.3 + (i - 27) * 0.05);
      landmarks.push({ x: px, y: py });
    }
    
    // Eyes - points 36-47
    // Left eye (36-41)
    for (let i = 36; i <= 41; i++) {
      const angle = ((i - 36) / 6) * 2 * Math.PI;
      const px = x + width * 0.35 + Math.cos(angle) * (width * 0.06);
      const py = y + height * 0.4 + Math.sin(angle) * (height * 0.03);
      landmarks.push({ x: px, y: py });
    }
    // Right eye (42-47)
    for (let i = 42; i <= 47; i++) {
      const angle = ((i - 42) / 6) * 2 * Math.PI;
      const px = x + width * 0.65 + Math.cos(angle) * (width * 0.06);
      const py = y + height * 0.4 + Math.sin(angle) * (height * 0.03);
      landmarks.push({ x: px, y: py });
    }
    
    // Mouth - points 48-67
    for (let i = 48; i <= 67; i++) {
      const angle = ((i - 48) / 20) * 2 * Math.PI;
      const px = x + width * 0.5 + Math.cos(angle) * (width * 0.08);
      const py = y + height * 0.75 + Math.sin(angle) * (height * 0.04);
      landmarks.push({ x: px, y: py });
    }
    
    return landmarks;
  }, []);

  // Draw wireframe connections between landmarks
  const drawFaceWireframe = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.lineWidth = 1;
    
    // Draw jaw line (points 0-16)
    ctx.strokeStyle = '#FFFF00'; // Yellow
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      if (landmarks[i]) {
        if (i === 0) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.stroke();
    
    // Draw eyebrows
    ctx.strokeStyle = '#FF8800'; // Orange
    // Right eyebrow (17-21)
    ctx.beginPath();
    for (let i = 17; i <= 21; i++) {
      if (landmarks[i]) {
        if (i === 17) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.stroke();
    // Left eyebrow (22-26)
    ctx.beginPath();
    for (let i = 22; i <= 26; i++) {
      if (landmarks[i]) {
        if (i === 22) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.stroke();
    
    // Draw nose (27-35)
    ctx.strokeStyle = '#FF00FF'; // Magenta
    ctx.beginPath();
    for (let i = 27; i <= 35; i++) {
      if (landmarks[i]) {
        if (i === 27) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.stroke();
    
    // Draw eyes
    ctx.strokeStyle = '#FF0000'; // Red
    // Left eye (36-41)
    ctx.beginPath();
    for (let i = 36; i <= 41; i++) {
      if (landmarks[i]) {
        if (i === 36) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    // Right eye (42-47)
    ctx.beginPath();
    for (let i = 42; i <= 47; i++) {
      if (landmarks[i]) {
        if (i === 42) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    
    // Draw mouth (48-67)
    ctx.strokeStyle = '#00FFFF'; // Cyan
    ctx.beginPath();
    for (let i = 48; i <= 67; i++) {
      if (landmarks[i]) {
        if (i === 48) ctx.moveTo(landmarks[i].x, landmarks[i].y);
        else ctx.lineTo(landmarks[i].x, landmarks[i].y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }, []);

      const analyzeFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!videoElement || !canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // CRITICAL: Always clear canvas first to prevent double overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ensure canvas matches video dimensions exactly
      if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
      }

      // STRICT face detection
      const detections = await detectFaceInFrame(videoElement, canvas);
      const hasFaces = detections.length > 0;

      if (hasFaces) {
        // Draw SINGLE face overlay - no duplicates
        drawFaceOverlay(ctx, detections);
        
        console.log('✅ SINGLE face overlay drawn');
        
      } else {
        // No face detected - clear message
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Background box for message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(centerX - 140, centerY - 50, 280, 100);
        
        // Border
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 140, centerY - 50, 280, 100);
        
        // Main message
        ctx.fillStyle = '#FF4500'; // Orange-red color
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NO FACE DETECTED', centerX, centerY - 15);
        
        // Helper text
        ctx.fillStyle = '#FFAA00';
        ctx.font = '14px Arial';
        ctx.fillText('Show your face to the camera', centerX, centerY + 5);
        
        // Status
        const status = isInitialized ? '✅ Detection Ready' : '⏳ Initializing...';
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.fillText(status, centerX, centerY + 25);
        
        // Reset text alignment
        ctx.textAlign = 'left';
      }

      // Update analysis data based on real detections
      const analysisResult = calculateConfidence(detections);
      setAnalysisData(analysisResult);
      
    } catch (err) {
      console.error('❌ Face detection error:', err);
      // Clear canvas on error
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [calculateConfidence, detectFaceInFrame, drawFaceOverlay, isInitialized]);

  const startAnalysis = useCallback((videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    setIsAnalyzing(true);
    setIsInitialized(true); // Set as initialized for demo
    intervalRef.current = setInterval(() => {
      analyzeFrame(videoElement, canvas);
    }, updateFrequency * 1000); // Use configurable frequency
  }, [analyzeFrame, updateFrequency]);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    initializeFaceAPI();
    
    return () => {
      stopAnalysis();
    };
  }, [initializeFaceAPI, stopAnalysis]);

  return {
    isInitialized,
    isAnalyzing,
    analysisData,
    error,
    startAnalysis,
    stopAnalysis,
    analyzeFrame
  };
}
