interface ConfidenceScoreProps {
  confidenceScore: number;
  eyeContactScore: number;
  headPostureScore: number;
  expressionScore: number;
}

export function ConfidenceScore({
  confidenceScore,
  eyeContactScore,
  headPostureScore,
  expressionScore
}: ConfidenceScoreProps) {
  const circumference = 2 * Math.PI * 56; // radius = 56
  const strokeDashoffset = circumference - (confidenceScore / 100) * circumference;

  return (
    <div className="tech-border rounded-xl">
      <div className="tech-border-content rounded-xl p-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
          CONFIDENCE SCORE
        </h3>
        
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-800"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-cyan-400 transition-all duration-1000 ease-in-out"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold glow-text text-cyan-400">
                {confidenceScore}
              </div>
              <div className="text-sm text-gray-400">%</div>
            </div>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Eye Contact</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${eyeContactScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-cyan-400">
                {eyeContactScore}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Head Posture</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${headPostureScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-blue-400">
                {headPostureScore}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Expression</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${expressionScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-green-400">
                {expressionScore}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
