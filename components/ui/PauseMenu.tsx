'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

interface PauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
}

export default function PauseMenu({ isOpen, onClose, roomName = 'Room' }: PauseMenuProps) {
  const router = useRouter();

  // Handle ESC key to toggle pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gray-900 border-4 border-cyan-500 p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="font-mono text-3xl text-cyan-400 mb-6 text-center font-bold">
          PAUSED
        </h2>
        
        <div className="mb-6 text-center">
          <p className="font-mono text-gray-400 text-sm">
            {roomName}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-lg px-6 py-3 rounded border-2 border-cyan-400 transition-all duration-200 hover:scale-105"
          >
            Continue
          </button>

          <button
            onClick={handleReturnToHallway}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-mono text-lg px-6 py-3 rounded border-2 border-gray-500 transition-all duration-200 hover:scale-105"
          >
            Return to Hallway
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-gray-500">
            Press ESC to resume
          </p>
        </div>
      </div>
    </div>
  );
}
