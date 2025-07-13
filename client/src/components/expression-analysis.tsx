import { getExpressionEmoji } from '@/utils/confidence-calculator';

interface ExpressionAnalysisProps {
  dominantExpression: string;
  expressionScore: number;
  expressions?: Record<string, number>;
}

export function ExpressionAnalysis({
  dominantExpression,
  expressionScore,
  expressions = {}
}: ExpressionAnalysisProps) {
  const emoji = getExpressionEmoji(dominantExpression);
  
  // Get top 4 expressions for display
  const sortedExpressions = Object.entries(expressions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4);

  const getExpressionColor = (percentage: number) => {
    if (percentage >= 40) return 'text-green-400';
    if (percentage >= 25) return 'text-blue-400';
    if (percentage >= 15) return 'text-cyan-400';
    return 'text-yellow-400';
  };

  return (
    <div className="tech-border rounded-xl">
      <div className="tech-border-content rounded-xl p-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
          EXPRESSION ANALYSIS
        </h3>
        
        {/* Current Expression */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{emoji}</div>
          <div className="text-xl font-semibold text-cyan-400 uppercase">
            {dominantExpression}
          </div>
          <div className="text-sm text-gray-400">
            Confidence: {expressionScore}%
          </div>
        </div>
        
        {/* Expression History */}
        <div className="space-y-2">
          {sortedExpressions.length > 0 ? (
            sortedExpressions.map(([name, value]) => {
              const percentage = Math.round(value * 100);
              return (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 capitalize">{name}</span>
                  <span className={`font-semibold ${getExpressionColor(percentage)}`}>
                    {percentage}%
                  </span>
                </div>
              );
            })
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Happy</span>
                <span className="text-green-400 font-semibold">0%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Neutral</span>
                <span className="text-blue-400 font-semibold">0%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Focused</span>
                <span className="text-cyan-400 font-semibold">0%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Surprised</span>
                <span className="text-yellow-400 font-semibold">0%</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
