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
    // Sync canvas size with video - CRITICAL for overlay alignment
    if (videoRef.current && canvasRef.current && containerRef.current) {
      const updateCanvasSize = () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const container = containerRef.current!;
        
        if (video.videoWidth && video.videoHeight) {
          // Get the actual displayed video dimensions
          const videoAspect = video.videoWidth / video.videoHeight;
          const containerRect = container.getBoundingClientRect();
          const containerAspect = containerRect.width / containerRect.height;
          
          let displayWidth, displayHeight;
          
          if (videoAspect > containerAspect) {
            // Video is wider than container
            displayWidth = containerRect.width;
            displayHeight = containerRect.width / videoAspect;
          } else {
            // Video is taller than container
            displayHeight = containerRect.height;
            displayWidth = containerRect.height * videoAspect;
          }
          
          // Set canvas to match actual video display dimensions
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          
          // Position canvas to center over video
          const offsetX = (containerRect.width - displayWidth) / 2;
          const offsetY = (containerRect.height - displayHeight) / 2;
          
          canvas.style.width = displayWidth + 'px';
          canvas.style.height = displayHeight + 'px';
          canvas.style.left = offsetX + 'px';
          canvas.style.top = offsetY + 'px';
          
          console.log(`📐 Canvas aligned: ${displayWidth}x${displayHeight} at offset (${offsetX}, ${offsetY})`);
        } else {
          // Fallback: match container size if video dimensions not available
          const rect = container.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';
          canvas.style.left = '0px';
          canvas.style.top = '0px';
        }
      };

      const video = videoRef.current;
      video.addEventListener('loadedmetadata', updateCanvasSize);
      video.addEventListener('canplay', updateCanvasSize);
      video.addEventListener('resize', updateCanvasSize);
      window.addEventListener('resize', updateCanvasSize);
      
      // Initial size update with delay to ensure video is loaded
      setTimeout(updateCanvasSize, 100);
      setTimeout(updateCanvasSize, 500); // Additional delay for safety

      return () => {
        video.removeEventListener('loadedmetadata', updateCanvasSize);
        video.removeEventListener('canplay', updateCanvasSize);
        video.removeEventListener('resize', updateCanvasSize);
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
          
          {/* Canvas Overlay for Face Detection - PROPERLY ALIGNED */}
          <canvas
            ref={canvasRef}
            className="absolute pointer-events-none"
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
