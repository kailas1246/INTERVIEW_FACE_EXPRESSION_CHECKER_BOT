import { useRef, useEffect } from 'react';
import { Play, Square, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
  onStopAnalysis: () => void;
  onStartCamera?: () => void;
  status: string;
}

export function VideoFeed({
  videoRef,
  canvasRef,
  isActive,
  isAnalyzing,
  onStartAnalysis,
  onStopAnalysis,
  onStartCamera,
  status
}: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync canvas size with video - IMPORTANT for preventing double overlay
    if (videoRef.current && canvasRef.current && containerRef.current) {
      const updateCanvasSize = () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const container = containerRef.current!;
        
        // Set canvas size to match container exactly
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Also set CSS size to prevent scaling issues
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        console.log(`📐 Canvas resized to: ${canvas.width}x${canvas.height}`);
      };

      const video = videoRef.current;
      video.addEventListener('loadedmetadata', updateCanvasSize);
      video.addEventListener('canplay', updateCanvasSize);
      window.addEventListener('resize', updateCanvasSize);
      
      // Initial size update
      setTimeout(updateCanvasSize, 100);

      return () => {
        video.removeEventListener('loadedmetadata', updateCanvasSize);
        video.removeEventListener('canplay', updateCanvasSize);
        window.removeEventListener('resize', updateCanvasSize);
      };
    }
  }, [videoRef, canvasRef]);

  return (
    <div className="tech-border rounded-xl animate-pulse-glow">
      <div className="tech-border-content rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-xl font-bold text-cyan-400 glow-text">
            LIVE VIDEO FEED
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">REC</span>
          </div>
        </div>
        
        {/* Video Container */}
        <div 
          ref={containerRef}
          className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          
          {/* Canvas Overlay for Face Detection - ONLY overlay, no double drawing */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 10,
              backgroundColor: 'transparent'
            }}
          />
          
          {/* Tech Overlay Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400"></div>
            
            {/* Center Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border border-cyan-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Status Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">{status}</span>
            </div>
          </div>
        </div>
        
        {/* Camera Controls */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          {!isActive && (
            <Button
              onClick={onStartCamera}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
            >
              <Camera className="w-4 h-4 mr-2" />
              ENABLE CAMERA
            </Button>
          )}
          
          {isActive && (
            <>
              <Button
                onClick={onStartAnalysis}
                disabled={isAnalyzing}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                START ANALYSIS
              </Button>
              
              <Button
                onClick={onStopAnalysis}
                disabled={!isAnalyzing}
                variant="destructive"
                className="font-semibold"
              >
                <Square className="w-4 h-4 mr-2" />
                STOP
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
