'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';

interface GCOrb {
  id: string;
  position: [number, number, number];
}

interface MonsterProps {
  scale: number;
}

function Monster({ scale }: MonsterProps) {
  const monsterRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={monsterRef} position={[0, 0, 0]} scale={[scale, scale, scale]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.5} />
    </mesh>
  );
}

interface GCOrbComponentProps {
  orb: GCOrb;
  onClick: (id: string) => void;
}

function GCOrbComponent({ orb, onClick }: GCOrbComponentProps) {
  return (
    <mesh position={orb.position} onClick={() => onClick(orb.id)}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.5} />
    </mesh>
  );
}

interface MemoryLeakRoomContentProps {
  onSuccess: () => void;
  orbs: GCOrb[];
  setOrbs: (orbs: GCOrb[]) => void;
  scaleRef: React.MutableRefObject<number>;
  setMonsterScale: (scale: number) => void;
}

function MemoryLeakRoomContent({ onSuccess, orbs, setOrbs, scaleRef, setMonsterScale }: MemoryLeakRoomContentProps) {
  const growthRate = 0.1; // Scale increase per second
  const spawnInterval = 2.0; // Spawn orb every 2 seconds
  const maxOrbs = 5;
  const safeScale = 1.2; // Safe range threshold
  const lastSpawnTime = useRef(0);
  const hasTriggeredSuccess = useRef(false);
  const hasGrown = useRef(false); // Track if monster has grown past safe threshold
  const markRoomFixed = useGameState((state) => state.markRoomFixed);

  useFrame((state, delta) => {
    // Gradually increase monster scale over time using ref
    scaleRef.current = scaleRef.current + growthRate * delta;
    setMonsterScale(scaleRef.current);

    // Track if monster has grown past safe threshold
    if (scaleRef.current > safeScale) {
      hasGrown.current = true;
    }

    // Check for success condition - only trigger if monster has grown and then returned to safe range
    if (scaleRef.current <= safeScale && hasGrown.current && !hasTriggeredSuccess.current) {
      hasTriggeredSuccess.current = true;
      markRoomFixed('leak');
      onSuccess();
    }

    // Spawn orbs at intervals if under max limit
    const currentTime = state.clock.getElapsedTime();
    if (currentTime - lastSpawnTime.current >= spawnInterval && orbs.length < maxOrbs) {
      lastSpawnTime.current = currentTime;
      
      // Generate random position around monster - more spread out
      const angle = Math.random() * Math.PI * 2;
      const distance = 3 + Math.random() * 2.5; // Increased from 2-3 to 3-5.5
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = -1 + Math.random() * 3; // Increased vertical spread from 2 to 3
      
      const newOrb: GCOrb = {
        id: `orb-${Date.now()}-${Math.random()}`,
        position: [x, y, z],
      };
      
      setOrbs([...orbs, newOrb]);
    }
  });

  const handleOrbClick = (orbId: string) => {
    // Remove the clicked orb
    setOrbs(orbs.filter(orb => orb.id !== orbId));
    
    // Reduce monster scale using ref
    const shrinkAmount = 0.3;
    scaleRef.current = Math.max(0.5, scaleRef.current - shrinkAmount);
    setMonsterScale(scaleRef.current);
  };

  return (
    <>
      {/* Camera controls - allow player to orbit around the room */}
      <OrbitControls 
        enablePan={false}
        minDistance={5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />

      {/* Monster */}
      <Monster scale={scaleRef.current} />

      {/* GC Orbs */}
      {orbs.map(orb => (
        <GCOrbComponent key={orb.id} orb={orb} onClick={handleOrbClick} />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color="#444444" />
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

interface MemoryBarProps {
  monsterScale: number;
}

function MemoryBar({ monsterScale }: MemoryBarProps) {
  // Calculate percentage based on scale (2.0 = 0%, 6.0 = 100%)
  const minScale = 2.0;
  const maxScale = 6.0;
  const percentage = Math.min(100, Math.max(0, ((monsterScale - minScale) / (maxScale - minScale)) * 100));
  
  return (
    <div className="absolute top-4 left-4 bg-black/80 border border-green-500 px-4 py-3 rounded z-20 w-64">
      <p className="text-green-500 font-mono font-bold mb-2">Memory Usage</p>
      <div className="w-full bg-gray-700 h-6 rounded overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-green-500 font-mono text-sm mt-1">{percentage.toFixed(1)}%</p>
    </div>
  );
}

export default function MemoryLeakRoomScene() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [monsterScale, setMonsterScale] = useState(2.0);
  const [orbs, setOrbs] = useState<GCOrb[]>([]);
  const scaleRef = useRef(2.0); // Start bigger so it's more visible and threatening
  const router = useRouter();

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 2, 8]} cameraFov={75}>
        <color attach="background" args={['#222222']} />
        <MemoryLeakRoomContent 
          onSuccess={() => setShowSuccess(true)} 
          orbs={orbs}
          setOrbs={setOrbs}
          scaleRef={scaleRef}
          setMonsterScale={setMonsterScale}
        />
      </Scene3D>

      {/* Memory usage HUD */}
      <MemoryBar monsterScale={monsterScale} />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 border border-green-500 px-4 py-2 rounded z-20">
        <p className="text-green-500 font-mono text-sm">
          Click green orbs to shrink the monster!
        </p>
        <p className="text-green-500 font-mono text-xs mt-1">
          Drag to rotate camera
        </p>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="Memory leak fixed">
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
