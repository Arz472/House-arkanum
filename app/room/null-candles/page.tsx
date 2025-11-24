'use client';

import dynamic from 'next/dynamic';

const NullCandlesRoomScene = dynamic(() => import('@/components/scenes/NullCandlesRoomScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading Null Candles Room...</p>
    </div>
  ),
});

export default function NullCandlesRoomPage() {
  return <NullCandlesRoomScene />;
}
