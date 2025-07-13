import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoreChartProps {
  confidenceScore: number;
  eyeContactScore: number;
  isAnalyzing: boolean;
}

interface DataPoint {
  timestamp: number;
  confidence: number;
  eyeContact: number;
}

export function ScoreChart({
  confidenceScore,
  eyeContactScore,
  isAnalyzing
}: ScoreChartProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [timeRange, setTimeRange] = useState('5');

  useEffect(() => {
    if (isAnalyzing && confidenceScore > 0) {
      const newPoint: DataPoint = {
        timestamp: Date.now(),
        confidence: confidenceScore,
        eyeContact: eyeContactScore
      };
      
      setDataPoints(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 300 points (5 minutes at 1 second intervals)
        return updated.slice(-300);
      });
    }
  }, [confidenceScore, eyeContactScore, isAnalyzing]);

  const getFilteredData = () => {
    const now = Date.now();
    const rangeMs = parseInt(timeRange) * 60 * 1000; // Convert minutes to milliseconds
    return dataPoints.filter(point => now - point.timestamp <= rangeMs);
  };

  const generateSVGPath = (data: DataPoint[], accessor: keyof DataPoint) => {
    if (data.length < 2) return '';
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (point[accessor] as number);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const filteredData = getFilteredData();
  const confidencePath = generateSVGPath(filteredData, 'confidence');
  const eyeContactPath = generateSVGPath(filteredData, 'eyeContact');

  return (
    <div className="tech-border rounded-xl mb-6">
      <div className="tech-border-content rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron text-xl font-bold text-cyan-400 glow-text">
            CONFIDENCE TIMELINE
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-sm focus:border-cyan-400 focus:outline-none"
            >
              <option value="5">Last 5 minutes</option>
              <option value="10">Last 10 minutes</option>
              <option value="60">Last hour</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              className="tech-border rounded-lg hover:scale-105 transition-transform border-0"
            >
              <div className="tech-border-content p-2 rounded-lg">
                <Download className="w-4 h-4 text-gray-400 hover:text-cyan-400 transition-colors" />
              </div>
            </Button>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="relative h-64 bg-gray-900 rounded-lg p-4 overflow-hidden">
          {/* Chart Grid */}
          <div className="absolute inset-4 opacity-20">
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <div
                key={y}
                className={`absolute left-0 right-0 h-px ${
                  y === 0 || y === 100 ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
                style={{ top: `${y}%` }}
              />
            ))}
            
            {/* Vertical grid lines */}
            {[0, 25, 50, 75, 100].map((x) => (
              <div
                key={x}
                className="absolute top-0 bottom-0 w-px bg-gray-600"
                style={{ left: `${x}%` }}
              />
            ))}
          </div>
          
          {/* Chart Data */}
          {filteredData.length > 1 && (
            <svg className="absolute inset-4 w-auto h-auto" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Confidence line */}
              <path
                d={confidencePath}
                fill="none"
                stroke="#00FFFF"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              {/* Eye contact line */}
              <path
                d={eyeContactPath}
                fill="none"
                stroke="#0099FF"
                strokeWidth="2"
                opacity="0.7"
                className="transition-all duration-300"
              />
            </svg>
          )}
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-4">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Current score indicator */}
          {filteredData.length > 0 && (
            <div className="absolute right-4 top-1/3 transform -translate-y-1/2">
              <div className="bg-cyan-400 w-3 h-3 rounded-full animate-pulse"></div>
              <div className="text-xs text-cyan-400 font-bold mt-1">{confidenceScore}%</div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-cyan-400"></div>
            <span className="text-sm text-gray-400">Overall Confidence</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-400"></div>
            <span className="text-sm text-gray-400">Eye Contact Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
