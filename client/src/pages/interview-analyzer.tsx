import { useState, useRef, useEffect } from 'react';
import { Settings, Bot } from 'lucide-react';
import { useWebcam } from '@/hooks/use-webcam';
import { useFaceDetection } from '@/hooks/use-face-detection';
import { useSystemConfig } from '@/hooks/use-system-config';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useDataExport } from '@/hooks/use-data-export';
import { VideoFeed } from '@/components/video-feed';
import { ConfidenceScore } from '@/components/confidence-score';
import { ExpressionAnalysis } from '@/components/expression-analysis';
import { RealTimeStats } from '@/components/real-time-stats';
import { ScoreChart } from '@/components/score-chart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function InterviewAnalyzer() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessionData, setSessionData] = useState<any[]>([]);
  
  const {
    config,
    updateDetectionSensitivity,
    updateFrequency,
    toggleAudioFeedback
  } = useSystemConfig();

  const {
    videoRef,
    isActive: webcamActive,
    isLoading: webcamLoading,
    error: webcamError,
    startWebcam,
    stopWebcam
  } = useWebcam();

  const {
    isInitialized,
    isAnalyzing,
    analysisData,
    error: faceDetectionError,
    startAnalysis,
    stopAnalysis
  } = useFaceDetection();

  const performanceMetrics = usePerformanceMonitor(isAnalyzing);

  const {
    exportSessionData,
    generateReport,
    shareResults
  } = useDataExport();

  const [interviewQuestions] = useState([
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Describe a challenging project you've worked on.",
    "Where do you see yourself in 5 years?",
    "Why do you want this position?",
    "Tell me about a time you faced a difficult situation.",
    "What motivates you in your work?",
    "Do you have any questions for us?"
  ]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Track session data for exports
  useEffect(() => {
    if (isAnalyzing && analysisData.faceDetected) {
      const newDataPoint = {
        ...analysisData,
        timestamp: Date.now()
      };
      setSessionData(prev => [...prev, newDataPoint]);
    }
  }, [isAnalyzing, analysisData]);

  const handleStartCamera = async () => {
    try {
      await startWebcam();
      toast({
        title: "Camera Started",
        description: "Camera access granted successfully."
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Please allow camera access in your browser and try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartAnalysis = async () => {
    try {
      if (!webcamActive) {
        await startWebcam();
      }
      
      if (videoRef.current && canvasRef.current) {
        startAnalysis(videoRef.current, canvasRef.current);
        toast({
          title: "Analysis Started",
          description: "Real-time facial analysis is now active."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start analysis. Please check camera permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStopAnalysis = () => {
    stopAnalysis();
    stopWebcam();
    toast({
      title: "Analysis Stopped",
      description: "Facial analysis has been stopped."
    });
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => 
      prev < interviewQuestions.length - 1 ? prev + 1 : prev
    );
  };

  const getStatus = () => {
    if (faceDetectionError) return "Face detection error";
    if (webcamError) return "Camera access error";
    if (!isInitialized) return "Initializing face detection...";
    if (webcamLoading) return "Starting camera...";
    if (!webcamActive) return "Camera not active";
    if (isAnalyzing) return "Analyzing facial features...";
    return "Ready for analysis";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 data-grid opacity-20 pointer-events-none"></div>
      
      {/* Scan Line Animation */}
      <div className="fixed top-0 left-0 w-full h-1 scan-overlay pointer-events-none z-50"></div>

      {/* Header */}
      <header className="relative z-40 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="tech-border rounded-lg">
                <div className="tech-border-content p-2 rounded-lg">
                  <Bot className="text-cyan-400 text-2xl" size={24} />
                </div>
              </div>
              <div>
                <h1 className="font-orbitron text-2xl font-bold glow-text text-cyan-400">
                  AI INTERVIEW ANALYZER
                </h1>
                <p className="text-gray-400 text-sm">
                  Facial Confidence & Expression Detection System v2.1
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">System Status</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isInitialized ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className={`font-semibold ${
                    isInitialized ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {isInitialized ? 'ACTIVE' : 'LOADING'}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="tech-border rounded-lg hover:scale-105 transition-transform border-0"
              >
                <div className="tech-border-content p-2 rounded-lg">
                  <Settings className="text-gray-400 hover:text-cyan-400 transition-colors" size={16} />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Display */}
        {(webcamError || faceDetectionError) && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200">
              {webcamError || faceDetectionError}
            </p>
          </div>
        )}

        {/* Main Analysis Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Video Feed Section */}
          <div className="lg:col-span-2 space-y-4">
            <VideoFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              isActive={webcamActive}
              isAnalyzing={isAnalyzing}
              onStartAnalysis={handleStartAnalysis}
              onStopAnalysis={handleStopAnalysis}
              onStartCamera={handleStartCamera}
              status={getStatus()}
            />
          </div>

          {/* Confidence Score Panel */}
          <div className="space-y-4">
            <ConfidenceScore
              confidenceScore={analysisData.confidenceScore}
              eyeContactScore={analysisData.eyeContactScore}
              headPostureScore={analysisData.headPostureScore}
              expressionScore={analysisData.expressionScore}
            />

            <ExpressionAnalysis
              dominantExpression={analysisData.dominantExpression}
              expressionScore={analysisData.expressionScore}
            />
          </div>

          {/* Real-time Analytics */}
          <div className="space-y-4">
            <RealTimeStats
              isAnalyzing={isAnalyzing}
              faceDetected={analysisData.faceDetected}
              confidenceScore={analysisData.confidenceScore}
            />

            {/* Interview Simulation Panel */}
            <div className="tech-border rounded-xl">
              <div className="tech-border-content rounded-xl p-6">
                <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
                  INTERVIEW SIM
                </h3>
                
                {/* Question Display */}
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">Current Question:</div>
                  <div className="text-sm font-medium">
                    "{interviewQuestions[currentQuestionIndex]}"
                  </div>
                </div>
                
                {/* Question Controls */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex >= interviewQuestions.length - 1}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    Next Question
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 hover:border-cyan-400 text-gray-400 hover:text-cyan-400 font-semibold"
                  >
                    Pause Interview
                  </Button>
                </div>
                
                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-cyan-400">
                      {currentQuestionIndex + 1}/{interviewQuestions.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentQuestionIndex + 1) / interviewQuestions.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score History Chart */}
        <ScoreChart
          confidenceScore={analysisData.confidenceScore}
          eyeContactScore={analysisData.eyeContactScore}
          isAnalyzing={isAnalyzing}
        />

        {/* Footer Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* System Settings */}
          <div className="tech-border rounded-xl">
            <div className="tech-border-content rounded-xl p-6">
              <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
                SYSTEM CONFIG
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Detection Sensitivity</span>
                  <select 
                    value={config.detectionSensitivity} 
                    onChange={(e) => updateDetectionSensitivity(e.target.value as any)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Update Frequency</span>
                  <select 
                    value={config.updateFrequency} 
                    onChange={(e) => updateFrequency(Number(e.target.value) as any)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value={1}>1 second</option>
                    <option value={2}>2 seconds</option>
                    <option value={5}>5 seconds</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Audio Feedback</span>
                  <Button
                    onClick={toggleAudioFeedback}
                    size="sm"
                    className={`font-semibold ${config.audioFeedback 
                      ? 'bg-green-500 hover:bg-green-600 text-black' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {config.audioFeedback ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Export & Save */}
          <div className="tech-border rounded-xl">
            <div className="tech-border-content rounded-xl p-6">
              <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
                DATA EXPORT
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => exportSessionData(sessionData, { format: 'json', includeCharts: true, includeStatistics: true })}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  disabled={sessionData.length === 0}
                >
                  Export Session Data
                </Button>
                
                <Button
                  onClick={() => generateReport(sessionData)}
                  variant="outline"
                  className="w-full border-gray-600 hover:border-cyan-400 text-gray-400 hover:text-cyan-400 font-semibold"
                  disabled={sessionData.length === 0}
                >
                  Generate Report
                </Button>
                
                <Button
                  onClick={() => shareResults(sessionData)}
                  variant="outline"
                  className="w-full border-gray-600 hover:border-cyan-400 text-gray-400 hover:text-cyan-400 font-semibold"
                  disabled={sessionData.length === 0}
                >
                  Share Results
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Monitor */}
          <div className="tech-border rounded-xl">
            <div className="tech-border-content rounded-xl p-6">
              <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 glow-text">
                PERFORMANCE
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">CPU Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.round(performanceMetrics.cpuUsage)}%` }} 
                      />
                    </div>
                    <span className="text-sm font-semibold text-yellow-400">
                      {Math.round(performanceMetrics.cpuUsage)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Memory</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.round(performanceMetrics.memoryUsage)}%` }} 
                      />
                    </div>
                    <span className="text-sm font-semibold text-blue-400">
                      {Math.round(performanceMetrics.memoryUsage)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">FPS</span>
                  <span className="text-sm font-semibold text-green-400">
                    {Math.round(performanceMetrics.fps)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Latency</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {Math.round(performanceMetrics.latency)}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
