import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  latency: number;
}

export function usePerformanceMonitor(isAnalyzing: boolean) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 30,
    latency: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAnalyzing) {
      intervalRef.current = setInterval(() => {
        const now = performance.now();
        const deltaTime = now - lastTimeRef.current;
        
        // Calculate FPS based on frame count
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Mock realistic performance metrics
        const baseCPU = isAnalyzing ? 45 : 15;
        const baseMemory = isAnalyzing ? 62 : 28;
        
        setMetrics({
          cpuUsage: Math.max(20, Math.min(80, baseCPU + Math.sin(now / 10000) * 15)),
          memoryUsage: Math.max(25, Math.min(75, baseMemory + Math.cos(now / 8000) * 10)),
          fps: Math.max(25, Math.min(30, fps || 30)),
          latency: Math.max(15, Math.min(45, 23 + Math.sin(now / 5000) * 8))
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnalyzing]);

  // Track frames for FPS calculation
  useEffect(() => {
    const trackFrame = () => {
      frameCountRef.current++;
      if (isAnalyzing) {
        requestAnimationFrame(trackFrame);
      }
    };

    if (isAnalyzing) {
      requestAnimationFrame(trackFrame);
    }
  }, [isAnalyzing]);

  return metrics;
}