import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  SkipForward, 
  Clock,
  MessageSquare,
  Award,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useInterviewSimulation } from '@/hooks/use-interview-simulation';
import { cn } from '@/lib/utils';

interface InterviewSimulationProps {
  className?: string;
}

export function InterviewSimulation({ className }: InterviewSimulationProps) {
  const {
    session,
    isWaitingForAnswer,
    timeRemaining,
    currentAnswer,
    showFeedback,
    lastFeedback,
    isListening,
    isSpeaking,
    transcript,
    startInterview,
    startAnswering,
    submitAnswer,
    endInterview,
    skipQuestion,
    setCurrentAnswer
  } = useInterviewSimulation();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = session.questions.length > 0 ? ((session.currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <MessageSquare className="h-5 w-5" />
            Voice Interview Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!session.isActive && session.questions.length === 0 && (
            <div className="text-center space-y-4">
              <p className="text-gray-400">
                Ready to practice your interview skills? I'll ask you questions using voice and analyze your spoken responses.
              </p>
              <Button
                onClick={startInterview}
                disabled={isSpeaking}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Voice Interview
              </Button>
            </div>
          )}

          {session.isActive && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">
                    Question {session.currentQuestionIndex + 1} of {session.questions.length}
                  </span>
                  <span className="text-gray-400">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Current Question */}
              {currentQuestion && (
                <Card className="border-cyan-500/30 bg-gray-900/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                        {currentQuestion.category}
                      </Badge>
                      {isSpeaking && (
                        <div className="flex items-center gap-2 text-cyan-400">
                          <Volume2 className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">Speaking...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white font-medium">
                      {currentQuestion.question}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Timer and Controls */}
              {isWaitingForAnswer && (
                <Card className="border-orange-500/30 bg-orange-900/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span className="text-orange-400 font-medium">
                          Time Remaining: {formatTime(timeRemaining)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={startAnswering}
                        disabled={isListening}
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 flex-1 max-w-[120px]"
                      >
                        {isListening ? (
                          <>
                            <MicOff className="h-4 w-4 mr-2" />
                            Listening...
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Answer
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={skipQuestion}
                        variant="outline"
                        size="sm"
                        className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10 flex-1 max-w-[120px]"
                      >
                        <SkipForward className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Answer Input */}
              {isWaitingForAnswer && (
                <Card className="border-blue-500/30 bg-blue-900/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-blue-400 font-medium">Your Answer</label>
                      {isListening && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">Recording...</span>
                        </div>
                      )}
                    </div>
                    
                    {transcript && (
                      <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                        <p className="text-sm text-gray-300">
                          <span className="text-cyan-400 font-medium">Transcript:</span> {transcript}
                        </p>
                      </div>
                    )}

                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Speak your answer or type it here..."
                      className="min-h-[100px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={submitAnswer}
                        disabled={(!transcript && !currentAnswer.trim()) || isSpeaking}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback */}
              {showFeedback && lastFeedback && (
                <Card className="border-green-500/30 bg-green-900/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-medium">Answer Feedback</span>
                      </div>
                      <Badge 
                        variant={getScoreBadgeVariant(lastFeedback.score)}
                        className={cn("font-bold", getScoreColor(lastFeedback.score))}
                      >
                        {lastFeedback.score}%
                      </Badge>
                    </div>
                    
                    <p className="text-white">{lastFeedback.feedback}</p>
                    
                    {lastFeedback.keywords.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Keywords mentioned:</p>
                        <div className="flex flex-wrap gap-1">
                          {lastFeedback.keywords.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-green-500/50 text-green-400 text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Controls */}
              <div className="flex justify-center">
                <Button
                  onClick={endInterview}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Interview
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {!session.isActive && session.answers.length > 0 && (
            <Card className="border-purple-500/30 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-purple-400">Interview Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.round(session.answers.reduce((sum, answer) => sum + answer.score, 0) / session.answers.length)}%
                    </div>
                    <div className="text-sm text-gray-400">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {session.answers.length}
                    </div>
                    <div className="text-sm text-gray-400">Questions Answered</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {session.answers.map((answer, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                      <span className="text-sm text-gray-300">Question {index + 1}</span>
                      <Badge 
                        variant={getScoreBadgeVariant(answer.score)}
                        className={getScoreColor(answer.score)}
                      >
                        {answer.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={startInterview}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Start New Interview
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}