'use client';

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
  return (
    <>
      <MobileWarning />
      <HallwayScene />
      <TouchControls />
    </>
  );
}
