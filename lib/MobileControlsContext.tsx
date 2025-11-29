'use client';

import { createContext, useContext, useState, useRef, ReactNode, MutableRefObject } from 'react';

interface MobileControlsContextType {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  gyroRotationRef: MutableRefObject<{ x: number; y: number }>;
}

const MobileControlsContext = createContext<MobileControlsContextType | null>(null);

export function MobileControlsProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const gyroRotationRef = useRef({ x: 0, y: 0 });

  return (
    <MobileControlsContext.Provider
      value={{
        isMobile,
        setIsMobile,
        gyroRotationRef
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
