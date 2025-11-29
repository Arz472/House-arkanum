'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeviceOrientation } from '@/lib/useDeviceOrientation';
import { useMobileControls } from '@/lib/MobileControlsContext';

export default function TouchControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const lookTouchId = useRef<number | null>(null);
  const moveTouchId = useRef<number | null>(null);
  const lastLookPos = useRef({ x: 0, y: 0 });
  
  const {
    isMobile,
    setIsMobile,
    gyroEnabled,
    setGyroEnabled,
    gyroRotationRef,
    touchLookDeltaRef
  } = useMobileControls();
  
  const {
    isSupported: isGyroSupported,
    permission: gyroPermission,
    isActive: isGyroActive,
    orientation,
    requestPermission,
    resetOrientation,
    setIsActive
  } = useDeviceOrientation();

  const initialOrientation = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);

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
  }, [setIsMobile]);

  // Convert gyroscope data to camera rotation (like mouse parallax)
  useEffect(() => {
    if (!isMobile || !isGyroActive || !gyroEnabled) return;

    // Store initial orientation on first activation
    if (!initialOrientation.current) {
      initialOrientation.current = { ...orientation };
    }

    const interval = setInterval(() => {
      if (!initialOrientation.current) return;

      // Calculate relative rotation from initial position
      const deltaGamma = orientation.gamma - initialOrientation.current.gamma;
      const deltaBeta = orientation.beta - initialOrientation.current.beta;

      // Convert to normalized values similar to mouse position (-1 to 1)
      // Gamma: left-right tilt (-90 to 90) -> normalize to -1 to 1
      // Beta: front-back tilt (-180 to 180) -> normalize to -1 to 1
      const normalizedX = Math.max(-1, Math.min(1, deltaGamma / 45)); // 45 degrees = full range
      const normalizedY = Math.max(-1, Math.min(1, -deltaBeta / 45)); // Inverted for natural feel

      // Apply same scaling as mouse parallax (0.1 for Y, 0.05 for X)
      const rotationY = -normalizedX * 0.1;
      const rotationX = normalizedY * 0.05;

      gyroRotationRef.current = { x: rotationX, y: rotationY };
      
      // Debug log
      console.log('Gyro:', { 
        gamma: orientation.gamma.toFixed(1), 
        beta: orientation.beta.toFixed(1),
        normalizedX: normalizedX.toFixed(2),
        normalizedY: normalizedY.toFixed(2),
        rotationY: rotationY.toFixed(3),
        rotationX: rotationX.toFixed(3)
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isMobile, isGyroActive, gyroEnabled, orientation, gyroRotationRef]);

  const handleGyroToggle = async () => {
    if (!isMobile) return;

    if (!gyroEnabled) {
      const granted = await requestPermission();
      if (granted) {
        setGyroEnabled(true);
        initialOrientation.current = null; // Reset on enable
        resetOrientation();
      }
    } else {
      setGyroEnabled(false);
      setIsActive(false);
      initialOrientation.current = null;
      gyroRotationRef.current = { x: 0, y: 0 };
    }
  };

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach(touch => {
        const x = touch.clientX;
        const y = touch.clientY;

        // Left side = movement joystick
        if (x < window.innerWidth / 2 && moveTouchId.current === null) {
          moveTouchId.current = touch.identifier;
          if (joystickRef.current) {
            joystickRef.current.style.left = `${x}px`;
            joystickRef.current.style.top = `${y}px`;
            joystickRef.current.style.opacity = '1';
          }
        }
        // Right side = look/camera control (only if gyro is disabled)
        else if (x >= window.innerWidth / 2 && lookTouchId.current === null && !gyroEnabled) {
          lookTouchId.current = touch.identifier;
          lastLookPos.current = { x, y };
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      Array.from(e.changedTouches).forEach(touch => {
        // Movement joystick
        if (touch.identifier === moveTouchId.current && joystickRef.current && knobRef.current) {
          const rect = joystickRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = touch.clientX - centerX;
          const deltaY = touch.clientY - centerY;
          
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const maxDistance = 40;
          
          const clampedDistance = Math.min(distance, maxDistance);
          const angle = Math.atan2(deltaY, deltaX);
          
          const knobX = Math.cos(angle) * clampedDistance;
          const knobY = Math.sin(angle) * clampedDistance;
          
          knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
          
          // Normalize movement (handled by individual scenes if needed)
          // const normalizedX = (Math.cos(angle) * clampedDistance) / maxDistance;
          // const normalizedZ = (Math.sin(angle) * clampedDistance) / maxDistance;
        }
        
        // Look control (only if gyro disabled)
        if (touch.identifier === lookTouchId.current && !gyroEnabled) {
          const deltaX = touch.clientX - lastLookPos.current.x;
          const deltaY = touch.clientY - lastLookPos.current.y;
          
          touchLookDeltaRef.current = { x: deltaX * 0.003, y: deltaY * 0.003 };
          
          lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach(touch => {
        if (touch.identifier === moveTouchId.current) {
          moveTouchId.current = null;
          if (joystickRef.current) {
            joystickRef.current.style.opacity = '0';
          }
          if (knobRef.current) {
            knobRef.current.style.transform = 'translate(0, 0)';
          }
          // Movement reset handled by individual scenes
        }
        
        if (touch.identifier === lookTouchId.current) {
          lookTouchId.current = null;
          touchLookDeltaRef.current = { x: 0, y: 0 };
        }
      });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, gyroEnabled, touchLookDeltaRef]);

  if (!isMobile) return null;

  return (
    <>
      {/* Virtual Joystick */}
      <div
        ref={joystickRef}
        className="fixed w-24 h-24 rounded-full bg-gray-800 bg-opacity-50 border-2 border-gray-600 pointer-events-none transition-opacity duration-200"
        style={{
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          zIndex: 100
        }}
      >
        <div
          ref={knobRef}
          className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-cyan-500 bg-opacity-70 border-2 border-cyan-300"
          style={{
            transform: 'translate(-50%, -50%)',
            transition: 'none'
          }}
        />
      </div>

      {/* Gyroscope Toggle Button (only show if supported on mobile) */}
      {isGyroSupported && (
        <button
          onClick={handleGyroToggle}
          className={`fixed top-4 right-4 w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl shadow-lg active:scale-90 transition-all ${
            gyroEnabled 
              ? 'bg-green-600 bg-opacity-90 border-green-400' 
              : 'bg-gray-800 bg-opacity-70 border-gray-600'
          }`}
          style={{ zIndex: 100 }}
          title={gyroEnabled ? 'Gyro ON' : 'Gyro OFF'}
        >
          📱
        </button>
      )}

      {/* Interact Button */}
      <button
        onClick={() => {
          // Simulate click at center of screen
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2
          });
          document.dispatchEvent(event);
        }}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-red-600 bg-opacity-90 border-2 border-red-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg active:scale-90 transition-transform"
        style={{ zIndex: 100 }}
      >
        ⚡
      </button>

      {/* Minimal Control Hint */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-60 px-3 py-2 rounded text-xs text-gray-400 font-mono" style={{ zIndex: 100 }}>
        {gyroEnabled ? (
          <div className="text-green-400">📱 Gyro Active</div>
        ) : (
          <div>👈 Move | 👉 Look</div>
        )}
      </div>
    </>
  );
}
