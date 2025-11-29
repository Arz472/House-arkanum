import { useEffect, useRef, useState } from 'react';

export interface InputState {
  look: { x: number; y: number };
  move: { x: number; z: number };
  interact: boolean;
}

export function useInputControls() {
  const [isMobile, setIsMobile] = useState(false);
  const inputState = useRef<InputState>({
    look: { x: 0, y: 0 },
    move: { x: 0, z: 0 },
    interact: false
  });

  // Mouse position for desktop
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop mouse tracking
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      inputState.current.look = {
        x: mousePos.current.x,
        y: mousePos.current.y
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  const handleMobileMove = (direction: { x: number; z: number }) => {
    inputState.current.move = direction;
  };

  const handleMobileLook = (delta: { x: number; y: number }) => {
    // Accumulate look rotation for mobile
    inputState.current.look.x += delta.x;
    inputState.current.look.y += delta.y;
  };

  const handleMobileInteract = () => {
    inputState.current.interact = true;
    setTimeout(() => {
      inputState.current.interact = false;
    }, 100);
  };

  return {
    isMobile,
    inputState: inputState.current,
    mousePos: mousePos.current,
    handleMobileMove,
    handleMobileLook,
    handleMobileInteract
  };
}
