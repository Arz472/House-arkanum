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

  // Listen for permission granted event from MobileWarning
  useEffect(() => {
    const handlePermissionGranted = () => {
      console.log('📱 TouchControls: Permission granted, activating gyroscope...');
      if (!gyroRequested) {
        setGyroRequested(true);
        requestPermission().then(success => {
          console.log('📱 Gyroscope activation:', success ? 'SUCCESS' : 'FAILED');
        });
      }
    };

    window.addEventListener('gyroPermissionGranted', handlePermissionGranted);
    return () => window.removeEventListener('gyroPermissionGranted', handlePermissionGranted);
  }, [gyroRequested, requestPermission]);

  // Use deviceorientation event directly for better compatibility
  useEffect(() => {
    if (!isMobile || !isGyroActive) return;

    let lastAlpha = 0;
    let lastBeta = 0;
    let lastGamma = 0;
    let initialized = false;
    let cameraRotationY = 0;
    let cameraRotationX = 0;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha || 0;
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      // Initialize on first reading
      if (!initialized && (alpha !== 0 || beta !== 0 || gamma !== 0)) {
        lastAlpha = alpha;
        lastBeta = beta;
        lastGamma = gamma;
        initialized = true;
        console.log('📱 Gyro initialized:', { alpha, beta, gamma });
        return;
      }

      if (!initialized) return;

      // Calculate deltas
      let deltaAlpha = alpha - lastAlpha;
      const deltaBeta = beta - lastBeta;
      const deltaGamma = gamma - lastGamma;

      // Handle alpha wraparound (0-360)
      if (deltaAlpha > 180) deltaAlpha -= 360;
      if (deltaAlpha < -180) deltaAlpha += 360;

      // Use gamma (left-right tilt) for horizontal rotation
      // Use beta (forward-back tilt) for vertical rotation
      const sensitivity = 0.02;
      cameraRotationY += deltaGamma * sensitivity; // Inverted for natural feel
      cameraRotationX -= deltaBeta * sensitivity * 0.5; // Inverted for natural feel

      // Clamp vertical rotation
      cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotationX));

      gyroRotationRef.current = { x: cameraRotationX, y: cameraRotationY };

      // Update last values
      lastAlpha = alpha;
      lastBeta = beta;
      lastGamma = gamma;

      // Debug log
      if (Math.floor(Date.now() / 1000) % 2 === 0) {
        console.log('📱 Gyro:', { 
          alpha: alpha.toFixed(1), 
          beta: beta.toFixed(1),
          gamma: gamma.toFixed(1),
          deltaGamma: deltaGamma.toFixed(2),
          deltaBeta: deltaBeta.toFixed(2),
          camY: cameraRotationY.toFixed(3),
          camX: cameraRotationX.toFixed(3)
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    console.log('📱 Listening for device orientation events...');

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isMobile, isGyroActive, gyroRotationRef]);

  // Debug: Log when gyro becomes active
  useEffect(() => {
    if (isGyroActive) {
      console.log('✅ Gyroscope is now ACTIVE');
    } else {
      console.log('⏸️ Gyroscope is INACTIVE');
    }
  }, [isGyroActive]);

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
