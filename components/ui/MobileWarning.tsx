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
      <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 max-w-md">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4 font-mono text-center">
          ⚠️ Desktop Recommended
        </h2>
        <p className="text-gray-300 mb-4 font-mono text-sm leading-relaxed">
          This game is optimized for desktop browsers with mouse and keyboard controls.
        </p>
        <p className="text-gray-400 mb-6 font-mono text-xs leading-relaxed">
          Mobile experience may be limited. For the best experience, please play on a desktop computer.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            label="Continue Anyway" 
            onClick={() => setDismissed(true)}
            variant="primary"
          />
          <p className="text-center text-gray-500 text-xs font-mono">
            Some features may not work properly on mobile
          </p>
        </div>
      </div>
    </div>
  );
}
