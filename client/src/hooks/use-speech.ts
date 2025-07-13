import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

interface UseSpeechReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  speak: (text: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  voices: SpeechSynthesisVoice[];
  config: SpeechConfig;
  updateConfig: (newConfig: Partial<SpeechConfig>) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [config, setConfig] = useState<SpeechConfig>({
    rate: 1,
    pitch: 1,
    volume: 1
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech services
  useEffect(() => {
    const checkSupport = () => {
      const speechSupported = 'speechSynthesis' in window;
      const recognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsSupported(speechSupported && recognitionSupported);

      if (speechSupported) {
        synthRef.current = window.speechSynthesis;
        
        // Load voices
        const loadVoices = () => {
          const availableVoices = synthRef.current?.getVoices() || [];
          setVoices(availableVoices);
          
          // Set default voice (prefer English)
          const englishVoice = availableVoices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Google')
          ) || availableVoices.find(voice => voice.lang.startsWith('en'));
          
          if (englishVoice) {
            setConfig(prev => ({ ...prev, voice: englishVoice }));
          }
        };

        loadVoices();
        synthRef.current.addEventListener('voiceschanged', loadVoices);
      }

      if (recognitionSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.maxAlternatives = 1;

          recognitionRef.current.onstart = () => {
            setIsListening(true);
          };

          recognitionRef.current.onresult = (event) => {
            const result = event.results[0];
            if (result) {
              setTranscript(result[0].transcript);
              setConfidence(result[0].confidence || 0);
            }
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };
        }
      }
    };

    checkSupport();
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current || !isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (config.voice) {
        utterance.voice = config.voice;
      }
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      synthRef.current.speak(utterance);
    });
  }, [config, isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported || isListening) {
      return;
    }

    setTranscript('');
    setConfidence(0);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<SpeechConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    isSupported,
    isSpeaking,
    isListening,
    transcript,
    confidence,
    speak,
    startListening,
    stopListening,
    clearTranscript,
    voices,
    config,
    updateConfig
  };
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}