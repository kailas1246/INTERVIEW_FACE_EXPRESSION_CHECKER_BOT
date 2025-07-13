import { useState, useRef, useCallback, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';

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
      console.log('Loading face-api.js models...');
      
      // Load face-api.js models from CDN
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
      
      // Load required models for face detection and landmarks
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      setIsInitialized(true);
      console.log('✅ Face-api.js models loaded successfully!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize face detection';
      setError(errorMessage);
      console.error('❌ Face API initialization error:', err);
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
      // Use face-api.js for real face detection with landmarks
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      
      console.log(`🔍 Detected ${detections.length} face(s)`);
      
      if (detections.length > 0) {
        // Log detection details
        detections.forEach((detection, i) => {
          console.log(`Face ${i + 1}:`, {
            confidence: Math.round(detection.detection.score * 100) + '%',
            expressions: detection.expressions,
            landmarks: detection.landmarks?.positions?.length || 0
          });
        });
      }
      
      return detections;
      
    } catch (err) {
      console.error('❌ Face detection error:', err);
      return [];
    }
  }, [isInitialized]);

  // Draw face wireframe and landmarks using face-api.js detections
  const drawFaceWireframe = useCallback((ctx: CanvasRenderingContext2D, detections: any[]) => {
    // Clear canvas first
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    detections.forEach((detection, index) => {
      const { x, y, width, height } = detection.detection.box;
      
      // Draw face bounding box
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);
      
      // Draw face confidence score
      ctx.fillStyle = '#00FFFF';
      ctx.font = '14px Arial';
      ctx.fillText(`Face ${index + 1}: ${Math.round(detection.detection.score * 100)}%`, x, y - 10);
      
      // Draw facial landmarks if available
      if (detection.landmarks) {
        const landmarks = detection.landmarks.positions;
        
        // Draw landmark points
        ctx.fillStyle = '#00FF00';
        landmarks.forEach((point: any) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Draw eye landmarks specifically (points 36-47 for eyes)
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        // Left eye (points 36-41)
        ctx.beginPath();
        for (let i = 36; i <= 41; i++) {
          if (landmarks[i]) {
            if (i === 36) ctx.moveTo(landmarks[i].x, landmarks[i].y);
            else ctx.lineTo(landmarks[i].x, landmarks[i].y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Right eye (points 42-47)
        ctx.beginPath();
        for (let i = 42; i <= 47; i++) {
          if (landmarks[i]) {
            if (i === 42) ctx.moveTo(landmarks[i].x, landmarks[i].y);
            else ctx.lineTo(landmarks[i].x, landmarks[i].y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw face outline (jaw line points 0-16)
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          if (landmarks[i]) {
            if (i === 0) ctx.moveTo(landmarks[i].x, landmarks[i].y);
            else ctx.lineTo(landmarks[i].x, landmarks[i].y);
          }
        }
        ctx.stroke();
        
        // Draw nose (points 27-35)
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 27; i <= 35; i++) {
          if (landmarks[i]) {
            if (i === 27) ctx.moveTo(landmarks[i].x, landmarks[i].y);
            else ctx.lineTo(landmarks[i].x, landmarks[i].y);
          }
        }
        ctx.stroke();
        
        // Draw mouth (points 48-67)
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 48; i <= 59; i++) {
          if (landmarks[i]) {
            if (i === 48) ctx.moveTo(landmarks[i].x, landmarks[i].y);
            else ctx.lineTo(landmarks[i].x, landmarks[i].y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }
      
      // Display dominant expression
      if (detection.expressions) {
        const expressions = detection.expressions;
        const maxExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        const confidence = Math.round(expressions[maxExpression] * 100);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(`${maxExpression}: ${confidence}%`, x, y + height + 20);
      }
    });
  }, []);

    const analyzeFrame = useCallback(async (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!videoElement || !canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // FIRST: Use face-api.js to detect faces
      const detections = await detectFaceInFrame(videoElement, canvas);
      const hasFaces = detections.length > 0;

      if (hasFaces) {
        // Draw wireframe for detected faces
        drawFaceWireframe(ctx, detections);
        
        // Log detection success
        console.log('✅ Face(s) detected and wireframe drawn');
        
      } else {
        // No face detected - clear canvas and show message
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '16px Arial';
        ctx.fillText('NO FACE DETECTED', canvas.width / 2 - 80, canvas.height / 2);
        
        ctx.fillStyle = '#FFAA00';
        ctx.font = '10px Arial';
        ctx.fillText('Position your face in camera view', canvas.width / 2 - 80, canvas.height / 2 + 20);
        
        // Show initialization status
        const status = isInitialized ? 'Face-API Ready' : 'Loading Models...';
        ctx.fillStyle = '#888888';
        ctx.font = '9px Arial';
        ctx.fillText(status, canvas.width / 2 - 30, canvas.height / 2 + 35);
      }

      // Update analysis data based on real detections
      const analysisResult = calculateConfidence(detections);
      setAnalysisData(analysisResult);
      
    } catch (err) {
      console.error('❌ Face detection error:', err);
    }
  }, [calculateConfidence, detectFaceInFrame, drawFaceWireframe, isInitialized]);

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
