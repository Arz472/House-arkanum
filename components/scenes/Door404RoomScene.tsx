'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import Scene3D from '@/components/Scene3D';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Scene 1: Graduation Party (Z: 0)
function GraduationParty({ onBookClick }: { onBookClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#e8d5b7" />
      </mesh>
      <mesh position={[0, 1, -7.9]}>
        <ringGeometry args={[2, 2.2, 32]} />
        <meshStandardMaterial color="#2c5aa0" emissive="#2c5aa0" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-3, 3, -5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[3, 3, -5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffe66d" />
      </mesh>
      <mesh position={[0, 0, -3]}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, 0.3, -3]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
        <meshStandardMaterial color="#fff5e1" />
      </mesh>
      {/* Medical Book - Blue - GIANT TEST SPHERE */}
      <mesh 
        position={[-2, 1, 0]}
        onClick={onBookClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#0000ff" 
          emissive="#0000ff" 
          emissiveIntensity={hovered ? 5 : 3}
        />
      </mesh>
    </group>
  );
}

// Scene 2: Soccer Game (Z: -20)
function SoccerGame() {
  return (
    <group position={[0, 0, -20]}>
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      <mesh position={[0, 1, -7.9]}>
        <ringGeometry args={[2, 2.2, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, -7]}>
        <boxGeometry args={[6, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.5, -2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Medical Book - Blue - SOCCER */}
      <group position={[3, 0.3, 5]} rotation={[0, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.4, 2]} />
          <meshStandardMaterial 
            color="#0000ff" 
            emissive="#0066ff" 
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <boxGeometry args={[1.4, 0.05, 1.9]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
    </group>
  );
}

// Scene 3: School (Z: -40)
function School() {
  return (
    <group position={[0, 0, -40]}>
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      <mesh position={[0, 1, -7.9]}>
        <ringGeometry args={[2, 2.2, 32]} />
        <meshStandardMaterial color="#2f4f2f" emissive="#2f4f2f" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 2, -7.8]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#2f4f2f" />
      </mesh>
      <mesh position={[-2, -0.5, -2]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[2, -0.5, -2]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Medical Book - Blue - SCHOOL */}
      <group position={[-3, 0.3, 5]} rotation={[0, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.4, 2]} />
          <meshStandardMaterial 
            color="#0000ff" 
            emissive="#0066ff" 
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <boxGeometry args={[1.4, 0.05, 1.9]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
    </group>
  );
}

// Scene 4: Birthday Party (Z: -60)
function BirthdayParty() {
  return (
    <group position={[0, 0, -60]}>
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
      <mesh position={[0, 1, -7.9]}>
        <ringGeometry args={[2, 2.2, 32]} />
        <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-3, 3, -5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[3, 3, -5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
      <mesh position={[0, 0.3, -3]}>
        <cylinderGeometry args={[0.7, 0.7, 0.6, 16]} />
        <meshStandardMaterial color="#fff5e1" />
      </mesh>
      <mesh position={[0, 1.2, -3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// Scene 5: Hospital (Z: -80)
function Hospital() {
  return (
    <group position={[0, 0, -80]}>
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.3, -3]}>
        <boxGeometry args={[2, 0.3, 3]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[2, 0.5, -2]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      <mesh position={[-2, 0, -2]}>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>
      {/* Medical Book - Blue - HOSPITAL */}
      <group position={[0, 0.3, 5]} rotation={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.4, 2]} />
          <meshStandardMaterial 
            color="#0000ff" 
            emissive="#0066ff" 
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <boxGeometry args={[1.4, 0.05, 1.9]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
    </group>
  );
}

function ForwardScrollContent({ scrollZ, onBookClick }: { scrollZ: number; onBookClick: () => void }) {
  useFrame((state) => {
    const camera = state.camera;
    camera.position.z += (scrollZ - camera.position.z) * 0.1;
  });
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, scrollZ + 5]} intensity={1.2} color="#ffcc88" />
      <directionalLight position={[5, 5, scrollZ + 10]} intensity={0.6} />
      
      <GraduationParty onBookClick={onBookClick} />
      <SoccerGame />
      <School />
      <BirthdayParty />
      <Hospital />
    </>
  );
}

import PauseMenu from '@/components/ui/PauseMenu';
import { usePauseMenu } from '@/lib/usePauseMenu';

export default function Door404RoomScene() {
  const router = useRouter();
  const [scrollZ, setScrollZ] = useState(5);
  const [showBookMessage, setShowBookMessage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPaused, closePause } = usePauseMenu();
  
  const MIN_Z = 5;
  const MAX_Z = -75;
  
  const handleBookClick = () => {
    setShowBookMessage(true);
    setTimeout(() => setShowBookMessage(false), 3000);
  };
  
  const getCurrentScene = () => {
    if (scrollZ > -5) return 0;
    if (scrollZ > -25) return 1;
    if (scrollZ > -45) return 2;
    if (scrollZ > -65) return 3;
    return 4;
  };
  
  const currentScene = getCurrentScene();
  const sceneNames = ['Graduation Party', 'Soccer Game', 'School', 'Birthday Party', 'Hospital'];
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollZ(prev => clamp(prev - e.deltaY * 0.02, MAX_Z, MIN_Z));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen relative">
      {/* Pause Menu */}
      <PauseMenu isOpen={isPaused} onClose={closePause} roomName="404 Room" />
      
      <Scene3D cameraPosition={[0, 1, 5]} cameraFov={75}>
        <color attach="background" args={['#1a1a1a']} />
        <fog attach="fog" args={['#1a1a1a', 5, 25]} />
        <ForwardScrollContent scrollZ={scrollZ} onBookClick={handleBookClick} />
      </Scene3D>
      
      {showBookMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-900 bg-opacity-90 text-white p-6 rounded-lg text-center max-w-md">
          <div className="text-xl font-bold mb-2">Medical Record</div>
          <div className="text-sm">Patient admitted: [DATE]</div>
          <div className="text-sm">Status: Comatose</div>
        </div>
      )}

      <div className="absolute top-4 left-4 text-white text-sm font-mono bg-black bg-opacity-70 p-3 rounded">
        <div>Scene {currentScene + 1}/5: {sceneNames[currentScene]}</div>
        <div className="mt-1">🖱️ Scroll to move forward</div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((MIN_Z - scrollZ) / (MIN_Z - MAX_Z)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
