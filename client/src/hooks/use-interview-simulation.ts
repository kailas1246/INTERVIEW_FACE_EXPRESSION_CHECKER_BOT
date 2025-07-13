import { useState, useCallback, useRef } from 'react';
import { useSpeech } from './use-speech';

interface InterviewQuestion {
  id: number;
  question: string;
  category: 'behavioral' | 'technical' | 'general' | 'leadership';
  expectedKeywords: string[];
  timeLimit: number; // in seconds
}

interface Answer {
  transcript: string;
  confidence: number;
  score: number;
  feedback: string;
  keywords: string[];
  timestamp: number;
}

interface InterviewSession {
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  answers: Answer[];
  startTime: number;
  isActive: boolean;
}

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question: "Tell me about yourself and your professional background.",
    category: 'general',
    expectedKeywords: ['experience', 'skills', 'background', 'career', 'professional', 'work'],
    timeLimit: 120
  },
  {
    id: 2,
    question: "Describe a challenging project you worked on and how you overcame the obstacles.",
    category: 'behavioral',
    expectedKeywords: ['challenge', 'problem', 'solution', 'overcome', 'project', 'team', 'result'],
    timeLimit: 180
  },
  {
    id: 3,
    question: "What are your greatest strengths and how do they apply to this role?",
    category: 'general',
    expectedKeywords: ['strengths', 'skills', 'abilities', 'role', 'apply', 'contribute'],
    timeLimit: 120
  },
  {
    id: 4,
    question: "Tell me about a time when you had to work with a difficult team member.",
    category: 'behavioral',
    expectedKeywords: ['team', 'difficult', 'conflict', 'communication', 'resolution', 'collaboration'],
    timeLimit: 150
  },
  {
    id: 5,
    question: "How do you handle pressure and tight deadlines?",
    category: 'behavioral',
    expectedKeywords: ['pressure', 'deadline', 'stress', 'manage', 'prioritize', 'organize'],
    timeLimit: 120
  },
  {
    id: 6,
    question: "Describe your leadership style and give an example of when you led a team.",
    category: 'leadership',
    expectedKeywords: ['leadership', 'style', 'team', 'lead', 'manage', 'example', 'result'],
    timeLimit: 180
  },
  {
    id: 7,
    question: "What motivates you and what are your career goals?",
    category: 'general',
    expectedKeywords: ['motivate', 'goals', 'career', 'ambition', 'growth', 'future'],
    timeLimit: 120
  },
  {
    id: 8,
    question: "Tell me about a mistake you made and what you learned from it.",
    category: 'behavioral',
    expectedKeywords: ['mistake', 'error', 'learned', 'lesson', 'improve', 'growth'],
    timeLimit: 150
  }
];

