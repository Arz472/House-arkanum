'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface MobileControlsContextType {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  gyroEnabled: boolean;
  setGyroEnabled: (value: boolean) => void;
  gyroRotation: { x: number; y: number };
  setGyroRotation: (rotation: { x: number; y: number }) => void;
  touchLookDelta: { x: number; y: number };
  setTouchLookDelta: (delta: { x: number; y: number }) => void;
}

const MobileControlsContext = createContext<MobileControlsContextType | null>(null);

export function MobileControlsProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const gyroRotation = useRef({ x: 0, y: 0 });
  const touchLookDelta = useRef({ x: 0, y: 0 });

  const setGyroRotation = (rotation: { x: number; y: number }) => {
    gyroRotation.current = rotation;
  };

  const setTouchLookDelta = (delta: { x: number; y: number }) => {
    touchLookDelta.current = delta;
  };

  return (
    <MobileControlsContext.Provider
      value={{
        isMobile,
        setIsMobile,
        gyroEnabled,
        setGyroEnabled,
        gyroRotation: gyroRotation.current,
        setGyroRotation,
        touchLookDelta: touchLookDelta.current,
        setTouchLookDelta
      }}
    >
      {children}
    </MobileControlsContext.Provider>
  );
}

export function useMobileControls() {
  const context = useContext(MobileControlsContext);
  if (!context) {
    throw new Error('useMobileControls must be used within MobileControlsProvider');
  }
  return context;
}
