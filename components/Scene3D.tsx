'use client';

import { Canvas } from '@react-three/fiber';
import { ReactNode, useEffect, useState } from 'react';

interface Scene3DProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
}

export default function Scene3D({
  children,
  cameraPosition = [0, 0, 5],
  cameraFov = 60,
}: Scene3DProps) {
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <Canvas
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      camera={{
        position: cameraPosition,
        fov: isMobile ? cameraFov + 10 : cameraFov,
      }}
      gl={{
        antialias: !isMobile,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
      }}
      performance={{
        min: isMobile ? 0.5 : 0.75,
      }}
    >
      {children}
    </Canvas>
  );
}
