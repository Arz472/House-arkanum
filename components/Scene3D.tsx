'use client';

import { Canvas } from '@react-three/fiber';
import { ReactNode } from 'react';

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
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{
        position: cameraPosition,
        fov: cameraFov,
      }}
    >
      {children}
    </Canvas>
  );
}
