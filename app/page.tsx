'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import MobileWarning from '@/components/ui/MobileWarning';
import TouchControls from '@/components/ui/TouchControls';

const HallwayScene = dynamic(() => import('@/components/scenes/HallwayScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading Hallway Hub...</p>
    </div>
  ),
});

export default function Home() {
  // These handlers can be passed to the scene if needed
  const handleMove = (direction: { x: number; z: number }) => {
    // Movement is handled by individual scenes
  };

  const handleLook = (delta: { x: number; y: number }) => {
    // Look is handled by individual scenes
  };

  const handleGyroLook = (orientation: { alpha: number; beta: number; gamma: number }) => {
    // Gyro look is handled by individual scenes
  };

  const handleInteract = () => {
    // Interaction is handled by clicking
  };

  return (
    <>
      <MobileWarning />
      <HallwayScene />
      <TouchControls 
        onMove={handleMove}
        onLook={handleLook}
        onGyroLook={handleGyroLook}
        onInteract={handleInteract}
      />
    </>
  );
}
