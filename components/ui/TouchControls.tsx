'use client';

import { useEffect, useState } from 'react';
import { useDeviceOrientation } from '@/lib/useDeviceOrientation';
import { useMobileControls } from '@/lib/MobileControlsContext';

export default function TouchControls() {
  const {
    isMobile,
    setIsMobile,
    gyroRotationRef
  } = useMobileControls();
  
  const {
    isSupported: isGyroSupported,
    isActive: isGyroActive,
    orientation,
    requestPermission
  } = useDeviceOrientation();

  const [gyroRequested, setGyroRequested] = useState(false);

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

  // Auto-activate gyroscope listener after permission granted
  useEffect(() => {
    if (isMobile && isGyroSupported && !gyroRequested) {
      // Check if permission already granted (non-iOS or already approved)
      const checkAndActivate = () => {
        if (typeof DeviceOrientationEvent !== 'undefined') {
          // For non-iOS devices, just start listening
          if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
            setGyroRequested(true);
            requestPermission();
          }
        }
      };
      
      // Delay to let MobileWarning show first
      const timer = setTimeout(checkAndActivate, 500);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isGyroSupported, gyroRequested, requestPermission]);

  // Convert gyroscope to full 360 camera rotation
  useEffect(() => {
    if (!isMobile || !isGyroActive) return;

    const interval = setInterval(() => {
      // Use absolute orientation for 360 degree rotation
      // Alpha: compass direction (0-360) - horizontal rotation
      // Beta: front-back tilt (-180 to 180) - vertical rotation
      
      const alpha = orientation.alpha || 0;
      const beta = orientation.beta || 0;
      
      // Convert to radians and map to camera rotation
      // Alpha controls horizontal rotation (full 360)
      const rotationY = -(alpha * Math.PI / 180);
      
      // Beta controls vertical rotation (clamped)
      // Adjust beta so 0 is looking forward, positive is up, negative is down
      const adjustedBeta = beta - 90; // Phone held upright = 0 degrees
      const rotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, adjustedBeta * Math.PI / 180));

      gyroRotationRef.current = { x: rotationX, y: rotationY };
      
      console.log('Gyro 360:', { 
        alpha: alpha.toFixed(1), 
        beta: beta.toFixed(1),
        rotationY: rotationY.toFixed(3),
        rotationX: rotationX.toFixed(3)
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isMobile, isGyroActive, orientation, gyroRotationRef]);

  if (!isMobile) return null;

  return (
    <>
      {/* Gyro Status Indicator */}
      {isGyroActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 bg-opacity-90 px-3 py-2 rounded text-xs text-white font-mono border-2 border-green-400" style={{ zIndex: 100 }}>
          📱 Gyro Active - Move your phone to look around
        </div>
      )}
    </>
  );
}
