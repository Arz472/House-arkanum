'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useGLTF, useAnimations } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import * as THREE from 'three';

interface StaircaseInteractionProps {
  onGoUp?: () => void;
  onGoDown?: () => void;
  onClose: () => void;
  canGoUp: boolean;
  canGoDown: boolean;
}

function StaircaseInteraction({ onGoUp, onGoDown, onClose, canGoUp, canGoDown }: StaircaseInteractionProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 border-2 border-gray-700 p-6 rounded-lg max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Staircase</h2>
        <div className="flex flex-col gap-3">
          {canGoUp && onGoUp && (
            <Button label="Go Up" onClick={onGoUp} />
          )}
          {canGoDown && onGoDown && (
            <Button label="Go Down" onClick={onGoDown} />
          )}
          <Button label="Stay Here" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function CandleMonster({ visible, onAnimationComplete }: { visible: boolean; onAnimationComplete: () => void }) {
  const { scene, animations } = useGLTF('/KIRO_ASSETS/entities/candle monster/Animation_Arise_withSkin.glb');
  const { camera } = useThree();
  
  // Animation mixer and action refs
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const action = useRef<THREE.AnimationAction | null>(null);
  const audioRef = useRef<THREE.PositionalAudio | null>(null);

  // Set up animation mixer when visible
  useEffect(() => {
    if (visible && animations && animations.length > 0) {
      console.log('🔥 MONSTER APPEARING - Animation starting!');
      
      // Create positional audio at monster location
      const listener = new THREE.AudioListener();
      camera.add(listener);
      
      const positionalAudio = new THREE.PositionalAudio(listener);
      audioRef.current = positionalAudio;
      
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load('/KIRO_ASSETS/Voices/candle scream.mp3', (buffer) => {
        positionalAudio.setBuffer(buffer);
        positionalAudio.setRefDistance(5);
        positionalAudio.setVolume(1.5);
        positionalAudio.setLoop(false); // Play once
        positionalAudio.play();
      });
      
      // Create mixer on the scene
      mixer.current = new THREE.AnimationMixer(scene);
      action.current = mixer.current.clipAction(animations[0]);
      
      const originalDuration = animations[0].duration;
      const targetDuration = 4.0; // Slower, more dramatic
      const timeScale = originalDuration / targetDuration;
      
      console.log(`Playing animation at ${timeScale.toFixed(2)}x speed (${targetDuration}s total)`);
      
      // Configure animation
      action.current.reset();
      action.current.timeScale = timeScale;
      action.current.loop = THREE.LoopOnce;
      action.current.clampWhenFinished = true;
      action.current.play();
      
      console.log('✅ Animation playing once for 4 seconds');
      
      // Trigger "You Failed" after animation completes
      const timer = setTimeout(() => {
        console.log('💀 Animation complete - triggering failure');
        onAnimationComplete();
      }, targetDuration * 1000);
      
      return () => {
        clearTimeout(timer);
        if (audioRef.current) {
          audioRef.current.stop();
        }
        camera.remove(listener);
      };
    }
    
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [visible, animations, scene, onAnimationComplete, camera]);

  // Update mixer every frame - CRITICAL for animation!
  useFrame((state, delta) => {
    if (visible && mixer.current) {
      mixer.current.update(delta);
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, -1]} rotation={[0, Math.PI, 0]}>
      {/* Monster positioned just in front of camera, facing into the room */}
      <primitive object={scene} scale={2.5} />
      
      {/* Positional audio at monster location */}
      {audioRef.current && (
        <primitive object={audioRef.current} position={[0, 1, 0]} />
      )}
      
      {/* Eerie red lighting */}
      <pointLight position={[0, 2, 0]} intensity={3} distance={10} color="#880000" />
      <pointLight position={[1, 1, 0]} intensity={2} distance={8} color="#660000" />
      <pointLight position={[-1, 1, 0]} intensity={2} distance={8} color="#660000" />
      
      <spotLight 
        position={[0, 6, 0]} 
        intensity={5} 
        angle={0.6} 
        penumbra={0.5} 
        color="#aa0000"
      />
    </group>
  );
}

function LibraryContent({ 
  currentFloor, 
  onShowStaircasePrompt,
  onShowRiddle,
  onShowWarning,
  onShowExitConfirm,
  candleLit,
  onCandleBlowOut,
  onMonsterAnimationComplete
}: { 
  currentFloor: number;
  onShowStaircasePrompt: (show: boolean) => void;
  onShowRiddle: (show: boolean) => void;
  onShowWarning: (show: boolean) => void;
  onShowExitConfirm: (show: boolean) => void;
  candleLit: boolean;
  onCandleBlowOut: () => void;
  onMonsterAnimationComplete: () => void;
}) {
  const { camera } = useThree();
  const prevFloor = useRef(currentFloor);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  
  // Camera animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const animationProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startRotation = useRef(new THREE.Euler());
  const targetPosition = useRef(new THREE.Vector3());
  const targetCameraRotation = useRef(new THREE.Euler());
  
  // Riddle popup state
  const [paperHovered, setPaperHovered] = useState(false);
  const [bookHovered, setBookHovered] = useState(false);
  const [mainLanternHovered, setMainLanternHovered] = useState(false);
  const [sideLanternHovered, setSideLanternHovered] = useState(false);
  const [candleHovered, setCandleHovered] = useState(false);
  const [warningOpacity, setWarningOpacity] = useState(0);

  // Track mouse position (hallway-style)
  useState(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });

  // Handle table click - animate camera to table
  const handleTableClick = (position: [number, number, number]) => {
    if (isAnimating) return;
    
    startPosition.current.copy(camera.position);
    startRotation.current.copy(camera.rotation);
    targetPosition.current.set(...position);
    
    // Keep current rotation but look down slightly
    targetCameraRotation.current.set(-0.3, camera.rotation.y, 0);
    
    animationProgress.current = 0;
    setIsAnimating(true);
  };

  // Handle floor changes - update camera Y position
  useEffect(() => {
    if (prevFloor.current !== currentFloor && !isAnimating) {
      const targetY = currentFloor * 4 + 1.5; // 1.5, 5.5, or 9.5
      camera.position.y = targetY;
      prevFloor.current = currentFloor;
    }
  }, [currentFloor, camera, isAnimating]);

  // Apply smooth camera rotation based on mouse position (hallway-style) or animate to table
  useFrame((state, delta) => {
    if (isAnimating) {
      // Animate camera to table - slower for smoother movement
      animationProgress.current += delta * 0.4; // Slower animation speed
      
      if (animationProgress.current >= 1) {
        animationProgress.current = 1;
        setIsAnimating(false);
      }
      
      // Smooth ease in-out function
      const t = animationProgress.current;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      // Interpolate position
      camera.position.lerpVectors(startPosition.current, targetPosition.current, eased);
      
      // Interpolate rotation
      camera.rotation.x = THREE.MathUtils.lerp(startRotation.current.x, targetCameraRotation.current.x, eased);
      camera.rotation.y = THREE.MathUtils.lerp(startRotation.current.y, targetCameraRotation.current.y, eased);
      camera.rotation.z = THREE.MathUtils.lerp(startRotation.current.z, targetCameraRotation.current.z, eased);
    } else {
      // Normal mouse-based rotation - full 360 degrees
      targetRotation.current.y = -mousePos.current.x * Math.PI; // Full horizontal rotation (inverted) - 360 degrees
      targetRotation.current.x = mousePos.current.y * 0.5; // Vertical rotation (limited to prevent flipping)
      
      // Smoothly interpolate camera rotation with higher lerp factor for more fluid movement
      camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.08;
      camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.08;
    }
    
    // Check proximity to staircases for prompts (only when not animating)
    if (!isAnimating) {
      const pos = camera.position;
      const distToStair1 = Math.sqrt(Math.pow(pos.x - 6, 2) + Math.pow(pos.z - (-6), 2));
      const distToStair2 = Math.sqrt(Math.pow(pos.x - (-6), 2) + Math.pow(pos.z - (-6), 2));
      
      if ((distToStair1 < 2 || distToStair2 < 2)) {
        onShowStaircasePrompt(true);
      } else if (distToStair1 > 3 && distToStair2 > 3) {
        onShowStaircasePrompt(false);
      }
    }
    
    // Fade in warning text when candle is blown out
    if (!candleLit && warningOpacity < 1) {
      setWarningOpacity(Math.min(1, warningOpacity + delta * 0.3)); // Slow fade in
    }
  });

  return (
    <>
      {/* Candle Monster - appears behind camera when candle is blown out */}
      <CandleMonster visible={!candleLit} onAnimationComplete={onMonsterAnimationComplete} />
      
      {/* Lighting - Different lighting when candle is out to show monster */}
      {candleLit ? (
        <>
          <ambientLight intensity={0.15} color="#1a1520" />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={0.2}
            color="#2a2535"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        </>
      ) : (
        <>
          {/* Extremely dim ambient light when candle is out - almost pitch black */}
          <ambientLight intensity={0.02} color="#1a0000" />
          <directionalLight 
            position={[0, 10, 5]} 
            intensity={0.05}
            color="#220000"
          />
        </>
      )}
      
      {/* Thick, oppressive fog - dark red when candle is out */}
      <fog attach="fog" args={[candleLit ? '#0a0a0f' : '#1a0000', candleLit ? 5 : 1, candleLit ? 20 : 6]} />
      
      {/* All point lights disappear when candle is out */}
      {candleLit && (
        <>
          <pointLight position={[-6, 2, -8]} intensity={0.6} distance={8} color="#4a6a4a" />
          <pointLight position={[6, 2, -8]} intensity={0.6} distance={8} color="#4a6a4a" />
          <pointLight position={[-6, 6, -8]} intensity={0.5} distance={8} color="#4a5a5a" />
          <pointLight position={[6, 6, -8]} intensity={0.5} distance={8} color="#4a5a5a" />
          <pointLight position={[-6, 10, -8]} intensity={0.4} distance={8} color="#3a4a5a" />
          <pointLight position={[6, 10, -8]} intensity={0.4} distance={8} color="#3a4a5a" />
        </>
      )}

      {/* THREE-FLOOR LIBRARY LAYOUT */}
      
      {/* GROUND FLOOR (Y=0) - Worn and dark */}
      <mesh position={[0, 0, -6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 20, 0.2]} />
        <meshStandardMaterial color="#1a1210" roughness={0.95} />
      </mesh>

      {/* SECOND FLOOR (Y=4) - Aged wood */}
      <mesh position={[0, 4, -6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 20, 0.2]} />
        <meshStandardMaterial color="#1a1210" roughness={0.95} />
      </mesh>

      {/* THIRD FLOOR (Y=8) - Ancient and cracked */}
      <mesh position={[0, 8, -6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 20, 0.2]} />
        <meshStandardMaterial color="#1a1210" roughness={0.95} />
      </mesh>



      {/* OUTER WALLS - Full height, decayed and dark */}
      {/* Front wall with entrance */}
      <mesh position={[0, 6, 4]}>
        <boxGeometry args={[20, 12, 0.3]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>
      
      {/* Back wall - darkest */}
      <mesh position={[0, 6, -16]}>
        <boxGeometry args={[20, 12, 0.3]} />
        <meshStandardMaterial color="#0a0a08" roughness={0.95} />
      </mesh>
      
      {/* Left wall - moldy */}
      <mesh position={[-10, 6, -6]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 12, 0.3]} />
        <meshStandardMaterial color="#1a1a10" roughness={0.95} />
      </mesh>
      
      {/* Right wall - water damaged */}
      <mesh position={[10, 6, -6]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 12, 0.3]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>

      {/* BOOKSHELVES - GROUND FLOOR */}
      {/* Left wall bookshelves */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`shelf-left-ground-${i}`} position={[-9, 1.5, -14 + i * 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1.5]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Right wall bookshelves */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`shelf-right-ground-${i}`} position={[9, 1.5, -14 + i * 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1.5]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Back wall bookshelves */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`shelf-back-ground-${i}`} position={[-6 + i * 6, 1.5, -15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 3, 1]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* BOOKSHELVES - SECOND FLOOR */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`shelf-left-second-${i}`} position={[-9, 5.5, -14 + i * 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1.5]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`shelf-right-second-${i}`} position={[9, 5.5, -14 + i * 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1.5]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`shelf-back-second-${i}`} position={[-6 + i * 6, 5.5, -15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 3, 1]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* BOOKSHELVES - THIRD FLOOR */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`shelf-left-third-${i}`} position={[-9, 9.5, -14 + i * 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1.5]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`shelf-right-third-${i}`} position={[9, 9.5, -14 + i * 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1.5]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`shelf-back-third-${i}`} position={[-6 + i * 6, 9.5, -15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 3, 1]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* SPIRAL STAIRCASE - Ground to Second Floor (Smaller & More Visible) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.5; // Reduced from 3 to 1.5
        const x = Math.cos(angle) * radius + 6;
        const z = Math.sin(angle) * radius - 6;
        const y = i * 0.2;
        const rotation = angle + Math.PI / 2;
        
        return (
          <group key={`stair-1-${i}`}>
            <mesh position={[x, y, z]} rotation={[0, rotation, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.12, 0.5]} />
              <meshStandardMaterial color="#5a3a20" roughness={0.7} />
            </mesh>
            {/* Step edge highlight */}
            <mesh position={[x, y + 0.07, z]} rotation={[0, rotation, 0]}>
              <boxGeometry args={[0.82, 0.02, 0.52]} />
              <meshStandardMaterial color="#6a4a30" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      
      {/* Central pole for first staircase - thicker and more visible */}
      <mesh position={[6, 2, -6]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 4, 16]} />
        <meshStandardMaterial color="#3a2010" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Decorative top cap for first staircase */}
      <mesh position={[6, 4.1, -6]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#4a3020" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* SPIRAL STAIRCASE - Second to Third Floor (Smaller & More Visible) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.5; // Reduced from 3 to 1.5
        const x = Math.cos(angle) * radius - 6;
        const z = Math.sin(angle) * radius - 6;
        const y = 4 + i * 0.2;
        const rotation = angle + Math.PI / 2;
        
        return (
          <group key={`stair-2-${i}`}>
            <mesh position={[x, y, z]} rotation={[0, rotation, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.12, 0.5]} />
              <meshStandardMaterial color="#5a3a20" roughness={0.7} />
            </mesh>
            {/* Step edge highlight */}
            <mesh position={[x, y + 0.07, z]} rotation={[0, rotation, 0]}>
              <boxGeometry args={[0.82, 0.02, 0.52]} />
              <meshStandardMaterial color="#6a4a30" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      
      {/* Central pole for second staircase - thicker and more visible */}
      <mesh position={[-6, 6, -6]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 4, 16]} />
        <meshStandardMaterial color="#3a2010" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Decorative top cap for second staircase */}
      <mesh position={[-6, 8.1, -6]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#4a3020" roughness={0.5} metalness={0.3} />
      </mesh>
      
      {/* Glowing orbs at base of staircases for visibility */}
      <mesh position={[6, 0.5, -6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={2} />
        <pointLight intensity={1.5} distance={4} color="#ffaa44" />
      </mesh>
      
      {/* Floating text above first staircase */}
      <Text
        position={[6, 1.5, -6]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Ascend
      </Text>
      
      <mesh position={[-6, 4.5, -6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={2} />
        <pointLight intensity={1.5} distance={4} color="#ffaa44" />
      </mesh>
      
      {/* Floating text above second staircase */}
      <Text
        position={[-6, 5.5, -6]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Ascend
      </Text>
      
      {/* GROUND FLOOR DECORATIONS */}
      
      {/* Yellow Hallway Door - Behind starting position */}
      <group position={[0, 0, 4]}>
        {/* Door frame - dark wood */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2.2, 3.2, 0.3]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
        </mesh>
        
        {/* Yellow Door - same as hallway */}
        <mesh position={[0, 1.5, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.8, 0.2]} />
          <meshStandardMaterial 
            color="#ffd93d" 
            emissive="#ffd93d" 
            emissiveIntensity={0.3}
            roughness={0.6} 
          />
        </mesh>
        
        {/* Door handle */}
        <mesh position={[0.7, 1.5, 0.3]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.4} metalness={0.6} />
        </mesh>
        
        {/* Glow around door */}
        <pointLight position={[0, 1.5, 0.5]} intensity={1.2} distance={4} color="#ffd93d" />
        
        {/* Lantern above door */}
        <group position={[0, 3.2, 0.3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 6]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.6} metalness={0.4} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={2} />
            <pointLight intensity={1.5} distance={5} color="#ffaa66" />
          </mesh>
        </group>
        
        {/* Clickable "Hallway" text - larger and more visible */}
        <Text
          position={[0, 3.8, 0.4]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          onClick={(e) => {
            e.stopPropagation();
            handleTableClick([0, 1.5, 2]);
            // Show exit confirmation after animation
            setTimeout(() => onShowExitConfirm(true), 2500);
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          Hallway
        </Text>
        
        {/* Additional glow for visibility */}
        <mesh position={[0, 3.8, 0.35]}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshBasicMaterial color="#ffaa44" transparent opacity={0.2} />
        </mesh>
      </group>
      
      {/* Main Reading Table - Center */}
      <group position={[0, 0, -8]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial color="#4a3020" roughness={0.7} />
        </mesh>
        {/* Table legs */}
        {[[-1.3, -0.3, -0.8], [1.3, -0.3, -0.8], [-1.3, -0.3, 0.8], [1.3, -0.3, 0.8]].map((pos, i) => (
          <mesh key={`leg-${i}`} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#3a2010" roughness={0.8} />
          </mesh>
        ))}
        {/* Clickable warning book on table */}
        <mesh 
          position={[-0.5, 0.5, 0]} 
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onShowWarning(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setBookHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setBookHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.3, 0.05, 0.4]} />
          <meshStandardMaterial 
            color={bookHovered ? "#aa5a3a" : "#8a4a2a"} 
            roughness={0.9}
            emissive={bookHovered ? "#ff6644" : "#000000"}
            emissiveIntensity={bookHovered ? 0.4 : 0}
          />
        </mesh>
        <mesh 
          position={[-0.5, 0.55, 0]} 
          rotation={[0, 0.3, 0]} 
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onShowWarning(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setBookHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setBookHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.3, 0.05, 0.4]} />
          <meshStandardMaterial 
            color={bookHovered ? "#8a4a2a" : "#6a3a1a"} 
            roughness={0.9}
            emissive={bookHovered ? "#ff6644" : "#000000"}
            emissiveIntensity={bookHovered ? 0.4 : 0}
          />
        </mesh>
        
        {/* Glowing outline when hovered */}
        {bookHovered && (
          <>
            <mesh position={[-0.5, 0.5, 0]}>
              <boxGeometry args={[0.35, 0.08, 0.45]} />
              <meshBasicMaterial color="#ff6644" transparent opacity={0.3} />
            </mesh>
            <mesh position={[-0.5, 0.55, 0]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.35, 0.08, 0.45]} />
              <meshBasicMaterial color="#ff6644" transparent opacity={0.3} />
            </mesh>
          </>
        )}
        {/* Clickable Candle on table */}
        <mesh position={[0.8, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#f0e0c0" roughness={0.8} />
        </mesh>
        
        {/* Flame orb - only visible when lit */}
        {candleLit && (
          <mesh 
            position={[0.8, 0.62, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onCandleBlowOut();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setCandleHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setCandleHovered(false);
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ffaa00" 
              emissiveIntensity={candleHovered ? 2.5 : 1.5} 
            />
            <pointLight intensity={0.8} distance={3} color="#ffaa66" />
          </mesh>
        )}
        
        {/* Clickable Lantern above table */}
        <group position={[0, 1.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 6]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.6} metalness={0.4} transparent opacity={0.8} />
          </mesh>
          <mesh 
            position={[0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              handleTableClick([0, 1.5, -5]);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setMainLanternHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setMainLanternHovered(false);
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color="#ffaa44" 
              emissive="#ffaa44" 
              emissiveIntensity={mainLanternHovered ? 4 : 2} 
            />
            <pointLight intensity={mainLanternHovered ? 2.5 : 1.5} distance={5} color="#ffaa66" />
          </mesh>
          {/* Glow ring when hovered */}
          {mainLanternHovered && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color="#ffaa44" transparent opacity={0.3} />
            </mesh>
          )}
        </group>
        
        {/* Clickable floating text - changes when candle is out */}
        {candleLit ? (
          <Text
            position={[0, 2, 0]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            onClick={(e) => {
              e.stopPropagation();
              handleTableClick([0, 1.5, -5]);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
          >
            Main Table
          </Text>
        ) : (
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#ff4444"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            fillOpacity={warningOpacity}
            outlineOpacity={warningOpacity}
          >
            Do Not Look Behind
          </Text>
        )}
      </group>

      {/* Side Reading Tables */}
      <group position={[-5, 0, -4]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.1, 1.2]} />
          <meshStandardMaterial color="#4a3020" roughness={0.7} />
        </mesh>
        {[[-0.6, -0.3, -0.5], [0.6, -0.3, -0.5], [-0.6, -0.3, 0.5], [0.6, -0.3, 0.5]].map((pos, i) => (
          <mesh key={`leg2-${i}`} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.8, 8]} />
            <meshStandardMaterial color="#3a2010" roughness={0.8} />
          </mesh>
        ))}
        {/* Clickable paper with riddle */}
        <mesh 
          position={[0, 0.46, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onShowRiddle(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPaperHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setPaperHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <planeGeometry args={[0.35, 0.45]} />
          <meshStandardMaterial 
            color={paperHovered ? "#ffffff" : "#f0e8d8"} 
            roughness={0.9}
            emissive={paperHovered ? "#ffaa44" : "#000000"}
            emissiveIntensity={paperHovered ? 0.3 : 0}
          />
        </mesh>
        
        {/* Glowing outline when hovered */}
        {paperHovered && (
          <mesh position={[0, 0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.4, 0.5]} />
            <meshBasicMaterial color="#ffaa44" transparent opacity={0.4} />
          </mesh>
        )}
        
        {/* Clickable Lantern above table */}
        <group position={[0, 1.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.25, 6]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.6} metalness={0.4} transparent opacity={0.8} />
          </mesh>
          <mesh 
            position={[0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              handleTableClick([-5, 1.5, -1.5]);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setSideLanternHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setSideLanternHovered(false);
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial 
              color="#ffaa44" 
              emissive="#ffaa44" 
              emissiveIntensity={sideLanternHovered ? 4 : 2} 
            />
            <pointLight intensity={sideLanternHovered ? 2 : 1.2} distance={4} color="#ffaa66" />
          </mesh>
          {/* Glow ring when hovered */}
          {sideLanternHovered && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#ffaa44" transparent opacity={0.3} />
            </mesh>
          )}
        </group>
        
        {/* Clickable floating text */}
        <Text
          position={[0, 1.7, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          onClick={(e) => {
            e.stopPropagation();
            handleTableClick([-5, 1.5, -1.5]);
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          Side Table
        </Text>
      </group>

      {/* Decorative Pedestals with Artifacts */}
      <group position={[-7, 0, -12]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 1, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
        </mesh>
        {/* Ancient book on pedestal */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.3, 0.1, 0.4]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#4a6a8a" emissive="#4a6a8a" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
      </group>

      <group position={[7, 0, -12]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 1, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
        </mesh>
        {/* Glowing crystal */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <coneGeometry args={[0.15, 0.4, 6]} />
          <meshStandardMaterial color="#8a4a6a" emissive="#8a4a6a" emissiveIntensity={0.8} />
          <pointLight intensity={0.6} distance={3} color="#aa6a8a" />
        </mesh>
      </group>

      {/* Floor Rug - Center */}
      <mesh position={[0, 0.02, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 6]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.95} />
      </mesh>
      
      {/* Decorative floor patterns */}
      <mesh position={[0, 0.03, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
      </mesh>

      {/* Wall Sconces - Ground Floor */}
      {[
        [-9, 1.8, -4],
        [-9, 1.8, -12],
        [9, 1.8, -4],
        [9, 1.8, -12],
      ].map((pos, i) => (
        <group key={`sconce-ground-${i}`} position={pos as [number, number, number]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial color="#4a3020" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={1.5} />
            <pointLight intensity={0.8} distance={5} color="#ffaa66" />
          </mesh>
        </group>
      ))}

      {/* Chairs around main table */}
      {[
        [-1.5, 0, -8],
        [1.5, 0, -8],
        [0, 0, -9.5],
        [0, 0, -6.5],
      ].map((pos, i) => (
        <group key={`chair-${i}`} position={pos as [number, number, number]}>
          {/* Seat */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.4, 0.05, 0.4]} />
            <meshStandardMaterial color="#3a2515" roughness={0.8} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.5, -0.15]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.05]} />
            <meshStandardMaterial color="#3a2515" roughness={0.8} />
          </mesh>
          {/* Legs */}
          {[[-0.15, -0.15, -0.15], [0.15, -0.15, -0.15], [-0.15, -0.15, 0.15], [0.15, -0.15, 0.15]].map((legPos, j) => (
            <mesh key={`chair-leg-${j}`} position={legPos as [number, number, number]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
              <meshStandardMaterial color="#2a1a0f" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* READING TABLES - Second Floor */}
      {/* Table 1 - Left side */}
      <group position={[-3, 4, -10]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.1, 1.8]} />
          <meshStandardMaterial color="#4a3020" roughness={0.7} />
        </mesh>
        {/* Table legs */}
        {[[-1.1, -0.3, -0.8], [1.1, -0.3, -0.8], [-1.1, -0.3, 0.8], [1.1, -0.3, 0.8]].map((pos, i) => (
          <mesh key={`table2-leg-${i}`} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#3a2010" roughness={0.8} />
          </mesh>
        ))}
        {/* Books on table */}
        <mesh position={[-0.6, 0.48, 0.2]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.06, 0.4]} />
          <meshStandardMaterial color="#6a3a1a" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.48, -0.3]} castShadow>
          <boxGeometry args={[0.25, 0.08, 0.35]} />
          <meshStandardMaterial color="#8a4a2a" roughness={0.9} />
        </mesh>
        {/* Candle */}
        <mesh position={[0.8, 0.5, 0.5]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#f0e0c0" roughness={0.8} />
        </mesh>
        <mesh position={[0.8, 0.62, 0.5]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />
          <pointLight intensity={0.6} distance={3} color="#ffaa66" />
        </mesh>
      </group>

      {/* Table 2 - Right side */}
      <group position={[3, 4, -6]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.1, 1.8]} />
          <meshStandardMaterial color="#4a3020" roughness={0.7} />
        </mesh>
        {/* Table legs */}
        {[[-1.1, -0.3, -0.8], [1.1, -0.3, -0.8], [-1.1, -0.3, 0.8], [1.1, -0.3, 0.8]].map((pos, i) => (
          <mesh key={`table3-leg-${i}`} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#3a2010" roughness={0.8} />
          </mesh>
        ))}
        {/* Open book */}
        <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0.3]} castShadow>
          <boxGeometry args={[0.5, 0.35, 0.02]} />
          <meshStandardMaterial color="#e0d0b0" roughness={0.9} />
        </mesh>
        {/* Ink bottle */}
        <mesh position={[-0.7, 0.48, 0.4]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.15, 8]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>

      {/* READING TABLES - Third Floor */}
      {/* Large central table */}
      <group position={[0, 8, -8]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 0.12, 2.5]} />
          <meshStandardMaterial color="#4a3020" roughness={0.7} />
        </mesh>
        {/* Ornate table legs */}
        {[[-1.5, -0.3, -1.1], [1.5, -0.3, -1.1], [-1.5, -0.3, 1.1], [1.5, -0.3, 1.1]].map((pos, i) => (
          <group key={`table4-leg-${i}`} position={pos as [number, number, number]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.12, 0.8, 8]} />
              <meshStandardMaterial color="#3a2010" roughness={0.7} />
            </mesh>
            {/* Decorative base */}
            <mesh position={[0, -0.45, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
              <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* Ancient tome in center */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
        </mesh>
        {/* Glowing runes on book */}
        <mesh position={[0, 0.58, 0]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial color="#6a8aaa" emissive="#6a8aaa" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
        {/* Scattered scrolls */}
        <mesh position={[-1, 0.48, 0.5]} rotation={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#d0c0a0" roughness={0.9} />
        </mesh>
        <mesh position={[1.2, 0.48, -0.6]} rotation={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
          <meshStandardMaterial color="#d0c0a0" roughness={0.9} />
        </mesh>
        {/* Candelabra with multiple candles */}
        <group position={[-1.2, 0.5, -0.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Three candles */}
          {[-0.15, 0, 0.15].map((offset, i) => (
            <group key={`candle-${i}`} position={[offset, 0.2, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
                <meshStandardMaterial color="#f0e0c0" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.5} />
              </mesh>
            </group>
          ))}
          <pointLight position={[0, 0.4, 0]} intensity={1} distance={4} color="#ffaa66" />
        </group>
      </group>

      {/* RAILINGS - Second Floor */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`railing-2-${i}`} position={[-8 + i * 2, 4.5, 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.7} />
        </mesh>
      ))}

      {/* RAILINGS - Third Floor */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`railing-3-${i}`} position={[-8 + i * 2, 8.5, 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.7} />
        </mesh>
      ))}

      {/* Floating dust particles - more visible and eerie */}
      {Array.from({ length: 100 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 18;
        const y = Math.random() * 11 + 0.5;
        const z = Math.random() * 18 - 15;
        const size = Math.random() * 0.03 + 0.01;
        return (
          <mesh key={`particle-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[size, 4, 4]} />
            <meshBasicMaterial color="#8a9aaa" transparent opacity={0.25} />
          </mesh>
        );
      })}

      {/* SPOOKY DECORATIONS - Cobwebs in corners */}
      {[
        [-9.5, 3, -15.5], [9.5, 3, -15.5], [-9.5, 3, 3.5], [9.5, 3, 3.5],
        [-9.5, 7, -15.5], [9.5, 7, -15.5], [-9.5, 7, 3.5], [9.5, 7, 3.5],
        [-9.5, 11, -15.5], [9.5, 11, -15.5], [-9.5, 11, 3.5], [9.5, 11, 3.5],
      ].map((pos, i) => (
        <group key={`cobweb-${i}`} position={pos as [number, number, number]}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color="#cccccc" transparent opacity={0.15} side={2} />
          </mesh>
        </group>
      ))}

      {/* Cracks on walls - ground floor */}
      {Array.from({ length: 12 }).map((_, i) => {
        const side = i % 4;
        let x = 0, z = 0, rotation = 0;
        if (side === 0) { x = -9.9; z = -15 + (i * 3); rotation = Math.PI / 2; }
        else if (side === 1) { x = 9.9; z = -15 + (i * 3); rotation = Math.PI / 2; }
        else if (side === 2) { x = -8 + (i * 4); z = -15.9; }
        else { x = -8 + (i * 4); z = 3.9; }
        
        return (
          <mesh key={`crack-${i}`} position={[x, 1.5 + Math.random(), z]} rotation={[0, rotation, Math.random() * 0.5]}>
            <planeGeometry args={[0.1, 1.5]} />
            <meshBasicMaterial color="#0a0a0a" transparent opacity={0.6} />
          </mesh>
        );
      })}

      {/* Broken/tilted books on shelves */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 16;
        const y = Math.random() * 10 + 1;
        const z = Math.random() > 0.5 ? -14.5 : (Math.random() > 0.5 ? -9.5 : 9.5);
        return (
          <mesh key={`fallen-book-${i}`} position={[x, y, z]} rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]} castShadow>
            <boxGeometry args={[0.15, 0.05, 0.2]} />
            <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
          </mesh>
        );
      })}

      {/* Eerie floating orbs - ghostly presence */}
      {[
        [-7, 2.5, -12], [7, 2.5, -4], [-5, 6.5, -10], [5, 6.5, -6], [0, 10.5, -12],
      ].map((pos, i) => (
        <mesh key={`ghost-orb-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#6a7a9a" 
            emissive="#6a7a9a" 
            emissiveIntensity={0.4} 
            transparent 
            opacity={0.3} 
          />
          <pointLight intensity={0.3} distance={4} color="#6a7a9a" />
        </mesh>
      ))}

      {/* Worn floor patches - darker spots */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 16;
        const z = Math.random() * 16 - 14;
        const floor = Math.floor(Math.random() * 3);
        return (
          <mesh key={`floor-stain-${i}`} position={[x, floor * 4 + 0.03, z]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
            <circleGeometry args={[0.5 + Math.random() * 0.5, 16]} />
            <meshStandardMaterial color="#0a0a0a" transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* Hanging chains from ceiling */}
      {[
        [-4, 11.5, -10], [4, 11.5, -10], [-6, 11.5, -6], [6, 11.5, -6],
      ].map((pos, i) => (
        <group key={`chain-${i}`} position={pos as [number, number, number]}>
          {Array.from({ length: 8 }).map((_, j) => (
            <mesh key={`link-${j}`} position={[0, -j * 0.15, 0]} castShadow>
              <torusGeometry args={[0.05, 0.015, 8, 8]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.7} metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Creepy skulls on pedestals */}
      {[
        [-8, 1.2, -3], [8, 1.2, -3], [-8, 5.2, -13], [8, 5.2, -13],
      ].map((pos, i) => (
        <group key={`skull-${i}`} position={pos as [number, number, number]}>
          {/* Pedestal */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          {/* Skull (simplified) */}
          <mesh castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#d0d0c0" roughness={0.9} />
          </mesh>
          {/* Eye sockets with eerie glow */}
          <mesh position={[-0.06, 0.02, 0.12]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#4a6a4a" emissive="#4a6a4a" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.06, 0.02, 0.12]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#4a6a4a" emissive="#4a6a4a" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}

      {/* Tattered curtains/drapes */}
      {[
        [-9.8, 2, -8], [9.8, 2, -8], [-9.8, 6, -8], [9.8, 6, -8],
      ].map((pos, i) => (
        <mesh key={`curtain-${i}`} position={pos as [number, number, number]} rotation={[0, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[0.8, 2]} />
          <meshStandardMaterial color="#2a1a1a" transparent opacity={0.7} side={2} roughness={0.95} />
        </mesh>
      ))}

      {/* Mysterious symbols on floor - ritual circles */}
      {[
        [0, 0.04, -8], [-6, 4.04, -10], [6, 8.04, -6],
      ].map((pos, i) => (
        <group key={`symbol-${i}`} position={pos as [number, number, number]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color="#4a2a2a" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <ringGeometry args={[0.6, 0.65, 4]} />
            <meshBasicMaterial color="#4a2a2a" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
      
    </>
  );
}

export default function NullCandlesRoomScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [showStaircasePrompt, setShowStaircasePrompt] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [showRiddle, setShowRiddle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const [showFailure, setShowFailure] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  
  // Handle monster animation complete
  const handleMonsterAnimationComplete = () => {
    setShowFailure(true);
    // Start fading to black
    let opacity = 0;
    const fadeInterval = setInterval(() => {
      opacity += 0.02;
      setFadeToBlack(opacity);
      if (opacity >= 1) {
        clearInterval(fadeInterval);
      }
    }, 50);
  };

  // Background music
  useEffect(() => {
    const audio = new Audio('/KIRO_ASSETS/Music/candlesroom.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(err => console.log('Audio play error:', err));
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Fade out music when candle is blown out
  useEffect(() => {
    if (!candleLit && audioRef.current) {
      const fadeInterval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.01) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.02);
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          clearInterval(fadeInterval);
        }
      }, 100); // Fade out over ~1.5 seconds
      
      return () => clearInterval(fadeInterval);
    }
  }, [candleLit]);

  // Play audio when riddle is shown
  useEffect(() => {
    if (showRiddle) {
      const audio = new Audio('/KIRO_ASSETS/Voices/sidetableriddle.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => console.log('Audio play error:', err));
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [showRiddle]);

  const handleReturnToHallway = () => {
    router.push('/');
  };

  const handleStartExploring = () => {
    setShowIntro(false);
  };

  const handleGoUp = () => {
    if (currentFloor < 2) {
      setCurrentFloor(prev => prev + 1);
      setShowStaircasePrompt(false);
    }
  };

  const handleGoDown = () => {
    if (currentFloor > 0) {
      setCurrentFloor(prev => prev - 1);
      setShowStaircasePrompt(false);
    }
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 1.5, 2]} cameraFov={75}>
        <color attach="background" args={['#1a1210']} />
        <LibraryContent 
          currentFloor={currentFloor}
          onShowStaircasePrompt={setShowStaircasePrompt}
          onShowRiddle={setShowRiddle}
          onShowWarning={setShowWarning}
          onShowExitConfirm={setShowExitConfirm}
          candleLit={candleLit}
          onCandleBlowOut={() => setCandleLit(false)}
          onMonsterAnimationComplete={handleMonsterAnimationComplete}
        />
      </Scene3D>
      
      {/* Staircase interaction prompt */}
      {showStaircasePrompt && (
        <StaircaseInteraction
          onGoUp={currentFloor < 2 ? handleGoUp : undefined}
          onGoDown={currentFloor > 0 ? handleGoDown : undefined}
          onClose={() => setShowStaircasePrompt(false)}
          canGoUp={currentFloor < 2}
          canGoDown={currentFloor > 0}
        />
      )}

      {/* Riddle popup */}
      {showRiddle && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white border-4 border-gray-800 p-8 rounded-lg max-w-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center font-serif">Ancient Riddle</h2>
            <div className="text-gray-800 text-lg leading-relaxed mb-6 font-serif italic text-center">
              <p className="mb-4">
                "In shadows deep where silence dwells,<br />
                A flame that flickers, truth it tells.<br />
                Not one, not two, but three you'll find,<br />
                Yet only one holds light divine."
              </p>
              <p className="mb-4">
                "The false ones dance with borrowed glow,<br />
                Their patterns strange, their shadows show.<br />
                But seek the one with natural grace,<br />
                Ascend above to find its place."
              </p>
              <p className="text-sm text-gray-600 mt-6">
                — Seek the true candle on the floor above
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowRiddle(false)}
                className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning popup */}
      {showWarning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-red-950 border-4 border-red-800 p-8 rounded-lg max-w-2xl shadow-2xl">
            <h2 className="text-4xl font-bold text-red-200 mb-6 text-center font-serif">⚠️ WARNING ⚠️</h2>
            <div className="text-red-100 text-lg leading-relaxed mb-6 font-serif">
              <p className="mb-4 text-center font-bold text-xl text-red-300">
                BEWARE THE NULL WRAITH
              </p>
              <p className="mb-3">
                To all who enter these halls, heed this warning most dire:
              </p>
              <p className="mb-3">
                A creature of shadow and void stalks these floors. Born from corrupted code and broken references, 
                <span className="font-bold text-red-300"> the Null Wraith</span> feeds on the light of false flames.
              </p>
              <p className="mb-3">
                It is drawn to deception, to the candles that burn with borrowed light. Should you choose wrongly, 
                the Wraith will manifest, and darkness will consume all.
              </p>
              <p className="mb-4 font-bold text-red-300 text-center">
                Choose wisely. Choose true. Your very existence depends upon it.
              </p>
              <p className="text-sm text-red-400 italic text-center">
                — Final entry, Librarian's Journal, Date Unknown
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowWarning(false)}
                className="px-6 py-3 bg-red-800 text-white rounded hover:bg-red-600 transition-colors font-semibold border-2 border-red-700"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirmation popup */}
      {showExitConfirm && (
        <Overlay title="Return to Hallway?">
          <p className="text-center mb-4">
            Are you sure you want to leave the Ancient Library?
          </p>
          <p className="text-center text-sm text-gray-400 mb-6">
            Your progress in this room will not be saved.
          </p>
          <div className="flex justify-center gap-3">
            <Button label="Yes, Leave" onClick={handleReturnToHallway} />
            <Button label="Stay" onClick={() => setShowExitConfirm(false)} />
          </div>
        </Overlay>
      )}

      {/* Intro overlay */}
      {showIntro && (
        <Overlay title="The Ancient Library">
          <p className="text-center mb-4">
            A vast three-floor library stretches before you, filled with forgotten knowledge.
          </p>
          <p className="text-center text-sm text-gray-400 mb-6">
            Move your mouse to look around the library. Click on the glowing staircases to travel between floors.
          </p>
          <div className="flex justify-center gap-3">
            <Button label="Explore Library" onClick={handleStartExploring} />
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}

      {/* Instructions hint - shows after intro is dismissed */}
      {!showIntro && (
        <div className="absolute bottom-4 left-4 text-white text-sm font-mono bg-black bg-opacity-70 p-3 rounded max-w-md">
          <div className="mb-1">🖱️ <strong>Move mouse</strong> to look around the library</div>
          <div className="mb-1">🌀 <strong>Approach glowing staircases</strong> to travel between floors</div>
          <div>📚 Explore all three floors of the ancient library</div>
        </div>
      )}
      
      {/* Failure screen */}
      {showFailure && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="bg-black border-4 border-red-900 p-12 rounded-lg shadow-2xl">
            <h2 className="text-6xl font-bold text-red-600 mb-6 text-center font-serif">YOU FAILED</h2>
            <p className="text-red-400 text-xl text-center font-serif mb-8">
              The Null Wraith has claimed another soul...
            </p>
            <div className="flex justify-center">
              <Button label="Return to Lobby" onClick={handleReturnToHallway} />
            </div>
          </div>
        </div>
      )}
      
      {/* Fade to black overlay */}
      {fadeToBlack > 0 && (
        <div 
          className="absolute inset-0 bg-black pointer-events-none z-40"
          style={{ opacity: fadeToBlack }}
        />
      )}
    </div>
  );
}
