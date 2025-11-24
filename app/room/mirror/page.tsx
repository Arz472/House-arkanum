'use client';

import dynamic from 'next/dynamic';

const MirrorRoomScene = dynamic(() => import('@/components/scenes/MirrorRoomScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading Mirror Room...</p>
    </div>
  ),
});

export default function MirrorRoomPage() {
  return <MirrorRoomScene />;
}
