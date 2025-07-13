import { useCallback } from 'react';

interface SessionData {
  confidenceScore: number;
  eyeContactScore: number;
  headPostureScore: number;
  expressionScore: number;
  dominantExpression: string;
  timestamp: number;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeCharts: boolean;
  includeStatistics: boolean;
}

export function useDataExport() {
  const exportSessionData = useCallback((
    sessionData: SessionData[], 
    options: ExportOptions = { format: 'json', includeCharts: true, includeStatistics: true }
  ) => {
    const exportObj = {
      metadata: {
        exportDate: new Date().toISOString(),
        sessionDuration: sessionData.length > 0 ? `${Math.floor(sessionData.length / 60)}:${(sessionData.length % 60).toString().padStart(2, '0')}` : '0:00',
        totalDataPoints: sessionData.length,
        format: options.format
      },
      sessionData: sessionData.map(point => ({
        timestamp: new Date(point.timestamp).toISOString(),
        confidence: point.confidenceScore,
        eyeContact: point.eyeContactScore,
        headPosture: point.headPostureScore,
        expression: point.dominantExpression,
        expressionScore: point.expressionScore
      })),
      statistics: options.includeStatistics ? {
        averageConfidence: sessionData.length > 0 ? Math.round(sessionData.reduce((sum, p) => sum + p.confidenceScore, 0) / sessionData.length) : 0,
        maxConfidence: sessionData.length > 0 ? Math.max(...sessionData.map(p => p.confidenceScore)) : 0,
        minConfidence: sessionData.length > 0 ? Math.min(...sessionData.map(p => p.confidenceScore)) : 0,
        averageEyeContact: sessionData.length > 0 ? Math.round(sessionData.reduce((sum, p) => sum + p.eyeContactScore, 0) / sessionData.length) : 0,
        dominantExpressions: getDominantExpressions(sessionData)
      } : undefined
    };

    if (options.format === 'json') {
      downloadJSON(exportObj, `interview-analysis-${new Date().toISOString().split('T')[0]}.json`);
    } else if (options.format === 'csv') {
      downloadCSV(sessionData, `interview-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    }
  }, []);

  const generateReport = useCallback((sessionData: SessionData[]) => {
    const stats = {
      averageConfidence: sessionData.length > 0 ? Math.round(sessionData.reduce((sum, p) => sum + p.confidenceScore, 0) / sessionData.length) : 0,
      maxConfidence: sessionData.length > 0 ? Math.max(...sessionData.map(p => p.confidenceScore)) : 0,
      sessionDuration: sessionData.length > 0 ? `${Math.floor(sessionData.length / 60)}:${(sessionData.length % 60).toString().padStart(2, '0')}` : '0:00',
      dominantExpressions: getDominantExpressions(sessionData)
    };

    const reportContent = `
# Interview Analysis Report
**Generated:** ${new Date().toLocaleString()}
**Session Duration:** ${stats.sessionDuration}

## Performance Summary
- **Average Confidence:** ${stats.averageConfidence}%
- **Peak Confidence:** ${stats.maxConfidence}%
- **Total Data Points:** ${sessionData.length}

## Expression Analysis
${Object.entries(stats.dominantExpressions).map(([expr, count]) => 
  `- **${expr.charAt(0).toUpperCase() + expr.slice(1)}:** ${count} occurrences`
).join('\n')}

## Recommendations
${getRecommendations(stats.averageConfidence)}
    `;

    downloadText(reportContent, `interview-report-${new Date().toISOString().split('T')[0]}.md`);
  }, []);

  const shareResults = useCallback((sessionData: SessionData[]) => {
    const shareData = {
      title: 'Interview Analysis Results',
      text: `My interview confidence score: ${sessionData.length > 0 ? Math.round(sessionData.reduce((sum, p) => sum + p.confidenceScore, 0) / sessionData.length) : 0}%`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      alert('Results copied to clipboard!');
    }
  }, []);

  return {
    exportSessionData,
    generateReport,
    shareResults
  };
}

function getDominantExpressions(data: SessionData[]): Record<string, number> {
  const expressionCounts: Record<string, number> = {};
  data.forEach(point => {
    expressionCounts[point.dominantExpression] = (expressionCounts[point.dominantExpression] || 0) + 1;
  });
  return expressionCounts;
}

function getRecommendations(averageScore: number): string {
  if (averageScore >= 80) {
    return "Excellent performance! You showed strong confidence and good eye contact throughout the interview.";
  } else if (averageScore >= 60) {
    return "Good performance! Consider practicing maintaining consistent eye contact and posture for even better results.";
  } else {
    return "Consider practicing interview techniques, focusing on maintaining good posture, eye contact, and positive facial expressions.";
  }
}

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

function downloadCSV(data: SessionData[], filename: string) {
  const headers = ['Timestamp', 'Confidence', 'Eye Contact', 'Head Posture', 'Expression', 'Expression Score'];
  const rows = data.map(point => [
    new Date(point.timestamp).toISOString(),
    point.confidenceScore,
    point.eyeContactScore,
    point.headPostureScore,
    point.dominantExpression,
    point.expressionScore
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadBlob(blob, filename);
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}