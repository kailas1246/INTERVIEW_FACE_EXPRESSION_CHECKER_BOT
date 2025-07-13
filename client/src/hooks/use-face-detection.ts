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

export function useFaceDetection() {
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
      
      // Check if face-api is available
      if (typeof window !== 'undefined' && (window as any).faceapi) {
        const faceapi = (window as any).faceapi;
        
        // Load models from CDN
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'),
          faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'),
          faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model')
        ]);
        
        setIsInitialized(true);
      } else {
        throw new Error('face-api.js not loaded');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize face detection';
      setError(errorMessage);
      console.error('Face API initialization error:', err);
    }
  }, []);

  const calculateConfidence = useCallback((detections: FaceDetection[]): AnalysisData => {
    if (!detections.length) {
      return {
        confidenceScore: 0,
        eyeContactScore: 0,
        headPostureScore: 0,
        expressionScore: 0,
        dominantExpression: 'none',
        faceDetected: false
      };
    }

    const detection = detections[0];
    
    // Calculate eye contact score (simplified - based on face angle)
    const eyeContactScore = Math.max(0, 100 - Math.abs(detection.detection.angle || 0) * 2);
    
    // Calculate head posture score (face centered and upright)
    const headPostureScore = Math.max(0, 100 - Math.abs(detection.detection.angle || 0) * 1.5);
    
    // Calculate expression confidence
    const expressions = detection.expressions;
    const dominantExpression = Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b
    );
    const expressionScore = Math.round(expressions[dominantExpression] * 100);
    
    // Overall confidence score
    const confidenceScore = Math.round(
      (eyeContactScore * 0.4 + headPostureScore * 0.3 + expressionScore * 0.3)
    );

    return {
      confidenceScore,
      eyeContactScore: Math.round(eyeContactScore),
      headPostureScore: Math.round(headPostureScore),
      expressionScore,
      dominantExpression,
      faceDetected: true
    };
  }, []);

  const analyzeFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!isInitialized || !videoElement || !canvas) return;

    try {
      const faceapi = (window as any).faceapi;
      
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw detections
        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, {
            width: canvas.width,
            height: canvas.height
          });
          
          // Draw landmarks
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          // Draw detection box
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }
      }

      // Update analysis data
      const analysisResult = calculateConfidence(detections);
      setAnalysisData(analysisResult);
      
    } catch (err) {
      console.error('Face detection error:', err);
    }
  }, [isInitialized, calculateConfidence]);

  const startAnalysis = useCallback((videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!isInitialized) return;

    setIsAnalyzing(true);
    intervalRef.current = setInterval(() => {
      analyzeFrame(videoElement, canvas);
    }, 1000); // Analyze every second
  }, [isInitialized, analyzeFrame]);

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
