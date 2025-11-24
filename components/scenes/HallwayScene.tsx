'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame, useThree } from '@react-three/fiber';
import Scene3D from '@/components/Scene3D';
import { RoomId, useGameState } from '@/store/gameState';
import * as THREE from 'three';

interface DoorConfig {
  id: RoomId;
  position: [number, number, number];
  color: string;
  label: string;
}

const DOORS: DoorConfig[] = [
  { id: 'loop', position: [-3, 1, -8], color: '#ff6b6b', label: 'Loop' },
  { id: 'nullCandles', position: [-1.5, 1, -12], color: '#ffd93d', label: 'Null' },
  { id: 'door404', position: [0, 1, -16], color: '#6bcf7f', label: '404' },
  { id: 'leak', position: [1.5, 1, -20], color: '#4d96ff', label: 'Leak' },
  { id: 'mirror', position: [3, 1, -24], color: '#c77dff', label: 'Mirror' },
];

interface DoorProps {
  config: DoorConfig;
  onClick: () => void;
  isFixed: boolean;
}

function Door({ config, onClick, isFixed }: DoorProps) {
  const [hovered, setHovered] = useState(false);
  
  const scale = hovered ? 1.1 : 1;
  const emissiveIntensity = hovered ? 0.8 : 0.5;
  
  return (
    <group position={config.position} scale={scale}>
      {/* Door frame */}
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[1.5, 2.5, 0.2]} />
        <meshStandardMaterial 
          color={config.color}
          emissive={config.color}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Label above door */}
      <mesh position={[0, 1.5, 0.15]}>
        <boxGeometry args={[1.2, 0.3, 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={config.color} 
          emissiveIntensity={emissiveIntensity} 
        />
      </mesh>
      
      {/* Fixed indicator - checkmark */}
      {isFixed && (
        <mesh position={[0, -0.5, 0.15]}>
          <boxGeometry args={[0.4, 0.4, 0.05]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00" 
            emissiveIntensity={1} 
          />
        </mesh>
      )}
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  
  // Track mouse position
  useState(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });
  
  // Apply smooth camera rotation based on mouse position
  useFrame(() => {
    // Calculate target rotation based on mouse position
    targetRotation.current.y = mousePos.current.x * 0.1;
    targetRotation.current.x = mousePos.current.y * 0.05;
    
    // Smoothly interpolate camera rotation
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.05;
    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.05;
  });
  
  return null;
}

function HallwayContent() {
  const router = useRouter();
  const fixedRooms = useGameState((state) => state.fixedRooms);
  
  const handleDoorClick = (roomId: RoomId) => {
    router.push(`/room/${roomId === 'nullCandles' ? 'null-candles' : roomId === 'door404' ? '404' : roomId}`);
  };
  
  return (
    <>
      {/* Camera controller for parallax */}
      <CameraController />
      
      {/* Ambient light */}
      <ambientLight intensity={0.2} />
      
      {/* Directional light */}
      <directionalLight position={[0, 5, 5]} intensity={0.3} />
      
      {/* Fog */}
      <fog attach="fog" args={['#1a1a2e', 10, 35]} />
      
      {/* Floor */}
      <mesh position={[0, -2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 30]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 4, -10]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 30]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-5, 1, -10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[5, 1, -10]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, 1, -25]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Doors */}
      {DOORS.map((door) => (
        <Door 
          key={door.id} 
          config={door} 
          onClick={() => handleDoorClick(door.id)}
          isFixed={fixedRooms[door.id]}
        />
      ))}
    </>
  );
}

export default function HallwayScene() {
  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 1, 8]} cameraFov={75}>
        <HallwayContent />
      </Scene3D>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-8 z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-cyan-400 font-mono">
            House Arkanum: Haunted Codebase
          </h1>
          <p className="text-xl text-gray-300 font-mono">Choose a bug to fix</p>
        </div>
      </div>
    </div>
  );
}
