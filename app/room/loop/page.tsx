'use client';

import dynamic from 'next/dynamic';

const LoopRoomScene = dynamic(() => import('@/components/scenes/LoopRoomScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading Loop Room...</p>
    </div>
  ),
});

export default function LoopRoomPage() {
  return <LoopRoomScene />;
}
