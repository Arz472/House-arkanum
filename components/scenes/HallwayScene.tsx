'use client';

import { useState, useRef, useEffect } from 'react';
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

// 3 doors on right wall, 2 doors on left wall, 1 altar door at end
const DOORS: DoorConfig[] = [
  { id: 'loop', position: [4, 1, -5], color: '#ff6b6b', label: 'Loop' },
  { id: 'nullCandles', position: [-4, 1, -8], color: '#ffd93d', label: 'Null' },
  { id: 'door404', position: [4, 1, -11], color: '#6bcf7f', label: '404' },
  { id: 'leak', position: [-4, 1, -14], color: '#4d96ff', label: 'Leak' },
  { id: 'mirror', position: [4, 1, -17], color: '#c77dff', label: 'Mirror' },
];

const ALTAR_DOOR_POSITION: [number, number, number] = [0, 1, -21];

interface DoorProps {
  config: DoorConfig;
  onClick: () => void;
  isFixed: boolean;
}

interface AltarDoorProps {
  onClick: () => void;
}

function Door({ config, onClick, isFixed }: DoorProps) {
  const [hovered, setHovered] = useState(false);
  
  const scale = hovered ? 1.1 : 1;
  const emissiveIntensity = hovered ? 0.8 : 0.5;
  
  // Determine rotation based on which wall (left wall faces right, right wall faces left)
  const rotation: [number, number, number] = config.position[0] > 0 
    ? [0, -Math.PI / 2, 0]  // Right wall - face left
    : [0, Math.PI / 2, 0];   // Left wall - face right
  
  return (
    <group position={config.position} scale={scale} rotation={rotation}>
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

function AltarDoor({ onClick }: AltarDoorProps) {
  const [hovered, setHovered] = useState(false);
  
  const scale = hovered ? 1.1 : 1;
  
  return (
    <group position={ALTAR_DOOR_POSITION} scale={scale} rotation={[0, 0, 0]}>
      {/* Door frame - golden/mystical - larger and more impressive */}
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[2.5, 3.5, 0.2]} />
        <meshStandardMaterial 
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={hovered ? 0.5 : 0.3}
        />
      </mesh>
      
      {/* Label above door */}
      <mesh position={[0, 2.0, 0.15]}>
        <boxGeometry args={[2.0, 0.4, 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffd700" 
          emissiveIntensity={1} 
        />
      </mesh>
      
      {/* Altar symbol - larger */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={1.5} 
        />
      </mesh>
      
      {/* Additional mystical elements - side pillars */}
      <mesh position={[-1.5, 0, 0.1]}>
        <boxGeometry args={[0.3, 3.5, 0.1]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.5} 
        />
      </mesh>
      <mesh position={[1.5, 0, 0.1]}>
        <boxGeometry args={[0.3, 3.5, 0.1]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.5} 
        />
      </mesh>
    </group>
  );
}

interface CameraControllerProps {
  isWalking: boolean;
  isWalkingBack: boolean;
  isWalkingToAltar: boolean;
  targetPosition: [number, number, number] | null;
  targetDoorPosition: [number, number, number] | null;
  onWalkComplete: () => void;
  onWalkBackComplete: () => void;
}

function CameraController({ isWalking, isWalkingBack, isWalkingToAltar, targetPosition, targetDoorPosition, onWalkComplete, onWalkBackComplete }: CameraControllerProps) {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const walkProgress = useRef(0);
  const initialPosition = useRef<THREE.Vector3 | null>(null);
  const initialRotation = useRef<THREE.Euler | null>(null);
  const STARTING_POSITION: [number, number, number] = [0, 1, 3];
  
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
  
  // Apply smooth camera rotation based on mouse position or walking animation
  useFrame((_state, delta) => {
    if (isWalkingBack) {
      // Walk back to starting position
      if (walkProgress.current === 0) {
        initialPosition.current = camera.position.clone();
        initialRotation.current = camera.rotation.clone();
      }
      
      walkProgress.current += delta * 0.5; // Slower walk back animation
      const t = Math.min(walkProgress.current, 1);
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      if (initialPosition.current && initialRotation.current) {
        // Interpolate back to starting position
        camera.position.x = THREE.MathUtils.lerp(initialPosition.current.x, STARTING_POSITION[0], easeT);
        camera.position.y = THREE.MathUtils.lerp(initialPosition.current.y, STARTING_POSITION[1], easeT);
        camera.position.z = THREE.MathUtils.lerp(initialPosition.current.z, STARTING_POSITION[2], easeT);
        
        // Look down while walking back (positive rotation.x looks down)
        const lookDownAngle = Math.sin(easeT * Math.PI) * 0.4;
        camera.rotation.x = lookDownAngle;
        camera.rotation.y = THREE.MathUtils.lerp(initialRotation.current.y, 0, easeT);
      }
      
      if (walkProgress.current >= 1) {
        walkProgress.current = 0;
        initialPosition.current = null;
        initialRotation.current = null;
        onWalkBackComplete();
      }
    } else if (isWalking && targetPosition && targetDoorPosition) {
      // Store initial position and rotation when walk starts
      if (walkProgress.current === 0) {
        initialPosition.current = camera.position.clone();
        initialRotation.current = camera.rotation.clone();
      }
      
      // Increment walk progress
      walkProgress.current += delta * 0.5; // Slower walk animation
      
      const t = Math.min(walkProgress.current, 1);
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out
      
      if (initialPosition.current && initialRotation.current) {
        // Interpolate position
        camera.position.x = THREE.MathUtils.lerp(initialPosition.current.x, targetPosition[0], easeT);
        camera.position.y = THREE.MathUtils.lerp(initialPosition.current.y, targetPosition[1], easeT);
        camera.position.z = THREE.MathUtils.lerp(initialPosition.current.z, targetPosition[2], easeT);
        
        // Calculate the direction vector from camera to door
        const dx = targetDoorPosition[0] - camera.position.x;
        const dy = targetDoorPosition[1] - camera.position.y;
        const dz = targetDoorPosition[2] - camera.position.z;
        
        // Calculate the target rotation to face the door
        // Negate dx to fix the left/right inversion
        const targetYRotation = Math.atan2(-dx, dz);
        
        // Calculate the vertical angle (pitch) to look at the door
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
        const targetXRotation = -Math.atan2(dy, horizontalDistance);
        
        // Tilt camera down to look at floor during first half, then look up at door
        if (easeT < 0.5) {
          // Look down during first half (positive rotation.x looks down)
          const lookDownAngle = Math.sin(easeT * 2 * Math.PI) * 0.5;
          camera.rotation.x = initialRotation.current.x + lookDownAngle;
          
          if (isWalkingToAltar) {
            // For altar door: keep facing straight (Y rotation at 0)
            camera.rotation.y = 0;
          } else {
            // For side doors: keep initial Y rotation during first half
            camera.rotation.y = initialRotation.current.y;
          }
        } else {
          // Look up at door during second half
          const lookUpProgress = (easeT - 0.5) * 2; // 0 to 1 for second half
          
          if (isWalkingToAltar) {
            // For altar door: only look up, don't turn head (keep Y rotation at 0)
            camera.rotation.y = 0;
            camera.rotation.x = THREE.MathUtils.lerp(initialRotation.current.x + 0.5, targetXRotation, lookUpProgress);
          } else {
            // For side doors: turn head and look up
            camera.rotation.y = THREE.MathUtils.lerp(initialRotation.current.y, targetYRotation, lookUpProgress);
            camera.rotation.x = THREE.MathUtils.lerp(initialRotation.current.x + 0.5, targetXRotation, lookUpProgress);
          }
        }
      }
      
      // Complete walk animation
      if (walkProgress.current >= 1) {
        walkProgress.current = 0;
        initialPosition.current = null;
        initialRotation.current = null;
        onWalkComplete();
      }
    } else {
      // Normal parallax behavior when not walking
      // Calculate target rotation based on mouse position
      // Negate x to fix left/right inversion - mouse right = camera right
      targetRotation.current.y = -mousePos.current.x * 0.1;
      targetRotation.current.x = mousePos.current.y * 0.05;
      
      // Smoothly interpolate camera rotation
      camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.05;
      camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.05;
    }
  });
  
  return null;
}

function HallwayContent({ 
  onShowPopup, 
  isWalkingBackProp,
  onWalkBackComplete 
}: { 
  onShowPopup: (route: string, roomName: string) => void;
  isWalkingBackProp: boolean;
  onWalkBackComplete: () => void;
}) {
  const fixedRooms = useGameState((state) => state.fixedRooms);
  const [isWalking, setIsWalking] = useState(false);
  const [walkTarget, setWalkTarget] = useState<[number, number, number] | null>(null);
  const [doorTarget, setDoorTarget] = useState<[number, number, number] | null>(null);
  const [isWalkingToAltar, setIsWalkingToAltar] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [pendingRoomName, setPendingRoomName] = useState<string | null>(null);
  
  const handleDoorClick = (roomId: RoomId, doorPosition: [number, number, number], label: string) => {
    // Calculate walk target (closer to the door, accounting for left/right wall)
    const offsetX = doorPosition[0] > 0 ? -1.0 : 1.0; // Closer to wall
    const target: [number, number, number] = [doorPosition[0] + offsetX, 1, doorPosition[2]];
    
    setWalkTarget(target);
    setDoorTarget(doorPosition);
    setIsWalking(true);
    setIsWalkingToAltar(false);
    setPendingRoute(`/room/${roomId === 'nullCandles' ? 'null-candles' : roomId === 'door404' ? '404' : roomId}`);
    setPendingRoomName(label);
  };
  
  const handleAltarDoorClick = (doorPosition: [number, number, number]) => {
    const target: [number, number, number] = [0, 1, doorPosition[2]];
    setWalkTarget(target);
    setDoorTarget(doorPosition);
    setIsWalking(true);
    setIsWalkingToAltar(true);
    setPendingRoute('/altar');
    setPendingRoomName('Commit Altar');
  };
  
  const handleWalkComplete = () => {
    setIsWalking(false);
    setWalkTarget(null);
    setDoorTarget(null);
    setIsWalkingToAltar(false);
    if (pendingRoute && pendingRoomName) {
      onShowPopup(pendingRoute, pendingRoomName);
      setPendingRoute(null);
      setPendingRoomName(null);
    }
  };
  
  return (
    <>
      {/* Camera controller for parallax and walking */}
      <CameraController 
        isWalking={isWalking}
        isWalkingBack={isWalkingBackProp}
        isWalkingToAltar={isWalkingToAltar}
        targetPosition={walkTarget}
        targetDoorPosition={doorTarget}
        onWalkComplete={handleWalkComplete}
        onWalkBackComplete={onWalkBackComplete}
      />
      
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
          onClick={() => handleDoorClick(door.id, door.position, door.label)}
          isFixed={fixedRooms[door.id]}
        />
      ))}
      
      {/* Altar door - always visible */}
      <AltarDoor onClick={() => handleAltarDoorClick(ALTAR_DOOR_POSITION)} />
    </>
  );
}

export default function HallwayScene() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [popupRoute, setPopupRoute] = useState<string | null>(null);
  const [popupRoomName, setPopupRoomName] = useState<string | null>(null);
  const [isWalkingBack, setIsWalkingBack] = useState(false);
  const [showTitleCard, setShowTitleCard] = useState(() => {
    // Only show title card on first visit
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasSeenTitleCard');
    }
    return true;
  });
  const [fadeOut, setFadeOut] = useState(false);
  
  // Background music
  useEffect(() => {
    const audio = new Audio('/KIRO_ASSETS/Music/Mysterious Lights.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    
    // Don't play until title card is dismissed
    let audioStarted = false;
    
    const startAudio = () => {
      if (!audioStarted && !showTitleCard) {
        audioStarted = true;
        audio.play().catch(err => console.log('Audio play error:', err));
      }
    };
    
    // Start audio when title card is dismissed
    if (!showTitleCard) {
      startAudio();
    }
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [showTitleCard]);
  
  const handleStartGame = () => {
    setFadeOut(true);
    // Mark that user has seen the title card
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenTitleCard', 'true');
    }
    setTimeout(() => {
      setShowTitleCard(false);
    }, 1000);
  };
  
  const handleShowPopup = (route: string, roomName: string) => {
    setPopupRoute(route);
    setPopupRoomName(roomName);
    setShowPopup(true);
  };
  
  const handleEnterRoom = () => {
    if (popupRoute) {
      router.push(popupRoute);
    }
  };
  
  const handleCancel = () => {
    setShowPopup(false);
    setPopupRoute(null);
    setPopupRoomName(null);
    setIsWalkingBack(true);
  };
  
  const handleWalkBackComplete = () => {
    setIsWalkingBack(false);
  };
  
  return (
    <div className="w-full h-screen relative">
      {/* Title Card */}
      {showTitleCard && (
        <div 
          className={`absolute inset-0 bg-black z-50 flex flex-col items-center justify-center transition-opacity duration-1000 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h1 className="text-6xl font-bold mb-4 text-cyan-400 font-mono animate-pulse">
            House Arkanum
          </h1>
          <h2 className="text-3xl font-bold mb-8 text-gray-300 font-mono">
            Haunted Codebase
          </h2>
          <p className="text-xl text-gray-400 font-mono mb-12 text-center max-w-2xl px-4">
            Debug the cursed code and escape the haunted mansion.<br />
            Each room holds a different bug... and a different horror.
          </p>
          <button
            onClick={handleStartGame}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-4 px-8 rounded text-xl transition-colors animate-pulse"
          >
            Enter the House
          </button>
        </div>
      )}
      
      <Scene3D cameraPosition={[0, 1, 3]} cameraFov={75}>
        <HallwayContent 
          onShowPopup={handleShowPopup}
          isWalkingBackProp={isWalkingBack}
          onWalkBackComplete={handleWalkBackComplete}
        />
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
      
      {/* Navigation Popup */}
      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
          <div className="bg-gray-900 border-2 border-cyan-400 p-8 rounded-lg shadow-2xl max-w-md">
            <h2 className="text-2xl font-bold text-cyan-400 font-mono mb-4">
              {popupRoomName === 'Loop' ? 'The Infinite Loop' : `Enter ${popupRoomName}?`}
            </h2>
            
            {/* Show riddle for Loop room */}
            {popupRoomName === 'Loop' ? (
              <>
                <p className="text-gray-300 font-mono mb-6 italic text-center leading-relaxed">
                  "I circle endlessly, never at rest,<br />
                  Keep your eyes on me, or face the test.<br />
                  Click me thrice to break my chain,<br />
                  Look away too long, and I'll cause you pain."
                </p>
                <p className="text-gray-400 font-mono mb-6 text-sm text-center">
                  Are you ready to break the loop?
                </p>
              </>
            ) : (
              <p className="text-gray-300 font-mono mb-6">
                Are you ready to face this bug?
              </p>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={handleEnterRoom}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-3 px-6 rounded transition-colors"
              >
                Enter Room
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold py-3 px-6 rounded transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
