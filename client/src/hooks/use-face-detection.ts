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
      
      // For demo purposes, simulate successful initialization
      // In a production environment, you would load actual face-api.js models
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading time
      
      setIsInitialized(true);
      console.log('Face detection initialized (demo mode)');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize face detection';
      setError(errorMessage);
      console.error('Face API initialization error:', err);
    }
  }, []);

  const calculateConfidence = useCallback((detections: any[] = []): AnalysisData => {
    // Only generate data when face is actually detected
    if (detections.length > 0) {
      const time = Date.now() / 1000;
      
      // Generate varying but realistic confidence scores
      const baseConfidence = 70 + Math.sin(time * 0.5) * 15;
      const eyeContactScore = Math.max(60, Math.min(95, baseConfidence + Math.sin(time * 0.8) * 10));
      const headPostureScore = Math.max(65, Math.min(90, baseConfidence + Math.cos(time * 0.6) * 8));
      const expressionScore = Math.max(70, Math.min(95, baseConfidence + Math.sin(time * 1.2) * 12));
      
      // Cycle through different expressions including sad and angry
      const expressions = ['neutral', 'happy', 'focused', 'confident', 'surprised', 'sad', 'angry'];
      const expressionIndex = Math.floor(time / 4) % expressions.length;
      const dominantExpression = expressions[expressionIndex];
      
      const confidenceScore = Math.round((eyeContactScore * 0.4 + headPostureScore * 0.3 + expressionScore * 0.3));

      return {
        confidenceScore,
        eyeContactScore: Math.round(eyeContactScore),
        headPostureScore: Math.round(headPostureScore),
        expressionScore: Math.round(expressionScore),
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

  const detectFaceInFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<boolean> => {
    if (!videoElement || !canvas) return false;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      // Draw current video frame to canvas for analysis
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple face detection algorithm based on skin tone detection
      // This is a mock implementation - in production use face-api.js
      let skinPixelCount = 0;
      let totalPixels = 0;
      
      // Sample pixels in the center region where face would typically be
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sampleRadius = Math.min(canvas.width, canvas.height) / 4;
      
      for (let y = centerY - sampleRadius; y < centerY + sampleRadius; y += 4) {
        for (let x = centerX - sampleRadius; x < centerX + sampleRadius; x += 4) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Simple skin tone detection (very basic)
            if (r > 95 && g > 40 && b > 20 && 
                Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                Math.abs(r - g) > 15 && r > g && r > b) {
              skinPixelCount++;
            }
            totalPixels++;
          }
        }
      }
      
      // If more than 20% of sampled pixels are skin-like, consider face detected
      const skinRatio = skinPixelCount / totalPixels;
      return skinRatio > 0.20;
      
    } catch (err) {
      console.error('Face detection error:', err);
      return false;
    }
  }, []);

  const analyzeFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!videoElement || !canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // FIRST: Confirm if a face is actually present
      const isFaceDetected = await detectFaceInFrame(videoElement, canvas);

      let detections: any[] = [];
      
      // ONLY analyze if face is confirmed to be present
      if (isFaceDetected) {
        // Face confirmed - proceed with analysis
        detections = [{}]; // Mock detection data
        
        // Draw face detection box only when face is actually detected
        if (ctx) {
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const boxWidth = 200;
          const boxHeight = 250;
          
          ctx.strokeRect(
            centerX - boxWidth/2,
            centerY - boxHeight/2,
            boxWidth,
            boxHeight
          );
          
          // Draw landmarks points
          ctx.fillStyle = '#00FFFF';
          const points = [
            // Eyes
            { x: centerX - 30, y: centerY - 40 },
            { x: centerX + 30, y: centerY - 40 },
            // Nose
            { x: centerX, y: centerY },
            // Mouth corners
            { x: centerX - 20, y: centerY + 40 },
            { x: centerX + 20, y: centerY + 40 },
          ];
          
          points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          });
          
          // Add "FACE DETECTED" text
          ctx.fillStyle = '#00FFFF';
          ctx.font = '12px Arial';
          ctx.fillText('FACE DETECTED', centerX - 50, centerY - 140);
        }
      } else {
        // No face detected - clear the canvas and show message
        if (ctx) {
          ctx.fillStyle = '#FF6B6B';
          ctx.font = '16px Arial';
          ctx.fillText('NO FACE DETECTED', canvas.width / 2 - 80, canvas.height / 2);
        }
      }

      // Update analysis data - only process if face is confirmed
      const analysisResult = calculateConfidence(detections);
      setAnalysisData(analysisResult);
      
    } catch (err) {
      console.error('Face detection error:', err);
    }
  }, [calculateConfidence, detectFaceInFrame]);

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
