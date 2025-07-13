import { useState, useCallback } from 'react';

interface SystemConfig {
  detectionSensitivity: 'high' | 'medium' | 'low';
  updateFrequency: 1 | 2 | 5; // seconds
  audioFeedback: boolean;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>({
    detectionSensitivity: 'high',
    updateFrequency: 1,
    audioFeedback: true
  });

  const updateDetectionSensitivity = useCallback((sensitivity: SystemConfig['detectionSensitivity']) => {
    setConfig(prev => ({ ...prev, detectionSensitivity: sensitivity }));
  }, []);

  const updateFrequency = useCallback((frequency: SystemConfig['updateFrequency']) => {
    setConfig(prev => ({ ...prev, updateFrequency: frequency }));
  }, []);

  const toggleAudioFeedback = useCallback(() => {
    setConfig(prev => ({ ...prev, audioFeedback: !prev.audioFeedback }));
  }, []);

  return {
    config,
    updateDetectionSensitivity,
    updateFrequency,
    toggleAudioFeedback
  };
}