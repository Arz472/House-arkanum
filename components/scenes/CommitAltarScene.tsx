'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Scene3D from '@/components/Scene3D';
import { useGameState } from '@/store/gameState';
import Button from '@/components/ui/Button';

function AltarContent() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      
      {/* Directional light */}
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
      
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#0f0f1e', 5, 20]} />
      
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Walls - back */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color="#0f0f1e" />
      </mesh>
      
      {/* Walls - left */}
      <mesh position={[-7, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color="#0f0f1e" />
      </mesh>
      
      {/* Walls - right */}
      <mesh position={[7, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color="#0f0f1e" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>
      
      {/* Central altar/terminal - base */}
      <mesh position={[0, -1, -3]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>
      
      {/* Central altar/terminal - screen */}
      <mesh position={[0, 0, -3]}>
        <boxGeometry args={[1.8, 1.2, 0.1]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          emissive="#00ffff" 
          emissiveIntensity={0.3} 
        />
      </mesh>
      
      {/* Altar glow orb */}
      <mesh position={[0, 1.5, -3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={1.5} 
        />
      </mesh>
    </>
  );
}

export default function CommitAltarScene() {
  const router = useRouter();
  const fixedRooms = useGameState((state) => state.fixedRooms);
  const allRoomsFixed = useGameState((state) => state.allRoomsFixed());
  const resetProgress = useGameState((state) => state.resetProgress);
  const [committed, setCommitted] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  
  const handleCommit = () => {
    if (!allRoomsFixed) return;
    
    // Trigger glitch effect
    setShowGlitch(true);
    setTimeout(() => {
      setShowGlitch(false);
      setCommitted(true);
    }, 500);
  };
  
  const handleReturn = () => {
    router.push('/');
  };
  
  const handleRestart = () => {
    resetProgress();
    setCommitted(false);
    router.push('/');
  };
  
  const roomNames = {
    loop: 'Infinite Loop',
    nullCandles: 'Null Candles',
    door404: '404 Door',
    leak: 'Memory Leak',
    mirror: 'Mirror Sync',
  };
  
  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 1, 5]} cameraFov={60}>
        <AltarContent />
      </Scene3D>
      
      {/* Glitch overlay effect */}
      {showGlitch && (
        <div className="absolute inset-0 bg-cyan-500 opacity-50 animate-pulse z-20" />
      )}
      
      {/* UI Overlay */}
      {!committed ? (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          <div className="pointer-events-auto bg-gray-900/95 border-2 border-cyan-400 p-8 rounded-lg shadow-2xl max-w-lg">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4 text-center font-mono">
              All bugs resolved. Commit fixes?
            </h1>
            
            {/* Checkmarks for fixed rooms */}
            <div className="mb-6 space-y-2">
              {Object.entries(fixedRooms).map(([roomId, isFixed]) => (
                <div key={roomId} className="flex items-center justify-between text-lg font-mono">
                  <span className="text-gray-300">
                    {roomNames[roomId as keyof typeof roomNames]}
                  </span>
                  <span className={isFixed ? 'text-green-400' : 'text-red-400'}>
                    {isFixed ? '✓ Fixed' : '✗ Not Fixed'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                label={allRoomsFixed ? 'Commit' : 'Commit (Incomplete)'}
                onClick={handleCommit}
                variant={allRoomsFixed ? 'primary' : 'secondary'}
              />
              <Button
                label="Return to Hallway"
                onClick={handleReturn}
                variant="secondary"
              />
            </div>
            
            {!allRoomsFixed && (
              <p className="text-sm text-yellow-400 mt-4 text-center font-mono">
                Complete all rooms before committing
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          <div className="pointer-events-auto bg-gray-900/95 border-2 border-green-400 p-8 rounded-lg shadow-2xl max-w-lg">
            <h1 className="text-4xl font-bold text-green-400 mb-4 text-center font-mono">
              Commit successful
            </h1>
            <p className="text-2xl text-cyan-400 mb-6 text-center font-mono">
              Haunted codebase stabilized
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button
                label="Return to Hallway"
                onClick={handleReturn}
                variant="primary"
              />
              <Button
                label="Restart"
                onClick={handleRestart}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
