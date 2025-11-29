'use client';

import { useState, useEffect } from 'react';
import Button from './Button';

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
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

  const handleStartPlaying = async () => {
    setIsRequesting(true);
    
    // Request gyroscope permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        
        if (permission === 'granted') {
          window.dispatchEvent(new CustomEvent('gyroPermissionGranted'));
        }
      } catch (error) {
        // Permission denied or error
      }
    } else {
      // No permission needed (Android/older iOS)
      window.dispatchEvent(new CustomEvent('gyroPermissionGranted'));
    }
    
    setIsRequesting(false);
    setDismissed(true);
  };

  if (!isMobile || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-4 sm:p-6 max-w-sm w-full my-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-3 font-mono text-center">
          📱 Mobile Mode
        </h2>
        
        <p className="text-gray-300 mb-3 font-mono text-xs sm:text-sm leading-relaxed text-center">
          Touch controls enabled
        </p>
        
        <div className="bg-gray-800 p-3 rounded mb-3 space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <span className="text-lg">📱</span>
            <p className="text-gray-300 font-mono flex-1">
              <span className="text-green-400 font-bold">Move your phone</span> to look around 360°
            </p>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <span className="text-lg">👆</span>
            <p className="text-gray-300 font-mono flex-1">
              <span className="text-cyan-400 font-bold">Tap doors</span> to enter rooms
            </p>
          </div>
        </div>
        
        <div className="bg-green-900 bg-opacity-20 p-2 rounded border border-green-700 mb-4">
          <p className="font-mono text-xs text-green-300 text-center">
            🎮 You'll be asked for gyroscope permission
          </p>
        </div>
        
        <Button 
          label={isRequesting ? "Requesting..." : "Start Playing"} 
          onClick={handleStartPlaying}
          variant="primary"
        />
        
        <p className="text-gray-500 mt-3 font-mono text-xs text-center">
          Desktop recommended for best experience
        </p>
      </div>
    </div>
  );
}
