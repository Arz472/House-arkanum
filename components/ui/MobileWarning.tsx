'use client';

import { useState, useEffect } from 'react';
import Button from './Button';

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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

  if (!isMobile || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 max-w-md">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 font-mono text-center">
          📱 Mobile Controls Enabled
        </h2>
        <p className="text-gray-300 mb-4 font-mono text-sm leading-relaxed">
          Touch controls are now available! Use the virtual joystick and swipe gestures to play.
        </p>
        <div className="bg-gray-800 p-4 rounded mb-4 text-xs font-mono text-gray-300 space-y-2">
          <p>👈 <span className="text-cyan-400">Left side:</span> Virtual joystick for movement</p>
          <p>👉 <span className="text-cyan-400">Right side:</span> Swipe to look around</p>
          <p>📱 <span className="text-green-400">Gyroscope:</span> Move your phone to look (tap 📱 button)</p>
          <p>⚡ <span className="text-cyan-400">Button:</span> Interact with objects</p>
        </div>
        <div className="bg-purple-900 bg-opacity-30 p-3 rounded border border-purple-700 mb-4">
          <p className="font-mono text-xs text-purple-300">
            🎮 <span className="font-bold">PRO TIP:</span> Enable gyroscope controls for an immersive experience - your camera will follow where you point your phone!
          </p>
        </div>
        <p className="text-gray-400 mb-6 font-mono text-xs leading-relaxed text-center">
          Desktop still recommended for best experience
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            label="Start Playing" 
            onClick={() => setDismissed(true)}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
