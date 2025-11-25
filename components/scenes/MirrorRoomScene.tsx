'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame, useThree } from '@react-three/fiber';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';

interface RealOrbProps {
  position: [number, number, number];
}

function RealOrb({ position }: RealOrbProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#00ffff" 
        emissiveIntensity={1.5}
      />
    </mesh>
  );
}

interface ReflectionOrbProps {
  position: [number, number, number];
}

function ReflectionOrb({ position }: ReflectionOrbProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color="#ff00ff" 
        emissive="#ff00ff" 
        emissiveIntensity={1.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

interface MirrorRoomContentProps {
  onSuccess: () => void;
  realOrbPosition: [number, number, number];
  setRealOrbPosition: (pos: [number, number, number]) => void;
  reflectionOrbPosition: [number, number, number];
  setReflectionOrbPosition: (pos: [number, number, number]) => void;
  syncTimerRef: React.MutableRefObject<number>;
}

function MirrorRoomContent({ 
  onSuccess, 
  realOrbPosition, 
  setRealOrbPosition,
  reflectionOrbPosition,
  setReflectionOrbPosition,
  syncTimerRef
}: MirrorRoomContentProps) {
  const { camera, size } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  const positionHistory = useRef<Array<[number, number, number]>>([]);
  const delayFrames = 30; // Delay the reflection by 30 frames (~0.5 seconds at 60fps)
  const syncThreshold = 0.5; // Distance threshold for considering orbs "synced"
  const syncDuration = 3.0; // Required sync duration in seconds
  const hasTriggeredSuccess = useRef(false);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (event.clientX / size.width) * 2 - 1;
      mousePos.current.y = -(event.clientY / size.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size]);

  useFrame((state, delta) => {
    // Convert mouse position to 3D world coordinates
    // Project mouse position onto a plane in front of the mirror
    const vector = new THREE.Vector3(mousePos.current.x, mousePos.current.y, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = (2 - camera.position.z) / dir.z; // Project onto z=2 plane
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Constrain to reasonable bounds
    const x = Math.max(-4, Math.min(4, pos.x));
    const y = Math.max(-1, Math.min(5, pos.y));
    
    const newPosition: [number, number, number] = [x, y, 2];
    setRealOrbPosition(newPosition);
    
    // Add current position to history
    positionHistory.current.push(newPosition);
    
    // Keep only the last delayFrames positions
    if (positionHistory.current.length > delayFrames) {
      positionHistory.current.shift();
    }
    
    // Set reflection position to delayed position with offset
    if (positionHistory.current.length > 0) {
      const delayedPos = positionHistory.current[0];
      // Apply offset to make it look "possessed" - slightly off
      const offsetX = delayedPos[0] + Math.sin(Date.now() * 0.001) * 0.5;
      const offsetY = delayedPos[1] + Math.cos(Date.now() * 0.0015) * 0.3;
      setReflectionOrbPosition([offsetX, offsetY, -4]); // Behind mirror plane
      
      // Calculate distance between real and reflection orbs (in 2D, ignoring Z)
      const dx = realOrbPosition[0] - offsetX;
      const dy = realOrbPosition[1] - offsetY;
      const distance2D = Math.sqrt(dx * dx + dy * dy);
      
      // Check if orbs are synced
      if (distance2D < syncThreshold) {
        syncTimerRef.current += delta;
        
        // Check if synced for required duration
        if (syncTimerRef.current >= syncDuration && !hasTriggeredSuccess.current) {
          hasTriggeredSuccess.current = true;
          markRoomFixed('mirror');
          onSuccess();
        }
      } else {
        // Reset timer if orbs move apart
        syncTimerRef.current = 0;
      }
    }
  });

  return (
    <>
      {/* Real orb that follows mouse */}
      <RealOrb position={realOrbPosition} />
      
      {/* Reflection orb with delay and offset */}
      <ReflectionOrb position={reflectionOrbPosition} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Back wall with mirror */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Mirror plane - reflective surface */}
      <mesh position={[0, 2, -6.9]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#88ccff" 
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Mirror frame - top */}
      <mesh position={[0, 5.2, -6.8]}>
        <boxGeometry args={[10.4, 0.4, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Mirror frame - bottom */}
      <mesh position={[0, -1.2, -6.8]}>
        <boxGeometry args={[10.4, 0.4, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Mirror frame - left */}
      <mesh position={[-5.2, 2, -6.8]}>
        <boxGeometry args={[0.4, 6.8, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Mirror frame - right */}
      <mesh position={[5.2, 2, -6.8]}>
        <boxGeometry args={[0.4, 6.8, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7.5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Right wall */}
      <mesh position={[7.5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </>
  );
}

interface SyncProgressProps {
  syncTimer: number;
  syncDuration: number;
}

function SyncProgress({ syncTimer, syncDuration }: SyncProgressProps) {
  const percentage = Math.min(100, (syncTimer / syncDuration) * 100);
  
  return (
    <div className="absolute top-4 left-4 bg-black/80 border border-purple-500 px-4 py-3 rounded z-20 w-64">
      <p className="text-purple-500 font-mono font-bold mb-2">Sync Progress</p>
      <div className="w-full bg-gray-700 h-6 rounded overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-purple-500 font-mono text-sm mt-1">{percentage.toFixed(1)}%</p>
    </div>
  );
}

export default function MirrorRoomScene() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [realOrbPosition, setRealOrbPosition] = useState<[number, number, number]>([0, 2, 2]);
  const [reflectionOrbPosition, setReflectionOrbPosition] = useState<[number, number, number]>([0, 2, -4]);
  const [syncTimer, setSyncTimer] = useState(0);
  const syncTimerRef = useRef(0);
  const router = useRouter();

  const handleReturnToHallway = () => {
    router.push('/');
  };

  // Update sync timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTimer(syncTimerRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 2, 8]} cameraFov={75}>
        <color attach="background" args={['#222222']} />
        <MirrorRoomContent 
          onSuccess={() => setShowSuccess(true)} 
          realOrbPosition={realOrbPosition}
          setRealOrbPosition={setRealOrbPosition}
          reflectionOrbPosition={reflectionOrbPosition}
          setReflectionOrbPosition={setReflectionOrbPosition}
          syncTimerRef={syncTimerRef}
        />
      </Scene3D>

      {/* Sync progress HUD */}
      <SyncProgress syncTimer={syncTimer} syncDuration={3.0} />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 border border-purple-500 px-4 py-2 rounded z-20">
        <p className="text-purple-500 font-mono text-sm">
          Align the cyan orb with the magenta reflection!
        </p>
        <p className="text-purple-500 font-mono text-xs mt-1">
          Hold them together for 3 seconds
        </p>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="UI and DOM back in sync">
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
