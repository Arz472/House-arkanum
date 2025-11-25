'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import HUD from '@/components/ui/HUD';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';

interface Candle {
  id: string;
  position: [number, number, number];
  isLit: boolean;
}

interface CandleProps {
  candle: Candle;
}

function CandleObject({ candle }: CandleProps) {
  return (
    <group position={candle.position}>
      {/* Candle body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
      </mesh>
      
      {/* Wick/flame area */}
      {candle.isLit ? (
        <>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#ff8800"
              emissive="#ff8800"
              emissiveIntensity={2}
            />
          </mesh>
          <pointLight position={[0, 0.7, 0]} intensity={1.5} distance={3} color="#ff8800" />
        </>
      ) : (
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 4]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      )}
    </group>
  );
}

interface NullCandlesRoomContentProps {
  onSuccess: () => void;
  onCandleCountChange: (lit: number, total: number) => void;
}

interface FlameOrbProps {
  position: THREE.Vector3;
  onDrag: (position: THREE.Vector3) => void;
}

function FlameOrb({ position, onDrag }: FlameOrbProps) {
  const orbRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  // Handle scroll wheel for Z-axis movement
  useState(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isDragging) {
        e.preventDefault();
        const newPos = position.clone();
        // Move forward/backward based on scroll
        newPos.z += e.deltaY * 0.01;
        // Constrain to room bounds
        newPos.z = Math.max(-6, Math.min(6, newPos.z));
        onDrag(newPos);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  });

  useFrame(({ camera, pointer }) => {
    if (isDragging && orbRef.current) {
      // Cast ray from camera through mouse position
      raycaster.current.setFromCamera(pointer, camera);
      
      // Use horizontal plane (XZ plane) at current orb height
      planeRef.current.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0),
        position
      );
      
      raycaster.current.ray.intersectPlane(planeRef.current, intersectionPoint.current);
      
      if (intersectionPoint.current) {
        // Constrain to room bounds
        const newPos = intersectionPoint.current.clone();
        newPos.x = Math.max(-6, Math.min(6, newPos.x));
        newPos.y = Math.max(-1, Math.min(4, newPos.y));
        newPos.z = Math.max(-6, Math.min(6, newPos.z));
        
        onDrag(newPos);
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

  return (
    <mesh
      ref={orbRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial
        color="#ffaa00"
        emissive="#ffaa00"
        emissiveIntensity={3}
      />
      <pointLight intensity={2} distance={4} color="#ffaa00" />
    </mesh>
  );
}

function CameraController() {
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useState(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });

  useFrame(({ camera }) => {
    // Calculate target rotation based on mouse position
    targetRotation.current.y = mousePos.current.x * 0.1;
    targetRotation.current.x = mousePos.current.y * 0.05;

    // Smoothly interpolate camera rotation
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.05;
    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.05;
  });

  return null;
}

function NullCandlesRoomContent({ onSuccess, onCandleCountChange }: NullCandlesRoomContentProps) {
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  
  // Initialize candles - some lit, some unlit
  const [candles, setCandles] = useState<Candle[]>([
    { id: 'c1', position: [-3, -1.4, -3], isLit: true },
    { id: 'c2', position: [-1.5, -1.4, -4], isLit: false },
    { id: 'c3', position: [0, -1.4, -3.5], isLit: false },
    { id: 'c4', position: [1.5, -1.4, -4], isLit: true },
    { id: 'c5', position: [3, -1.4, -3], isLit: false },
    { id: 'c6', position: [-2, -1.4, 2], isLit: false },
    { id: 'c7', position: [2, -1.4, 2], isLit: false },
  ]);

  const [flamePosition, setFlamePosition] = useState(new THREE.Vector3(0, 0, 0));
  const LIGHTING_THRESHOLD = 1.5; // Distance threshold for lighting candles

  const handleFlameDrag = (newPosition: THREE.Vector3) => {
    setFlamePosition(newPosition);
  };

  // Check proximity and light candles
  useFrame(() => {
    setCandles((currentCandles) => {
      let updated = false;
      const newCandles = currentCandles.map((candle) => {
        if (!candle.isLit) {
          const candlePos = new THREE.Vector3(...candle.position);
          const distance = flamePosition.distanceTo(candlePos);
          
          if (distance < LIGHTING_THRESHOLD) {
            updated = true;
            return { ...candle, isLit: true };
          }
        }
        return candle;
      });
      
      // Update candle count
      const litCount = newCandles.filter(c => c.isLit).length;
      onCandleCountChange(litCount, newCandles.length);
      
      // Check if all candles are lit
      if (litCount === newCandles.length) {
        markRoomFixed('nullCandles');
        onSuccess();
      }
      
      return updated ? newCandles : currentCandles;
    });
  });

  return (
    <>
      {/* Camera parallax controller */}
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />

      {/* Candles */}
      {candles.map((candle) => (
        <CandleObject key={candle.id} candle={candle} />
      ))}

      {/* Draggable flame orb */}
      <FlameOrb position={flamePosition} onDrag={handleFlameDrag} />

      {/* Room geometry */}
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#3a2f2f" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial color="#4a3a3a" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7.5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#4a3a3a" roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[7.5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#4a3a3a" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#2a2020" roughness={0.9} />
      </mesh>
    </>
  );
}

export default function NullCandlesRoomScene() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 2, 8]} cameraFov={75}>
        <color attach="background" args={['#1a1515']} />
        <NullCandlesRoomContent 
          onSuccess={() => setShowSuccess(true)}
          onCandleCountChange={(lit, total) => {
            setLitCount(lit);
            setTotalCount(total);
          }}
        />
      </Scene3D>

      {/* Candle count HUD */}
      {!showSuccess && (
        <>
          <div className="absolute top-4 left-4">
            <HUD label="Candles lit" current={litCount} total={totalCount} />
          </div>
          <div className="absolute bottom-4 left-4 text-white text-sm font-mono bg-black bg-opacity-50 p-3 rounded">
            <div className="mb-1">🔥 Drag the flame orb to light candles</div>
            <div>🖱️ Scroll wheel to move forward/backward</div>
          </div>
        </>
      )}

      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="Null references resolved">
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
