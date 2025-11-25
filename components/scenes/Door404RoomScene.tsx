'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import { sharedResources } from '@/lib/sharedGeometry';
import * as THREE from 'three';

interface Rune {
  id: string;
  symbol: string;
  position: number; // position along x-axis track
  correctPosition: number;
}

interface RuneObjectProps {
  rune: Rune;
  onDrag: (id: string, newPosition: number) => void;
}

function RuneObject({ rune, onDrag }: RuneObjectProps) {
  const runeRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const raycaster = useRef(new THREE.Raycaster());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 2));
  const intersectionPoint = useRef(new THREE.Vector3());
  const runeMaterial = useRef(new THREE.MeshStandardMaterial({
    color: '#666666',
    emissive: '#000000',
    emissiveIntensity: 0
  }));
  
  // Cleanup material on unmount
  useEffect(() => {
    return () => {
      runeMaterial.current.dispose();
    };
  }, []);

  const MIN_X = -3;
  const MAX_X = 3;

  useFrame(({ camera, pointer }) => {
    if (isDragging && runeRef.current) {
      // Cast ray from camera through mouse position
      raycaster.current.setFromCamera(pointer, camera);
      
      // Intersect with vertical plane at z=2
      raycaster.current.ray.intersectPlane(planeRef.current, intersectionPoint.current);
      
      if (intersectionPoint.current) {
        // Constrain to horizontal track
        const newX = Math.max(MIN_X, Math.min(MAX_X, intersectionPoint.current.x));
        onDrag(rune.id, newX);
      }
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: any) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Update material based on hover/drag state
  useFrame(() => {
    if (runeMaterial.current) {
      if (hovered || isDragging) {
        runeMaterial.current.color.setHex(0x88ff88);
        runeMaterial.current.emissive.setHex(0x44ff44);
        runeMaterial.current.emissiveIntensity = 0.5;
      } else {
        runeMaterial.current.color.setHex(0x666666);
        runeMaterial.current.emissive.setHex(0x000000);
        runeMaterial.current.emissiveIntensity = 0;
      }
    }
  });
  
  return (
    <group ref={runeRef} position={[rune.position, -0.5, 2]}>
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        geometry={sharedResources.runeGeometry}
        material={runeMaterial.current}
      />
      
      {/* Symbol on rune */}
      <Text
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {rune.symbol}
      </Text>
    </group>
  );
}

interface DoorProps {
  isOpen: boolean;
}

function DoorObject({ isOpen }: DoorProps) {
  const doorRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (doorRef.current) {
      const targetRotation = isOpen ? -Math.PI / 2 : 0;
      doorRef.current.rotation.y += (targetRotation - doorRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={doorRef} position={[0, 0, -8]}>
      <mesh position={[0.75, 1, 0]}>
        <boxGeometry args={[1.5, 2.5, 0.2]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface GlitchTextProps {
  text: string;
  position: [number, number, number];
}

function GlitchText({ text, position }: GlitchTextProps) {
  const textRef = useRef<any>(null);

  useFrame((state) => {
    if (textRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Subtle glitch animation
      const glitchScale = 1 + Math.sin(time * 10) * 0.05;
      const glitchOffset = Math.sin(time * 20) * 0.02;
      
      textRef.current.scale.set(glitchScale, glitchScale, glitchScale);
      textRef.current.position.x = position[0] + glitchOffset;
      
      // Flicker effect
      const flicker = Math.sin(time * 30) > 0.9 ? 0.5 : 1;
      if (textRef.current.material) {
        textRef.current.material.opacity = flicker;
      }
    }
  });

  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={0.8}
      color="#ff0000"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {text}
    </Text>
  );
}

function CameraController() {
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useState(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });

  useFrame(({ camera }) => {
    // Negate x to fix left/right inversion - mouse right = camera right
    targetRotation.current.y = -mousePos.current.x * 0.08;
    targetRotation.current.x = mousePos.current.y * 0.05;

    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.05;
    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.05;
  });

  return null;
}

interface Door404RoomContentProps {
  onSuccess: () => void;
}

function Door404RoomContent({ onSuccess }: Door404RoomContentProps) {
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  
  // Define correct order: symbols should be arranged as 1, 2, 3 from left to right
  const [runes, setRunes] = useState<Rune[]>([
    { id: 'r1', symbol: '2', position: -2, correctPosition: 0 },
    { id: 'r2', symbol: '1', position: 0, correctPosition: -2 },
    { id: 'r3', symbol: '3', position: 2, correctPosition: 2 },
  ]);

  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);

  const handleRuneDrag = (id: string, newPosition: number) => {
    setRunes((currentRunes) =>
      currentRunes.map((rune) =>
        rune.id === id ? { ...rune, position: newPosition } : rune
      )
    );
  };

  // Check if runes are in correct order - throttled for performance
  const frameCount = useRef(0);
  useFrame(() => {
    // Throttle validation checks to every 5th frame for performance
    frameCount.current++;
    if (frameCount.current % 5 !== 0) return;
    
    if (!isDoorOpen && !hasTriggeredSuccess) {
      const POSITION_TOLERANCE = 0.5;
      
      const isCorrect = runes.every((rune) => {
        return Math.abs(rune.position - rune.correctPosition) < POSITION_TOLERANCE;
      });

      if (isCorrect) {
        setIsDoorOpen(true);
        setHasTriggeredSuccess(true);
        setTimeout(() => {
          markRoomFixed('door404');
          onSuccess();
        }, 1000);
      }
    }
  });

  return (
    <>
      {/* Camera parallax controller */}
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Door */}
      <DoorObject isOpen={isDoorOpen} />

      {/* Door frame */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[2, 3, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* 404 glitch text above door */}
      <GlitchText text="404" position={[0, 3, -7.8]} />

      {/* Runes */}
      {runes.map((rune) => (
        <RuneObject key={rune.id} rune={rune} onDrag={handleRuneDrag} />
      ))}

      {/* Track indicator */}
      <mesh position={[0, -0.6, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 0.1]} />
        <meshStandardMaterial color="#444444" emissive="#222222" emissiveIntensity={0.3} />
      </mesh>

      {/* Room geometry - corridor */}
      {/* Floor */}
      <mesh position={[0, -2, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 15]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 15]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-5, 1, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[5, 1, -3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {/* Back wall behind door */}
      <mesh position={[0, 1, -10]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
    </>
  );
}

export default function Door404RoomScene() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 1, 8]} cameraFov={75}>
        <color attach="background" args={['#1a1a1a']} />
        <Door404RoomContent onSuccess={() => setShowSuccess(true)} />
      </Scene3D>

      {/* Instructions */}
      {!showSuccess && (
        <div className="absolute bottom-4 left-4 text-white text-sm font-mono bg-black bg-opacity-50 p-3 rounded">
          <div className="mb-1">🔢 Drag the runes to arrange them in order: 1, 2, 3</div>
          <div>🚪 The door will open when the sequence is correct</div>
        </div>
      )}

      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="Routes restored">
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