export function useInterviewSimulation() {
  const [session, setSession] = useState<InterviewSession>({
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    startTime: 0,
    isActive: false
  });

  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<Answer | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { speak, startListening, stopListening, transcript, isListening, isSpeaking, clearTranscript } = useSpeech();

  const analyzeAnswer = useCallback((answer: string, question: InterviewQuestion): Answer => {
    const keywords = question.expectedKeywords.filter(keyword => 
      answer.toLowerCase().includes(keyword.toLowerCase())
    );

    const keywordScore = Math.min((keywords.length / question.expectedKeywords.length) * 100, 100);
    const lengthScore = Math.min((answer.length / 50) * 20, 40); // Bonus for detailed answers
    const score = Math.min(keywordScore + lengthScore, 100);

    let feedback = '';
    if (score >= 80) {
      feedback = "Excellent answer! You covered the key points comprehensively and provided good detail.";
    } else if (score >= 60) {
      feedback = `Good answer, but consider mentioning: ${question.expectedKeywords.filter(k => !keywords.includes(k)).slice(0, 2).join(', ')}.`;
    } else if (score >= 40) {
      feedback = `Your answer could be improved. Try to include more details about: ${question.expectedKeywords.slice(0, 3).join(', ')}.`;
    } else {
      feedback = `Please provide a more detailed answer. Focus on: ${question.expectedKeywords.slice(0, 4).join(', ')}.`;
    }

    return {
      transcript: answer,
      confidence: 0.9,
      score: Math.round(score),
      feedback,
      keywords,
      timestamp: Date.now()
    };
  }, []);

  const startInterview = useCallback(async () => {
    const questions = [...INTERVIEW_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    
    setSession({
      currentQuestionIndex: 0,
      questions,
      answers: [],
      startTime: Date.now(),
      isActive: true
    });

    setShowFeedback(false);
    setLastFeedback(null);

    // Start with first question
    try {
      await speak("Welcome to your interview simulation. I will ask you several questions. Please answer clearly and thoroughly. Let's begin with the first question.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await speak(questions[0].question);
      
      setIsWaitingForAnswer(true);
      setTimeRemaining(questions[0].timeLimit);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up
            setIsWaitingForAnswer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  }, [speak]);

  const startAnswering = useCallback(() => {
    if (!isWaitingForAnswer) return;
    
    clearTranscript();
    setCurrentAnswer('');
    startListening();
  }, [isWaitingForAnswer, clearTranscript, startListening]);

  const submitAnswer = useCallback(async () => {
    if (!isWaitingForAnswer || !session.isActive) return;

    const answer = transcript || currentAnswer;
    if (!answer.trim()) {
      await speak("I didn't hear your answer. Please try again.");
      return;
    }

    stopListening();
    setIsWaitingForAnswer(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const analyzedAnswer = analyzeAnswer(answer, currentQuestion);
    
    setLastFeedback(analyzedAnswer);
    setShowFeedback(true);

    // Provide audio feedback
    await speak(analyzedAnswer.feedback);

    // Update session
    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, analyzedAnswer]
    }));

    // Wait a moment then continue to next question
    setTimeout(() => {
      nextQuestion();
    }, 3000);

  }, [transcript, currentAnswer, isWaitingForAnswer, session, stopListening, analyzeAnswer, speak]);

  const nextQuestion = useCallback(async () => {
    if (!session.isActive) return;

    const nextIndex = session.currentQuestionIndex + 1;
    
    if (nextIndex >= session.questions.length) {
      // Interview completed
      setSession(prev => ({ ...prev, isActive: false }));
      setShowFeedback(false);
      
      const averageScore = session.answers.reduce((sum, answer) => sum + answer.score, 0) / session.answers.length;
      
      await speak(`Interview completed! Your average score was ${Math.round(averageScore)} percent. Thank you for participating.`);
      return;
    }

    setSession(prev => ({ ...prev, currentQuestionIndex: nextIndex }));
    setShowFeedback(false);
    setLastFeedback(null);
    clearTranscript();

    const question = session.questions[nextIndex];
    
    try {
      await speak(`Next question: ${question.question}`);
      
      setIsWaitingForAnswer(true);
      setTimeRemaining(question.timeLimit);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsWaitingForAnswer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to ask next question:', error);
    }
  }, [session, speak, clearTranscript]);

  const endInterview = useCallback(() => {
    setSession(prev => ({ ...prev, isActive: false }));
    setIsWaitingForAnswer(false);
    setShowFeedback(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    stopListening();
  }, [stopListening]);

  const skipQuestion = useCallback(async () => {
    if (!session.isActive) return;
    
    setIsWaitingForAnswer(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Add empty answer
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const emptyAnswer: Answer = {
      transcript: '',
      confidence: 0,
      score: 0,
      feedback: 'Question skipped.',
      keywords: [],
      timestamp: Date.now()
    };

    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, emptyAnswer]
    }));

    await speak("Moving to the next question.");
    nextQuestion();
  }, [session, speak, nextQuestion]);

  return {
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
    nextQuestion,
    endInterview,
    skipQuestion,
    setCurrentAnswer
  };
}