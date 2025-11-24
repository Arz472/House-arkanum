'use client';

import dynamic from 'next/dynamic';

const CommitAltarScene = dynamic(() => import('@/components/scenes/CommitAltarScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Loading Commit Altar...</p>
    </div>
  ),
});

export default function CommitAltarPage() {
  return <CommitAltarScene />;
}
