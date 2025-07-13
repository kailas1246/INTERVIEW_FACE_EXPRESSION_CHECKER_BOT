import { useState, useEffect } from 'react';

interface RealTimeStatsProps {
  isAnalyzing: boolean;
  faceDetected: boolean;
  confidenceScore: number;
}

export function RealTimeStats({
  isAnalyzing,
  faceDetected,
  confidenceScore
}: RealTimeStatsProps) {
  const [sessionDuration, setSessionDuration] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [peakScore, setPeakScore] = useState(0);
  const [expressionCount, setExpressionCount] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
        setExpressionCount(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  useEffect(() => {
    if (confidenceScore > peakScore) {
      setPeakScore(confidenceScore);
    }
    
    // Simple running average calculation
    setAvgScore(prev => {
      if (prev === 0) return confidenceScore;
      return Math.round((prev + confidenceScore) / 2);
    });
  }, [confidenceScore, peakScore]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tech-border rounded-xl">
      <div className="tech-border-content rounded-xl p-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
          REAL-TIME STATS
        </h3>
        
        {/* Session Timer */}
        <div className="mb-6">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-cyan-400 glow-text">
              {formatDuration(sessionDuration)}
            </div>
            <div className="text-sm text-gray-400">Session Duration</div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Avg. Score</span>
              <span className="text-lg font-bold text-cyan-400">{avgScore}%</span>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Peak Score</span>
              <span className="text-lg font-bold text-green-400">{peakScore}%</span>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Face Detection</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  faceDetected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-semibold ${
                  faceDetected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {faceDetected ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Expressions</span>
              <span className="text-lg font-bold text-blue-400">{expressionCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
