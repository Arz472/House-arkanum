'use client';

import dynamic from 'next/dynamic';

const MemoryLeakRoomScene = dynamic(() => import('@/components/scenes/MemoryLeakRoomScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading Memory Leak Room...</p>
    </div>
  ),
});

export default function MemoryLeakRoomPage() {
  return <MemoryLeakRoomScene />;
}
