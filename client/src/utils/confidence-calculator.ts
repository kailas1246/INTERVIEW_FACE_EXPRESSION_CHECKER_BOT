interface ExpressionScores {
  [key: string]: number;
}

export function calculateEyeContactScore(landmarks: any): number {
  if (!landmarks) return 0;
  
  // Simplified eye contact calculation based on eye landmarks
  // In a real implementation, this would use more sophisticated gaze estimation
  return Math.floor(Math.random() * 20) + 70; // Mock implementation
}

export function calculateHeadPostureScore(detection: any): number {
  if (!detection) return 0;
  
  // Calculate head posture based on face angle and position
  const angle = detection.angle || 0;
  return Math.max(0, 100 - Math.abs(angle) * 2);
}

export function calculateExpressionScore(expressions: ExpressionScores): {
  score: number;
  dominant: string;
} {
  if (!expressions || Object.keys(expressions).length === 0) {
    return { score: 0, dominant: 'neutral' };
  }

  const dominantExpression = Object.keys(expressions).reduce((a, b) => 
    expressions[a] > expressions[b] ? a : b
  );
  
  const score = Math.round(expressions[dominantExpression] * 100);
  
  return { score, dominant: dominantExpression };
}

export function getExpressionEmoji(expression: string): string {
  const emojiMap: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲',
    neutral: '😐'
  };
  
  return emojiMap[expression] || '😐';
}

export function getConfidenceLevel(score: number): {
  level: string;
  color: string;
} {
  if (score >= 80) return { level: 'Excellent', color: 'text-green-400' };
  if (score >= 60) return { level: 'Good', color: 'text-blue-400' };
  if (score >= 40) return { level: 'Fair', color: 'text-yellow-400' };
  return { level: 'Needs Improvement', color: 'text-red-400' };
}
