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

  const analyzeFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!videoElement || !canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // For demo purposes, simulate face detection based on video feed
      // In a real implementation, you would use face-api.js or similar library
      // For now, we'll simulate that a face is detected if the video is playing
      const isFaceDetected = videoElement.videoWidth > 0 && videoElement.videoHeight > 0 && 
                            !videoElement.paused && !videoElement.ended;

      let detections: any[] = [];
      
      if (isFaceDetected) {
        // Mock detection data - in real implementation this would come from face-api.js
        detections = [{}];
        
        // Draw mock face detection box only when face is "detected"
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
          
          // Draw mock landmarks points
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
        }
      }

      // Update analysis data based on actual detections
      const analysisResult = calculateConfidence(detections);
      setAnalysisData(analysisResult);
      
    } catch (err) {
      console.error('Face detection error:', err);
    }
  }, [calculateConfidence]);

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
