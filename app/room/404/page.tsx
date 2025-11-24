'use client';

import dynamic from 'next/dynamic';

const Door404RoomScene = dynamic(() => import('@/components/scenes/Door404RoomScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading 404 Room...</p>
    </div>
  ),
});

export default function Door404RoomPage() {
  return <Door404RoomScene />;
}
