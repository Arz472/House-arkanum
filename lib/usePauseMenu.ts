'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePauseMenu() {
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const openPause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const closePause = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Listen for ESC key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  return {
    isPaused,
    togglePause,
    openPause,
    closePause,
  };
}
