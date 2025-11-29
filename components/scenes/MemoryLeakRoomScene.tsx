'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Scene3D from '@/components/Scene3D';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Torus, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';

// Phase types
type Phase = 'intro' | 'phase1_seal' | 'phase2_drag' | 'phase3_simon' | 'phase4_rotate' | 'phase5_ram' | 'complete';

// Phase instruction messages
const PHASE_MESSAGES: Record<Phase, { title: string; instruction: string }> = {
  intro: { title: '', instruction: '' },
  phase1_seal: { 
    title: 'PHASE 1: SEAL THE RIFTS',
    instruction: 'Find and seal all 5 red cracks around the room.\nClick and HOLD each for 2 seconds to seal them.'
  },
  phase2_drag: { 
    title: 'PHASE 2: RESTORE COMPONENTS',
    instruction: 'Match colored blocks to their holes.\nPurple: 4 blocks | Cyan: 3 blocks | Yellow: 4 blocks'
  },
  phase3_simon: { 
    title: 'PHASE 3: PATTERN RECOGNITION',
    instruction: 'Watch the orbs flash and repeat the pattern.\nRound 1: 3 orbs | Round 2: 5 orbs | Round 3: 7 orbs'
  },
  phase4_rotate: { 
    title: 'PHASE 4: ALIGN MEMORY BLOCKS',
    instruction: 'Click and drag to rotate the cyan blocks.\nMatch them to the white ghost outlines.'
  },
  phase5_ram: { 
    title: 'PHASE 5: FREE MEMORY',
    instruction: 'Click the yellow RAM blocks to free them.\nClear 15 blocks before memory reaches 100%!'
  },
  complete: { 
    title: 'MEMORY STABILIZED',
    instruction: 'Click the glowing door to exit.'
  }
};

// Memory Usage HUD Component
function MemoryUsageHUD({ usage }: { usage: number }) {
  const getColor = (usage: number) => {
    if (usage < 40) return '#00ff88';
    if (usage < 70) return '#ffaa00';
    return '#ff0000';
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-96 z-10">
      <div className="font-mono text-sm mb-1" style={{ color: getColor(usage) }}>
        MEMORY USAGE: {usage.toFixed(0).padStart(2, '0')}%
      </div>
      <div className="w-full h-2 bg-gray-800 border border-gray-600">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${usage}%`,
            backgroundColor: getColor(usage)
          }}
        />
      </div>
    </div>
  );
}

// Intro Text Overlay
function IntroOverlay({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-80"
    >
      <div className="text-center bg-gray-900 p-8 rounded-lg border-4 border-red-500 max-w-3xl">
        <h1 className="font-mono text-5xl text-red-400 mb-4 font-bold">THE MEMORY LEAK</h1>
        <p className="font-mono text-xl text-gray-300 mb-6">
          Something is consuming everything.<br />
          Patch it before it fills the room.
        </p>
        <div className="bg-gray-800 p-5 rounded border border-gray-700 mb-4">
          <p className="font-mono text-base text-cyan-400 mb-3 font-bold">CAMERA CONTROLS:</p>
          <div className="font-mono text-sm text-gray-300 space-y-2 text-left max-w-md mx-auto">
            <p>🖱️ <span className="text-yellow-400">Left Click + Drag</span> → Rotate camera around the room</p>
            <p>🖱️ <span className="text-yellow-400">Right Click + Drag</span> → Pan/move camera position</p>
            <p>🔄 <span className="text-yellow-400">Scroll Wheel</span> → Zoom in and out</p>
            <p>👆 <span className="text-yellow-400">Click Objects</span> → Interact with puzzles</p>
          </div>
        </div>
        <div className="bg-red-900 bg-opacity-30 p-3 rounded border border-red-700 mb-6">
          <p className="font-mono text-sm text-red-300">
            💡 TIP: Use your camera controls to look around and find interactive objects!
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-lg px-8 py-3 rounded border-2 border-cyan-400 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          I UNDERSTAND - START
        </button>
      </div>
    </div>
  );
}

// Phase Instructions
function PhaseInstructions({ phase }: { phase: Phase }) {
  const message = PHASE_MESSAGES[phase];
  if (!message.title) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 text-center z-10 bg-black bg-opacity-80 p-6 rounded-lg border-2 border-cyan-500 max-w-xl">
      <h2 className="font-mono text-2xl text-cyan-400 mb-3 font-bold">
        {message.title}
      </h2>
      <p className="font-mono text-base text-gray-300 whitespace-pre-line leading-relaxed">
        {message.instruction}
      </p>
      <div className="mt-3 text-xs text-gray-500 font-mono">
        Use mouse to look around • Click and drag objects to interact
      </div>
    </div>
  );
}

// Central Memory Core
function MemoryCore() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.z += delta * (0.2 + i * 0.1);
      });
    }
  });

  return (
    <group position={[0, 3, 0]}>
      {/* Main pillar */}
      <Cylinder args={[1, 1, 6, 8]}>
        <meshStandardMaterial color="#1a4d6d" emissive="#0088cc" emissiveIntensity={0.3} />
      </Cylinder>

      {/* Rotating rings */}
      <group ref={ringsRef}>
        {[0, 1, 2].map(i => (
          <Torus 
            key={i}
            args={[1.2 + i * 0.2, 0.1, 8, 16]} 
            position={[0, -2 + i * 2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0.5} />
          </Torus>
        ))}
      </group>

      {/* Data strips */}
      {Array.from({length: 8}).map((_, i) => {
        const angle = i * Math.PI / 4;
        return (
          <Box 
            key={i}
            args={[0.05, 5, 0.05]}
            position={[
              Math.cos(angle) * 1.1,
              0,
              Math.sin(angle) * 1.1
            ]}
          >
            <meshStandardMaterial emissive="#00ff88" emissiveIntensity={0.8} />
          </Box>
        );
      })}
    </group>
  );
}

// Floor Platform
function FloorPlatform() {
  return (
    <group>
      {/* Main platform */}
      <Cylinder args={[8, 8, 0.2, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Floor lights */}
      {Array.from({length: 16}).map((_, i) => {
        const angle = i * Math.PI / 8;
        return (
          <Sphere
            key={i}
            args={[0.1, 8, 8]}
            position={[
              Math.cos(angle) * 7,
              0.15,
              Math.sin(angle) * 7
            ]}
          >
            <meshStandardMaterial emissive="#0088ff" emissiveIntensity={1} />
          </Sphere>
        );
      })}

      {/* Consoles */}
      {Array.from({length: 4}).map((_, i) => {
        const angle = i * Math.PI / 2;
        return (
          <Box
            key={i}
            args={[0.8, 1.2, 0.4]}
            position={[
              Math.cos(angle) * 6,
              0.6,
              Math.sin(angle) * 6
            ]}
          >
            <meshStandardMaterial color="#2a2a3e" />
          </Box>
        );
      })}
    </group>
  );
}

// Octagonal Walls
function OctagonalWalls() {
  return (
    <group>
      {Array.from({length: 8}).map((_, i) => {
        const angle = i * Math.PI / 4;
        const radius = 10;
        const wallWidth = Math.sqrt(2 * radius * radius * (1 - Math.cos(Math.PI / 4)));
        
        return (
          <group key={i}>
            {/* Main wall segment */}
            <Box
              args={[wallWidth, 8, 0.5]}
              position={[
                Math.cos(angle + Math.PI / 8) * radius,
                4,
                Math.sin(angle + Math.PI / 8) * radius
              ]}
              rotation={[0, angle + Math.PI / 8, 0]}
            >
              <meshStandardMaterial color="#16213e" />
            </Box>

            {/* Vent grate */}
            <Box
              args={[1, 1, 0.1]}
              position={[
                Math.cos(angle) * 9.5,
                3,
                Math.sin(angle) * 9.5
              ]}
            >
              <meshStandardMaterial color="#0f3460" />
            </Box>

            {/* Status panel */}
            <Box
              args={[0.6, 0.4, 0.05]}
              position={[
                Math.cos(angle) * 9.5,
                5,
                Math.sin(angle) * 9.5
              ]}
            >
              <meshStandardMaterial 
                color="#001122" 
                emissive="#0088ff" 
                emissiveIntensity={0.2} 
              />
            </Box>
          </group>
        );
      })}
    </group>
  );
}

// Spawn Platform
function SpawnPlatform() {
  return (
    <group position={[0, 1.5, 8]}>
      {/* Platform */}
      <Box args={[2, 0.2, 2]}>
        <meshStandardMaterial color="#2a2a3e" metalness={0.6} />
      </Box>

      {/* Railings */}
      {[-1, 1].map(x => (
        <Box key={x} args={[0.1, 0.8, 2]} position={[x, 0.5, 0]}>
          <meshStandardMaterial color="#4a4a5e" />
        </Box>
      ))}
      <Box args={[2, 0.8, 0.1]} position={[0, 0.5, -1]}>
        <meshStandardMaterial color="#4a4a5e" />
      </Box>
    </group>
  );
}

// Phase 1: Wall Crack
interface WallCrackProps {
  isSealing: boolean;
  sealProgress: number;
  position: THREE.Vector3;
  rotation: [number, number, number];
  onPointerDown: () => void;
  onPointerUp: () => void;
  isHovered: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

function WallCrack({ isSealing, sealProgress, position, rotation, onPointerDown, onPointerUp, isHovered, onPointerEnter, onPointerLeave }: WallCrackProps) {
  const crackRef = useRef<THREE.Mesh>(null);
  
  // Pulse animation
  useFrame((state) => {
    if (crackRef.current && !isSealing) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      const material = crackRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = pulse;
    }
  });

  // Scale down as sealing progresses
  const scale = 1 - sealProgress * 0.8;

  return (
    <mesh
      ref={crackRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, 1]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <planeGeometry args={[0.8, 1.2]} />
      <meshStandardMaterial
        color="#ff0000"
        emissive="#ff4444"
        emissiveIntensity={isHovered ? 1.2 : 0.8}
        transparent
        opacity={0.6 * (1 - sealProgress)}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Phase 1: Crack Particles
function CrackParticles({ active, crackPosition }: { active: boolean; crackPosition: THREE.Vector3 }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 250;
  const velocitiesRef = useRef<Float32Array>(new Float32Array(particleCount * 3));

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    const velocities = velocitiesRef.current;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = crackPosition.x + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = crackPosition.y + (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 2] = crackPosition.z + (Math.random() - 0.5) * 0.4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }, [crackPosition]);

  useFrame((state, delta) => {
    if (!particlesRef.current || !active) return;
    if (!particlesRef.current.geometry.attributes.position) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Reset if too far
      const dx = positions[i * 3] - crackPosition.x;
      const dy = positions[i * 3 + 1] - crackPosition.y;
      const dz = positions[i * 3 + 2] - crackPosition.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > 2) {
        positions[i * 3] = crackPosition.x + (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 1] = crackPosition.y + (Math.random() - 0.5) * 0.6;
        positions[i * 3 + 2] = crackPosition.z + (Math.random() - 0.5) * 0.4;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color="#ff8888" transparent opacity={0.8} />
    </points>
  );
}

// Phase 1: Flickering Objects
function FlickeringObjects({ active, crackPosition }: { active: boolean; crackPosition: THREE.Vector3 }) {
  const objects = [
    { id: 1, basePos: new THREE.Vector3(6, 1, -4), offset: new THREE.Vector3(0.2, 0.1, 0.15) },
    { id: 2, basePos: new THREE.Vector3(7.5, 2, -5.5), offset: new THREE.Vector3(0.15, 0.2, 0.1) },
    { id: 3, basePos: new THREE.Vector3(6.5, 1.5, -6), offset: new THREE.Vector3(0.1, 0.15, 0.2) },
  ];

  const [flickerStates, setFlickerStates] = useState(objects.map(() => false));

  useEffect(() => {
    if (!active) {
      setFlickerStates(objects.map(() => false));
      return;
    }

    const intervals = objects.map((_, i) => {
      return setInterval(() => {
        setFlickerStates(prev => {
          const newStates = [...prev];
          newStates[i] = !newStates[i];
          return newStates;
        });
      }, 100 + Math.random() * 200);
    });

    return () => intervals.forEach(clearInterval);
  }, [active]);

  if (!active) return null;

  return (
    <>
      {objects.map((obj, i) => {
        const pos = flickerStates[i]
          ? obj.basePos.clone().add(obj.offset)
          : obj.basePos;

        return (
          <Box
            key={obj.id}
            args={[0.5, 0.5, 0.5]}
            position={[pos.x, pos.y, pos.z]}
          >
            <meshStandardMaterial 
              color="#888888" 
              emissive={flickerStates[i] ? "#ff4444" : "#000000"}
              emissiveIntensity={flickerStates[i] ? 0.3 : 0}
            />
          </Box>
        );
      })}
    </>
  );
}

// Progress Ring for Click & Hold
function ProgressRing({ progress, position, rotation }: { progress: number; position: THREE.Vector3; rotation: [number, number, number] }) {
  if (progress === 0) return null;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.05]}>
        <ringGeometry args={[0.5, 0.65, 32, 1, 0, Math.PI * 2 * progress]} />
        <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      {/* Outer glow ring */}
      <mesh position={[0, 0, 0.04]}>
        <ringGeometry args={[0.65, 0.75, 32]} />
        <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Phase 2: Floor Hole Portal
interface FloorHoleProps {
  position: THREE.Vector3;
  color: string;
  isFilled: boolean;
}

function FloorHole({ position, color, isFilled }: FloorHoleProps) {
  const holeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  // Initialize static particles
  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);

  // Animate static particles
  useFrame((state) => {
    if (!particlesRef.current) return;
    if (!particlesRef.current.geometry.attributes.position) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3 + 0.2;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Pulse hole
    if (holeRef.current && !isFilled) {
      const material = holeRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.5;
    }
  });

  const scale = isFilled ? 0 : 1;

  return (
    <group position={position}>
      {/* Hole */}
      <mesh ref={holeRef} rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, 1]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Static particles */}
      {!isFilled && (
        <points ref={particlesRef} position={[0, 0, 0]}>
          <bufferGeometry />
          <pointsMaterial size={0.04} color={color} transparent opacity={0.8} />
        </points>
      )}
    </group>
  );
}

// Phase 2: Draggable Component
interface DraggableComponentProps {
  id: string;
  position: THREE.Vector3;
  color: string;
  isLocked: boolean;
  isDragging: boolean;
  onPointerDown: (id: string) => void;
}

function DraggableComponent({ id, position, color, isLocked, isDragging, onPointerDown }: DraggableComponentProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Pulse animation when not locked
  useFrame((state) => {
    if (meshRef.current && !isLocked) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + id.charCodeAt(0)) * 0.05 + 0.95;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={() => !isLocked && onPointerDown(id)}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={isLocked ? "#00ff00" : (isDragging ? "#ffffff" : color)}
        emissive={isLocked ? "#00ff00" : color}
        emissiveIntensity={isLocked ? 0.8 : (isDragging ? 0.8 : 0.6)}
      />
    </mesh>
  );
}

// Phase 3: Audio tone generator with persistent context
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
      return null;
    }
  }
  
  // Resume context if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

function playTone(frequency: number, duration: number = 200) {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    console.warn('Error playing tone:', e);
  }
}

// Phase 3: Secondary Core Housing
interface SecondaryCoreProps {
  glitchIntensity: number;
  isComplete: boolean;
  round: number;
}

function SecondaryCore({ glitchIntensity, isComplete, round }: SecondaryCoreProps) {
  const haloRef = useRef<THREE.Mesh>(null);
  const platformRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (haloRef.current && !isComplete) {
      haloRef.current.rotation.z += 0.02;
      const material = haloRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = glitchIntensity * (Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.7);
    }
    
    if (platformRef.current && !isComplete) {
      platformRef.current.rotation.y += 0.01;
    }
  });

  const scale = isComplete ? 0 : 1;
  const roundColor = round === 1 ? '#00ff00' : round === 2 ? '#ffaa00' : '#ff0000';

  return (
    <group position={[0, 7.5, 0]} scale={[1.5, 1.5, 1.5]}>
      {/* Floating platform */}
      <mesh ref={platformRef}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Tech details on platform */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <Box
            key={i}
            args={[0.1, 0.1, 0.05]}
            position={[
              Math.cos(angle) * 1.0,
              0.15,
              Math.sin(angle) * 1.0
            ]}
          >
            <meshStandardMaterial emissive="#0088ff" emissiveIntensity={0.5} />
          </Box>
        );
      })}

      {/* Glitchy halo */}
      <mesh ref={haloRef} position={[0, 0, 0]} scale={[scale, scale, 1]}>
        <torusGeometry args={[1.3, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={glitchIntensity}
          transparent
          opacity={0.7 * scale}
        />
      </mesh>
      
      {/* Round indicator */}
      {!isComplete && (
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.05]} />
          <meshStandardMaterial
            color={roundColor}
            emissive={roundColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

// Phase 3: Simon Orb
interface SimonOrbProps {
  id: string;
  position: THREE.Vector3;
  color: string;
  frequency: number;
  isFlashing: boolean;
  isComplete: boolean;
  isCorrect: boolean;
  onClick: (id: string) => void;
}

function SimonOrb({ id, position, color, frequency, isFlashing, isComplete, isCorrect, onClick }: SimonOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [showCorrect, setShowCorrect] = useState(false);

  useEffect(() => {
    if (isCorrect) {
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 300);
    }
  }, [isCorrect]);

  useFrame((state) => {
    if (meshRef.current && !isComplete) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      if (showCorrect) {
        material.color.setHex(0x00ff00);
        material.emissive.setHex(0x00ff00);
        material.emissiveIntensity = 2.5;
      } else {
        material.color.set(color);
        material.emissive.set(color);
        material.emissiveIntensity = isFlashing ? 2.5 : 1.0;
        
        // Pulse when not flashing
        if (!isFlashing) {
          const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1.0;
          material.emissiveIntensity = pulse;
        }
      }
    }
    
    if (glowRef.current && !isComplete) {
      const scale = (isFlashing || showCorrect) ? 1.5 : 1.0;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const finalColor = isComplete ? "#00ffff" : color;

  return (
    <group position={position} scale={[1.5, 1.5, 1.5]}>
      {/* Main orb */}
      <mesh
        ref={meshRef}
        onPointerDown={() => onClick(id)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={finalColor}
          emissive={finalColor}
          emissiveIntensity={isFlashing ? 2.5 : (isComplete ? 1.2 : 1.0)}
        />
      </mesh>
      
      {/* Glow sphere */}
      {!isComplete && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial
            color={showCorrect ? "#00ff00" : color}
            transparent
            opacity={(isFlashing || showCorrect) ? 0.6 : 0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// Phase 4: Memory Block
interface MemoryBlockProps {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  targetRotation: THREE.Euler;
  isAligned: boolean;
  isRotating: boolean;
  isAbsorbing: boolean;
  onPointerDown: (id: string, event: any) => void;
}

function MemoryBlock({ id, position, rotation, targetRotation, isAligned, isRotating, isAbsorbing, onPointerDown }: MemoryBlockProps) {
  const groupRef = useRef<THREE.Group>(null);
  const jitterOffset = useRef({ x: 0, y: 0, z: 0 });
  const [proximity, setProximity] = useState(0);

  useFrame((state) => {
    if (groupRef.current && !isAligned && !isAbsorbing) {
      // Jitter animation
      jitterOffset.current.x = Math.sin(state.clock.elapsedTime * 5 + parseInt(id)) * 0.02;
      jitterOffset.current.y = Math.sin(state.clock.elapsedTime * 7 + parseInt(id)) * 0.02;
      jitterOffset.current.z = Math.sin(state.clock.elapsedTime * 6 + parseInt(id)) * 0.02;
      
      groupRef.current.position.set(
        position.x + jitterOffset.current.x,
        position.y + jitterOffset.current.y,
        position.z + jitterOffset.current.z
      );

      // Calculate proximity to target rotation
      const normalizeAngle = (angle: number) => {
        let normalized = angle % (Math.PI * 2);
        if (normalized > Math.PI) normalized = Math.PI * 2 - normalized;
        if (normalized < 0) normalized = -normalized;
        return normalized;
      };

      const diffX = normalizeAngle(Math.abs(rotation.x - targetRotation.x));
      const diffY = normalizeAngle(Math.abs(rotation.y - targetRotation.y));
      const diffZ = normalizeAngle(Math.abs(rotation.z - targetRotation.z));
      const avgDiff = (diffX + diffY + diffZ) / 3;
      
      // Convert to 0-1 range (0 = perfect, 1 = far)
      const proximityValue = Math.min(avgDiff / 2.0, 1);
      setProximity(1 - proximityValue); // Invert so 1 = close, 0 = far
    } else if (groupRef.current) {
      groupRef.current.position.copy(position);
    }
  });

  const scale = isAbsorbing ? 0 : 1;
  
  // Color shifts from cyan to green as you get closer
  const getProximityColor = () => {
    if (isAligned) return "#00ff00"; // Aligned - bright green
    if (proximity > 0.8) return "#00ff00"; // Almost there - green (will snap)
    if (proximity > 0.6) return "#88ff00"; // Very close - yellow-green
    if (proximity > 0.4) return "#44dd00"; // Close - lime
    return "#00aaff"; // Far - cyan
  };

  return (
    <group ref={groupRef} position={position}>
      <group rotation={rotation} scale={[scale, scale, scale]}>
        {/* Main block */}
        <mesh onPointerDown={(e) => !isAligned && !isAbsorbing && onPointerDown(id, e)}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color={getProximityColor()}
            emissive={getProximityColor()}
            emissiveIntensity={isAligned ? 0.8 : (isRotating ? 0.5 : 0.3 + proximity * 0.3)}
          />
        </mesh>

        {/* Glowing edge lines */}
        {!isAligned && (
          <>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.65, 0.05, 0.05]} />
              <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.05, 0.65, 0.05]} />
              <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.65]} />
              <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
            </mesh>
          </>
        )}
      </group>

      {/* Ghost outline */}
      {!isAligned && !isAbsorbing && (
        <mesh rotation={targetRotation}>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// Phase 5: Enhanced Core for Finale
interface FinaleCoreProps {
  pulseIntensity: number;
  isCalm: boolean;
}

function FinaleCore({ pulseIntensity, isCalm }: FinaleCoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      if (isCalm) {
        material.color.setHex(0x1a4d6d);
        material.emissive.setHex(0x0088cc);
        material.emissiveIntensity = Math.sin(state.clock.elapsedTime) * 0.1 + 0.3;
      } else {
        material.color.setHex(0xff0000);
        material.emissive.setHex(0xff0000);
        material.emissiveIntensity = pulseIntensity;
        
        // Shake effect
        coreRef.current.position.x = Math.sin(state.clock.elapsedTime * 20) * 0.05;
        coreRef.current.position.z = Math.cos(state.clock.elapsedTime * 20) * 0.05;
      }
    }

    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.z += delta * (isCalm ? 0.2 + i * 0.1 : 0.5 + i * 0.2);
      });
    }
  });

  return (
    <group position={[0, 3, 0]}>
      <mesh ref={coreRef}>
        <cylinderGeometry args={[1, 1, 6, 8]} />
        <meshStandardMaterial />
      </mesh>

      <group ref={ringsRef}>
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[0, -2 + i * 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.2 + i * 0.2, 0.1, 8, 16]} />
            <meshStandardMaterial emissive={isCalm ? "#00ffff" : "#ff0000"} emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Phase 5: RAM Block
interface RAMBlockProps {
  id: string;
  position: THREE.Vector3;
  isClearing: boolean;
  onClick: (id: string) => void;
}

function RAMBlock({ id, position, isClearing, onClick }: RAMBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      if (isClearing) {
        // Shrink and fade when clearing
        setScale(prev => Math.max(0, prev - 0.05));
      } else {
        // Pulse animation
        const pulse = Math.sin(state.clock.elapsedTime * 4 + parseInt(id.split('-')[1] || '0')) * 0.05 + 0.95;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  if (scale <= 0) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => !isClearing && onClick(id)}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={isClearing ? "#00ff00" : "#ffdd00"}
        emissive={isClearing ? "#00ff00" : "#ffdd00"}
        emissiveIntensity={isClearing ? 1.5 : 1.0}
        transparent
        opacity={isClearing ? scale : 1}
      />
    </mesh>
  );
}

// Phase 5: Cleared Blocks Counter Display
function ClearedBlocksDisplay({ cleared, target }: { cleared: number; target: number }) {
  return (
    <group position={[0, 6, 0]}>
      <mesh>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.8, 0.6]} />
        <meshBasicMaterial color="#ffdd00" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Exit Door
function ExitDoor({ onClick }: { onClick: () => void }) {
  const doorRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = 0;
    }
    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);

  useFrame((state) => {
    if (doorRef.current) {
      // Gentle pulse
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
      doorRef.current.scale.set(pulse, pulse, 1);
    }

    if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.01;
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 2, -9.5]}>
      {/* Door frame */}
      <group ref={doorRef}>
        <mesh>
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial
            color="#000000"
            emissive="#0088ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Glowing outline */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[2.1, 3.1, 0.05]} />
          <meshBasicMaterial
            color="#00ffff"
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Clickable area */}
        <mesh onPointerDown={onClick}>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Particles around door */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} />
      </points>
    </group>
  );
}

// Ceiling particles
function CeilingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 2 + 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    if (!particlesRef.current.geometry.attributes.position) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] -= delta * 0.2;
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 9;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial size={0.03} color="#4488aa" transparent opacity={0.4} />
    </points>
  );
}

// Main Scene Content
interface MemoryLeakRoomContentProps {
  currentPhase: Phase;
  onPhaseComplete: (nextPhase: Phase) => void;
  onMemoryChange: (delta: number) => void;
  onRedFlash: () => void;
  onGreenFlash: () => void;
  onExit: () => void;
  memoryUsage: number;
}

function MemoryLeakRoomContent({ currentPhase, onPhaseComplete, onMemoryChange, onRedFlash, onGreenFlash, onExit, memoryUsage }: MemoryLeakRoomContentProps) {
  // Phase 1 state
  const cracks = [
    { id: '1', position: new THREE.Vector3(8.5, 3, -3), rotation: [0, -Math.PI / 6, 0] as [number, number, number] },
    { id: '2', position: new THREE.Vector3(-8.5, 4, 2), rotation: [0, Math.PI / 6, 0] as [number, number, number] },
    { id: '3', position: new THREE.Vector3(6, 5, 7), rotation: [0, -Math.PI / 4, 0] as [number, number, number] },
    { id: '4', position: new THREE.Vector3(-6, 2.5, -6), rotation: [0, Math.PI / 4, 0] as [number, number, number] },
    { id: '5', position: new THREE.Vector3(2, 6, -9), rotation: [0, 0, 0] as [number, number, number] },
  ];
  const [cracksState, setCracksState] = useState(
    cracks.map(c => ({ id: c.id, isSealed: false, sealProgress: 0, isSealing: false, isHovered: false }))
  );
  const [phase1Complete, setPhase1Complete] = useState(false);
  const sealStartTimeRef = useRef<{ [key: string]: number | null }>({});

  // Phase 2 state
  const holes = [
    { id: 'purple', position: new THREE.Vector3(3, 0.1, -3), color: '#8800ff', capacity: 4 },
    { id: 'cyan', position: new THREE.Vector3(-3, 0.1, 3), color: '#00ffff', capacity: 3 },
    { id: 'yellow', position: new THREE.Vector3(4, 0.1, 2), color: '#ffff00', capacity: 4 },
  ];
  
  const getRandomFloorPosition = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 2 + Math.random() * 3.5;
    return new THREE.Vector3(
      Math.cos(angle) * distance,
      0.3,
      Math.sin(angle) * distance
    );
  };
  
  // Generate blocks for each hole
  const generateInitialBlocks = () => {
    const blocks: Array<{
      id: string;
      color: string;
      position: THREE.Vector3;
      isLocked: boolean;
      isDragging: boolean;
      targetHole: string;
    }> = [];
    
    holes.forEach(hole => {
      for (let i = 0; i < hole.capacity; i++) {
        blocks.push({
          id: `${hole.id}-${i}`,
          color: hole.color,
          position: getRandomFloorPosition(),
          isLocked: false,
          isDragging: false,
          targetHole: hole.id,
        });
      }
    });
    
    return blocks;
  };
  
  const [components, setComponents] = useState(generateInitialBlocks());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [phase2Complete, setPhase2Complete] = useState(false);
  const [holeSealProgress, setHoleSealProgress] = useState(0);
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Phase 3 state
  const secondaryCorePosition = new THREE.Vector3(0, 7.5, 0);
  const orbs = [
    { id: 'red', color: '#ff0000', frequency: 261.63, position: new THREE.Vector3(-1.2, 7.5, 0) },
    { id: 'blue', color: '#0000ff', frequency: 329.63, position: new THREE.Vector3(-0.6, 8, 0) },
    { id: 'green', color: '#00ff00', frequency: 392.00, position: new THREE.Vector3(0, 8.3, 0) },
    { id: 'yellow', color: '#ffff00', frequency: 440.00, position: new THREE.Vector3(0.6, 8, 0) },
    { id: 'purple', color: '#ff00ff', frequency: 493.88, position: new THREE.Vector3(1.2, 7.5, 0) },
  ];
  const [pattern, setPattern] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(-1);
  const [phase3Complete, setPhase3Complete] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0.8);
  const [simonRound, setSimonRound] = useState(1); // Track which round (1=3 orbs, 2=5 orbs, 3=7 orbs)
  const [correctOrbId, setCorrectOrbId] = useState<string | null>(null);
  const patternIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Phase 4 state
  const [memoryBlocks, setMemoryBlocks] = useState([
    {
      id: '1',
      position: new THREE.Vector3(3, 1, 3),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      targetRotation: new THREE.Euler(0, 0, 0),
      isAligned: false,
      isRotating: false,
      isAbsorbing: false,
    },
    {
      id: '2',
      position: new THREE.Vector3(-3, 3, -2),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      targetRotation: new THREE.Euler(Math.PI / 4, Math.PI / 4, 0),
      isAligned: false,
      isRotating: false,
      isAbsorbing: false,
    },
    {
      id: '3',
      position: new THREE.Vector3(4, 5, -3),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      targetRotation: new THREE.Euler(0, Math.PI / 2, Math.PI / 4),
      isAligned: false,
      isRotating: false,
      isAbsorbing: false,
    },
  ]);
  const [rotatingBlockId, setRotatingBlockId] = useState<string | null>(null);
  const [phase4Complete, setPhase4Complete] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Phase 5 state
  const [ramBlocks, setRamBlocks] = useState<Array<{
    id: string;
    position: THREE.Vector3;
    isClearing: boolean;
  }>>([]);
  const [phase5Complete, setPhase5Complete] = useState(false);
  const [corePulseIntensity, setCorePulseIntensity] = useState(0.5);
  const [isCoreCalm, setIsCoreCalm] = useState(false);
  const [memoryIncreaseRate, setMemoryIncreaseRate] = useState(3); // % per second (balanced challenge)
  const [clearedBlocks, setClearedBlocks] = useState(0);
  const TARGET_CLEARS = 15;
  const lastSpawnTime = useRef(Date.now());
  const nextRAMId = useRef(1);

  // Phase 1: Click and hold mechanic
  const handleCrackPointerDown = (crackId: string) => {
    if (currentPhase !== 'phase1_seal' || phase1Complete) return;
    const crack = cracksState.find(c => c.id === crackId);
    if (crack?.isSealed) return;
    
    playTone(200, 50); // Start sealing sound
    
    setCracksState(prev => prev.map(c => 
      c.id === crackId ? { ...c, isSealing: true } : c
    ));
    sealStartTimeRef.current[crackId] = Date.now();
  };

  const handleCrackPointerUp = (crackId: string) => {
    const crack = cracksState.find(c => c.id === crackId);
    if (!crack?.isSealing) return;
    
    playTone(150, 100); // Release sound (failure)
    
    setCracksState(prev => prev.map(c => 
      c.id === crackId ? { ...c, isSealing: false, sealProgress: 0 } : c
    ));
    sealStartTimeRef.current[crackId] = null;
  };

  // Phase 1: Progress tracking
  useFrame(() => {
    if (currentPhase === 'phase1_seal' && !phase1Complete) {
      let updated = false;
      const newState = cracksState.map(crack => {
        if (crack.isSealing && sealStartTimeRef.current[crack.id]) {
          const elapsed = Date.now() - sealStartTimeRef.current[crack.id]!;
          const progress = Math.min(elapsed / 2000, 1); // 2 seconds to seal
          
          if (progress >= 1 && !crack.isSealed) {
            updated = true;
            onMemoryChange(-3); // Reduce memory by 3% per crack (5 cracks = 15% total)
            playTone(523.25, 200); // Seal sound
            return { ...crack, isSealed: true, isSealing: false, sealProgress: 1 };
          }
          
          return { ...crack, sealProgress: progress };
        }
        return crack;
      });
      
      if (updated) {
        setCracksState(newState);
        
        // Check if all sealed
        if (newState.every(c => c.isSealed)) {
          setPhase1Complete(true);
          playTone(659.25, 300); // Phase complete sound (E5)
          setTimeout(() => playTone(783.99, 400), 200); // Victory fanfare (G5)
          setTimeout(() => {
            onPhaseComplete('phase2_drag');
          }, 1000);
        }
      } else {
        // Update progress for sealing cracks
        const progressUpdated = cracksState.some((crack, i) => 
          crack.isSealing && crack.sealProgress !== newState[i].sealProgress
        );
        if (progressUpdated) {
          setCracksState(newState);
        }
      }
    }
  });

  // Handle intro dismissal
  const handleIntroDismiss = () => {
    onPhaseComplete('phase1_seal');
  };

  // Phase 2: Drag handlers with improved mechanics
  const handleComponentPointerDown = (id: string) => {
    if (currentPhase !== 'phase2_drag' || phase2Complete) return;
    playTone(349.23, 50); // Pickup sound (F4)
    setDraggedId(id);
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, isDragging: true } : c
    ));
  };

  const handlePointerMove = (event: any) => {
    if (!draggedId || currentPhase !== 'phase2_drag') return;

    // Use a higher plane for smoother dragging
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
    const intersectionPoint = new THREE.Vector3();
    raycaster.current.setFromCamera(event.pointer, event.camera);
    raycaster.current.ray.intersectPlane(dragPlane, intersectionPoint);

    if (intersectionPoint) {
      // Clamp to bounds
      intersectionPoint.x = Math.max(-6, Math.min(6, intersectionPoint.x));
      intersectionPoint.z = Math.max(-6, Math.min(6, intersectionPoint.z));
      
      setComponents(prev => prev.map(c => 
        c.id === draggedId ? { ...c, position: intersectionPoint.clone() } : c
      ));
    }
  };

  const handlePointerUp = () => {
    if (!draggedId) return;

    // Check if near correct hole
    const component = components.find(c => c.id === draggedId);
    if (component) {
      const targetHole = holes.find(h => h.id === component.targetHole);
      
      if (targetHole) {
        const distance = component.position.distanceTo(targetHole.position);
        
        if (distance < 1.0) { // Increased snap distance for easier placement
          // Count how many blocks are already in this hole
          const blocksInHole = components.filter(c => 
            c.targetHole === targetHole.id && c.isLocked
          ).length;
          
          // Calculate stacking position
          const stackHeight = blocksInHole * 0.5;
          const lockPosition = targetHole.position.clone();
          lockPosition.y += stackHeight;
          
          // Lock component in correct hole
          setComponents(prev => prev.map(c => 
            c.id === draggedId 
              ? { ...c, position: lockPosition, isLocked: true, isDragging: false }
              : c
          ));
          playTone(523.25 + blocksInHole * 50, 200); // Higher pitch for each block
          onMemoryChange(-1); // Reduce 1% per block (11 blocks = 11% total)
        } else {
          // Release without locking
          playTone(293.66, 100); // Drop sound (D4)
          setComponents(prev => prev.map(c => 
            c.id === draggedId ? { ...c, isDragging: false } : c
          ));
        }
      }
    }

    setDraggedId(null);
  };

  // Phase 2: Check completion
  useEffect(() => {
    if (currentPhase === 'phase2_drag' && !phase2Complete) {
      const allLocked = components.every(c => c.isLocked);
      if (allLocked) {
        setPhase2Complete(true);
        playTone(659.25, 300); // Phase complete sound
        setTimeout(() => playTone(783.99, 400), 200); // Victory fanfare
        setTimeout(() => playTone(880, 500), 400); // Final note (A5)
        
        setTimeout(() => {
          onPhaseComplete('phase3_simon');
        }, 1000);
      }
    }
  }, [components, currentPhase, phase2Complete, onPhaseComplete]);

  // Phase 2: Drift components randomly
  useFrame((state, delta) => {
    if (currentPhase === 'phase2_drag' && !phase2Complete) {
      setComponents(prev => prev.map(c => {
        if (c.isLocked || c.isDragging) return c;
        
        // Random drift direction
        const driftAngle = state.clock.elapsedTime * 0.5 + c.id.charCodeAt(0);
        const driftX = Math.sin(driftAngle) * delta * 0.3;
        const driftZ = Math.cos(driftAngle) * delta * 0.3;
        
        const newPos = c.position.clone().add(new THREE.Vector3(driftX, 0, driftZ));
        
        // Keep within bounds (radius 6)
        const distFromCenter = Math.sqrt(newPos.x * newPos.x + newPos.z * newPos.z);
        if (distFromCenter < 6) {
          return { ...c, position: newPos };
        } else {
          // Bounce back toward center
          const bounceDir = newPos.clone().normalize().multiplyScalar(-1);
          return { ...c, position: c.position.clone().add(bounceDir.multiplyScalar(delta * 0.5)) };
        }
      }));
    }
  });

  // Phase 3: Generate pattern when phase starts and repeat every 5 seconds
  useEffect(() => {
    if (currentPhase === 'phase3_simon' && pattern.length === 0) {
      const patternLength = simonRound === 1 ? 3 : simonRound === 2 ? 5 : 7;
      const newPattern = Array.from({ length: patternLength }, () => 
        orbs[Math.floor(Math.random() * orbs.length)].id
      );
      setPattern(newPattern);
      
      // Play pattern after short delay
      setTimeout(() => {
        playPattern(newPattern);
      }, 1000);
    }
    
    // Set up repeating pattern playback with different intervals per round
    if (currentPhase === 'phase3_simon' && pattern.length > 0 && !phase3Complete) {
      const repeatInterval = simonRound === 1 ? 6000 : simonRound === 2 ? 10000 : 12000;
      
      patternIntervalRef.current = setInterval(() => {
        if (!isPlaying) {
          playPattern(pattern);
        }
      }, repeatInterval);
      
      return () => {
        if (patternIntervalRef.current) {
          clearInterval(patternIntervalRef.current);
        }
      };
    }
  }, [currentPhase, pattern, phase3Complete, isPlaying, simonRound]);

  // Phase 3: Play pattern sequence
  const playPattern = async (patternToPlay: string[]) => {
    setIsPlaying(true);
    setPlayerInput([]);
    
    for (let i = 0; i < patternToPlay.length; i++) {
      setCurrentFlashIndex(i);
      const orb = orbs.find(o => o.id === patternToPlay[i]);
      if (orb) playTone(orb.frequency, 400);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentFlashIndex(-1);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsPlaying(false);
  };

  // Phase 3: Handle orb click
  const handleOrbClick = (orbId: string) => {
    if (isPlaying || currentPhase !== 'phase3_simon' || phase3Complete) return;
    
    const orb = orbs.find(o => o.id === orbId);
    if (orb) playTone(orb.frequency, 200);
    
    const newInput = [...playerInput, orbId];
    setPlayerInput(newInput);
    
    // Check if correct
    if (newInput[newInput.length - 1] !== pattern[newInput.length - 1]) {
      // Wrong!
      handleMistake();
    } else {
      // Correct so far - flash green
      setCorrectOrbId(orbId);
      setTimeout(() => setCorrectOrbId(null), 300);
      
      if (newInput.length === pattern.length) {
        // Complete!
        handlePatternSuccess();
      }
    }
  };

  // Phase 3: Handle mistake
  const handleMistake = () => {
    setGlitchIntensity(1.5);
    onMemoryChange(5); // Spike memory by 5%
    onRedFlash(); // Flash screen red
    playTone(100, 150); // Glitch noise (low frequency)
    setTimeout(() => playTone(80, 150), 100); // Double glitch
    setTimeout(() => playTone(120, 200), 200); // Error sound
    
    // Reset glitch intensity
    setTimeout(() => {
      setGlitchIntensity(0.8);
    }, 300);
    
    // Reset and replay pattern
    setTimeout(() => {
      setPlayerInput([]);
      playPattern(pattern);
    }, 1000);
  };

  // Phase 3: Handle success
  const handlePatternSuccess = () => {
    // Clear interval
    if (patternIntervalRef.current) {
      clearInterval(patternIntervalRef.current);
    }
    
    if (simonRound < 3) {
      // Move to next round - flash green
      onGreenFlash();
      
      setSimonRound(prev => prev + 1);
      setPattern([]);
      setPlayerInput([]);
      setGlitchIntensity(Math.max(0.3, glitchIntensity - 0.2));
      onMemoryChange(-3.33); // Reduce memory (total 10% across 3 rounds)
      playTone(587.33, 200); // Round complete sound (D5)
      setTimeout(() => playTone(659.25, 200), 150); // Ascending tone
      setTimeout(() => playTone(783.99, 300), 300); // Victory tone
    } else {
      // All rounds complete! - flash green
      onGreenFlash();
      
      setPhase3Complete(true);
      setGlitchIntensity(0);
      onMemoryChange(-3.34); // Final reduction (total 10% across 3 rounds)
      playTone(523.25, 200); // Victory fanfare (C5)
      setTimeout(() => playTone(659.25, 200), 150); // E5
      setTimeout(() => playTone(783.99, 200), 300); // G5
      setTimeout(() => playTone(1046.50, 400), 450); // C6 - triumphant!
      
      // Transition to next phase
      setTimeout(() => {
        onPhaseComplete('phase4_rotate');
      }, 1500);
    }
  };

  // Phase 4: Handle block pointer down
  const handleBlockPointerDown = (id: string, event: any) => {
    if (currentPhase !== 'phase4_rotate' || phase4Complete) return;
    
    setRotatingBlockId(id);
    setMemoryBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, isRotating: true } : b
    ));
    
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  };

  // Phase 4: Handle pointer move for rotation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePointerMove = (event: MouseEvent) => {
      if (!rotatingBlockId || currentPhase !== 'phase4_rotate') return;

      const deltaX = event.clientX - lastMousePos.current.x;
      const deltaY = event.clientY - lastMousePos.current.y;

      setMemoryBlocks(prev => prev.map(b => {
        if (b.id === rotatingBlockId && !b.isAligned) {
          const newRotation = new THREE.Euler(
            b.rotation.x + deltaY * 0.008, // Even faster rotation for easier control
            b.rotation.y + deltaX * 0.008, // Even faster rotation for easier control
            b.rotation.z
          );
          return { ...b, rotation: newRotation };
        }
        return b;
      }));

      lastMousePos.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = () => {
      if (!rotatingBlockId) return;

      // Check alignment
      const block = memoryBlocks.find(b => b.id === rotatingBlockId);
      if (block && !block.isAligned) {
        const rotDiff = {
          x: Math.abs(block.rotation.x - block.targetRotation.x),
          y: Math.abs(block.rotation.y - block.targetRotation.y),
          z: Math.abs(block.rotation.z - block.targetRotation.z),
        };

        // Normalize to 0-π range (shortest angle)
        const normalizeAngle = (angle: number) => {
          let normalized = angle % (Math.PI * 2);
          if (normalized > Math.PI) normalized = Math.PI * 2 - normalized;
          if (normalized < 0) normalized = -normalized;
          return normalized;
        };

        const threshold = 3.14; // Extremely forgiving - almost any orientation works (full 180 degrees)
        const diffX = normalizeAngle(rotDiff.x);
        const diffY = normalizeAngle(rotDiff.y);
        const diffZ = normalizeAngle(rotDiff.z);
        
        if (diffX < threshold && diffY < threshold && diffZ < threshold) {
          // Aligned!
          setMemoryBlocks(prev => prev.map(b =>
            b.id === rotatingBlockId
              ? { ...b, rotation: block.targetRotation, isAligned: true, isRotating: false }
              : b
          ));
          onMemoryChange(-5); // Reduce 5% per block (3 blocks = 15% total)
          playTone(587.33, 200); // Snap sound (D5)
        } else {
          setMemoryBlocks(prev => prev.map(b =>
            b.id === rotatingBlockId ? { ...b, isRotating: false } : b
          ));
        }
      }

      setRotatingBlockId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [rotatingBlockId, memoryBlocks, currentPhase, phase4Complete]);

  // Phase 4: Check completion
  useEffect(() => {
    if (currentPhase === 'phase4_rotate' && !phase4Complete) {
      const allAligned = memoryBlocks.every(b => b.isAligned);
      if (allAligned) {
        setPhase4Complete(true);
        playTone(659.25, 300); // Success sound (E5)
        setTimeout(() => playTone(783.99, 400), 200); // Victory fanfare (G5)
        setTimeout(() => playTone(880, 500), 400); // Final note (A5)

        // Animate blocks sliding to core
        const corePosition = new THREE.Vector3(0, 3, 0);
        let progress = 0;
        const absorptionInterval = setInterval(() => {
          progress += 0.05;
          
          setMemoryBlocks(prev => prev.map(b => {
            const startPos = new THREE.Vector3(b.position.x, b.position.y, b.position.z);
            const newPos = startPos.lerp(corePosition, progress);
            return {
              ...b,
              position: newPos,
              isAbsorbing: progress > 0.5,
            };
          }));

          if (progress >= 1) {
            clearInterval(absorptionInterval);
            setTimeout(() => {
              onPhaseComplete('phase5_ram');
            }, 500);
          }
        }, 50);
      }
    }
  }, [memoryBlocks, currentPhase, phase4Complete, onMemoryChange, onPhaseComplete]);

  // Phase 5: Initialize RAM blocks when phase starts
  useEffect(() => {
    if (currentPhase === 'phase5_ram' && ramBlocks.length === 0) {
      // Spawn initial 6 blocks immediately
      const initialBlocks = Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const distance = 3 + Math.random() * 2;
        return {
          id: `ram-${nextRAMId.current++}`,
          position: new THREE.Vector3(
            Math.cos(angle) * distance,
            0.5,
            Math.sin(angle) * distance
          ),
          isClearing: false,
        };
      });
      setRamBlocks(initialBlocks);
      lastSpawnTime.current = Date.now();
    }
  }, [currentPhase, ramBlocks.length]);

  // Phase 5: Spawn RAM blocks continuously
  useFrame((state, delta) => {
    if (currentPhase === 'phase5_ram' && !phase5Complete && !isCoreCalm) {
      const now = Date.now();
      const activeBlocks = ramBlocks.filter(b => !b.isClearing).length;
      
      if (now - lastSpawnTime.current > 2000 && activeBlocks < 20) {
        // Spawn new block
        const angle = Math.random() * Math.PI * 2;
        const distance = 2.5 + Math.random() * 3;
        const newBlock = {
          id: `ram-${nextRAMId.current++}`,
          position: new THREE.Vector3(
            Math.cos(angle) * distance,
            0.5,
            Math.sin(angle) * distance
          ),
          isClearing: false,
        };
        setRamBlocks(prev => [...prev, newBlock]);
        lastSpawnTime.current = now;
        playTone(200, 100); // Spawn sound
      }
    }
  });

  // Phase 5: Memory increase logic
  useFrame((state, delta) => {
    if (currentPhase === 'phase5_ram' && !phase5Complete && !isCoreCalm) {
      // Increase memory based on rate
      onMemoryChange(memoryIncreaseRate * delta);
      
      // Update pulse intensity based on memory
      const memoryPercent = memoryUsage / 100;
      setCorePulseIntensity(0.5 + memoryPercent * 1.5);
    }
  });

  // Phase 5: Accelerated spawning at high memory
  useEffect(() => {
    if (currentPhase === 'phase5_ram' && !phase5Complete && memoryUsage > 70) {
      const spawnInterval = setInterval(() => {
        setRamBlocks(prev => {
          const activeBlocks = prev.filter(b => !b.isClearing);
          if (activeBlocks.length >= 20) return prev;
          
          const angle = Math.random() * Math.PI * 2;
          const distance = 2.5 + Math.random() * 3;
          const newBlock = {
            id: `ram-${nextRAMId.current++}`,
            position: new THREE.Vector3(
              Math.cos(angle) * distance,
              0.5,
              Math.sin(angle) * distance
            ),
            isClearing: false,
          };
          return [...prev, newBlock];
        });
        playTone(200, 80);
      }, 1200);

      return () => clearInterval(spawnInterval);
    }
  }, [currentPhase, phase5Complete, memoryUsage]);

  // Phase 5: Handle RAM block click
  const handleRAMClick = (id: string) => {
    if (currentPhase !== 'phase5_ram' || phase5Complete) return;
    
    // Mark block as clearing
    setRamBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, isClearing: true } : b
    ));
    
    // Play clear sound
    playTone(523.25, 150);
    
    // Increment cleared count
    setClearedBlocks(prev => prev + 1);
    
    // Reduce memory by 5% per block
    onMemoryChange(-5);
    
    // Remove block after animation
    setTimeout(() => {
      setRamBlocks(prev => prev.filter(b => b.id !== id));
    }, 1000);
  };

  // Phase 5: Check completion
  useEffect(() => {
    if (currentPhase === 'phase5_ram' && !phase5Complete && clearedBlocks >= TARGET_CLEARS) {
      setPhase5Complete(true);
      setIsCoreCalm(true);
      playTone(523.25, 200); // Victory fanfare
      setTimeout(() => playTone(659.25, 200), 150);
      setTimeout(() => playTone(783.99, 200), 300);
      setTimeout(() => playTone(1046.50, 600), 450); // Final triumph!
      
      // Clear all remaining blocks
      setRamBlocks(prev => prev.map(b => ({ ...b, isClearing: true })));
      
      setTimeout(() => {
        setRamBlocks([]);
      }, 1000);

      // Drop memory to safe level
      const dropInterval = setInterval(() => {
        onMemoryChange(-5);
      }, 100);

      setTimeout(() => {
        clearInterval(dropInterval);
        onPhaseComplete('complete');
      }, 3000);
    }
  }, [currentPhase, phase5Complete, clearedBlocks, onMemoryChange, onPhaseComplete]);

  return (
    <>
      {/* Camera Controls - disabled when dragging */}
      <OrbitControls 
        enabled={!draggedId && !rotatingBlockId}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} color="#4488cc" />
      <directionalLight position={[5, 10, 5]} intensity={0.8} color="#6699dd" />
      <directionalLight position={[-5, 10, -5]} intensity={0.5} color="#6699dd" />
      <pointLight position={[0, 5, 0]} intensity={1.0} color="#0088cc" />

      {/* Fog */}
      <fog attach="fog" args={['#1a1a2e', 10, 30]} />

      {/* Room components */}
      {currentPhase !== 'phase5_ram' && <MemoryCore />}
      <FloorPlatform />
      <OctagonalWalls />
      <SpawnPlatform />
      <CeilingParticles />

      {/* Phase 1: Seal the Rifts */}
      {currentPhase === 'phase1_seal' && (
        <>
          {cracks.map((crack, index) => {
            const state = cracksState[index];
            if (state.isSealed) return null;
            
            return (
              <group key={crack.id}>
                <WallCrack
                  isSealing={state.isSealing}
                  sealProgress={state.sealProgress}
                  position={crack.position}
                  rotation={crack.rotation}
                  onPointerDown={() => handleCrackPointerDown(crack.id)}
                  onPointerUp={() => handleCrackPointerUp(crack.id)}
                  isHovered={state.isHovered}
                  onPointerEnter={() => setCracksState(prev => prev.map(c => 
                    c.id === crack.id ? { ...c, isHovered: true } : c
                  ))}
                  onPointerLeave={() => setCracksState(prev => prev.map(c => 
                    c.id === crack.id ? { ...c, isHovered: false } : c
                  ))}
                />
                <CrackParticles active={!state.isSealed} crackPosition={crack.position} />
                {state.isSealing && (
                  <ProgressRing progress={state.sealProgress} position={crack.position} rotation={crack.rotation} />
                )}
              </group>
            );
          })}
          <FlickeringObjects active={!phase1Complete} crackPosition={cracks[0].position} />
        </>
      )}

      {/* Phase 2: Drag Components */}
      {currentPhase === 'phase2_drag' && (
        <>
          {holes.map(hole => {
            const blocksInHole = components.filter(c => c.targetHole === hole.id && c.isLocked).length;
            const isFilled = blocksInHole >= hole.capacity;
            return (
              <FloorHole
                key={hole.id}
                position={hole.position}
                color={hole.color}
                isFilled={isFilled}
              />
            );
          })}
          <group
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {components.map(comp => (
              <DraggableComponent
                key={comp.id}
                id={comp.id}
                position={comp.position}
                color={comp.color}
                isLocked={comp.isLocked}
                isDragging={comp.isDragging}
                onPointerDown={handleComponentPointerDown}
              />
            ))}
          </group>
        </>
      )}

      {/* Phase 3: Simon Pattern */}
      {currentPhase === 'phase3_simon' && (
        <>
          <SecondaryCore glitchIntensity={glitchIntensity} isComplete={phase3Complete} round={simonRound} />
          {orbs.map((orb, i) => (
            <SimonOrb
              key={orb.id}
              id={orb.id}
              position={orb.position}
              color={orb.color}
              frequency={orb.frequency}
              isFlashing={currentFlashIndex === pattern.indexOf(orb.id, currentFlashIndex >= 0 ? currentFlashIndex : 0) && currentFlashIndex >= 0}
              isComplete={phase3Complete}
              isCorrect={correctOrbId === orb.id}
              onClick={handleOrbClick}
            />
          ))}
        </>
      )}

      {/* Phase 4: Rotate & Align */}
      {currentPhase === 'phase4_rotate' && (
        <>
          {memoryBlocks.map(block => (
            <MemoryBlock
              key={block.id}
              id={block.id}
              position={block.position}
              rotation={block.rotation}
              targetRotation={block.targetRotation}
              isAligned={block.isAligned}
              isRotating={block.isRotating}
              isAbsorbing={block.isAbsorbing}
              onPointerDown={handleBlockPointerDown}
            />
          ))}
        </>
      )}

      {/* Phase 5: RAM Overflow Finale */}
      {currentPhase === 'phase5_ram' && (
        <>
          <FinaleCore pulseIntensity={corePulseIntensity} isCalm={isCoreCalm} />
          
          <ClearedBlocksDisplay cleared={clearedBlocks} target={TARGET_CLEARS} />

          {/* RAM blocks */}
          {ramBlocks.map(block => (
            <RAMBlock
              key={block.id}
              id={block.id}
              position={block.position}
              isClearing={block.isClearing}
              onClick={handleRAMClick}
            />
          ))}
        </>
      )}

      {/* Exit Door - appears when complete */}
      {currentPhase === 'complete' && (
        <ExitDoor onClick={onExit} />
      )}
    </>
  );
}

// Phase Complete Message
function PhaseCompleteMessage({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 animate-pulse">
      <p className="font-mono text-3xl text-green-400">
        {message}
      </p>
    </div>
  );
}

// Red Flash Overlay for mistakes
function RedFlashOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-red-600 opacity-30 z-5 pointer-events-none animate-pulse" />
  );
}

// Green Flash Overlay for success
function GreenFlashOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-green-500 opacity-40 z-5 pointer-events-none" />
  );
}

// Vignette Overlay for critical state
function VignetteOverlay({ intensity }: { intensity: number }) {
  if (intensity === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-5"
      style={{
        background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${intensity}) 100%)`,
      }}
    />
  );
}

// Critical Warning
function CriticalWarning({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-center z-10">
      <p className="font-mono text-5xl text-red-500 font-bold animate-pulse" style={{
        animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}>
        ⚠️ CRITICAL MEMORY LEAK ⚠️
      </p>
    </div>
  );
}

// Main Component
export default function MemoryLeakRoomScene() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState<Phase>('intro');
  const [memoryUsage, setMemoryUsage] = useState(100);
  const [showComplete, setShowComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [phaseCompleteMessage, setPhaseCompleteMessage] = useState('');
  const [showPhaseComplete, setShowPhaseComplete] = useState(false);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [showGreenFlash, setShowGreenFlash] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  
  // Audio refs
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const voiceLineRef = useRef<HTMLAudioElement | null>(null);

  // Play voice line
  const playVoiceLine = (filename: string) => {
    if (voiceLineRef.current) {
      voiceLineRef.current.pause();
      voiceLineRef.current.currentTime = 0;
    }
    
    const path = `/KIRO_ASSETS/Voices/memory door/${filename}.mp3`;
    console.log('Attempting to play voice line:', path);
    
    const audio = new Audio(path);
    audio.volume = 0.7;
    
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio loaded successfully:', path);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio load error:', path, e);
    });
    
    audio.play()
      .then(() => console.log('Playing:', path))
      .catch(e => console.error('Voice line play failed:', path, e));
    
    voiceLineRef.current = audio;
  };

  // Initialize audio (but don't play until user interaction)
  useEffect(() => {
    // Preload background music
    const bgPath = '/KIRO_ASSETS/Voices/memory door/memory bg.mp3';
    console.log('Loading background music:', bgPath);
    
    const bgMusic = new Audio(bgPath);
    bgMusic.volume = 0.3;
    bgMusic.loop = true;
    
    bgMusic.addEventListener('canplaythrough', () => {
      console.log('Background music loaded successfully');
    });
    
    bgMusic.addEventListener('error', (e) => {
      console.error('Background music load error:', e);
    });
    
    bgMusicRef.current = bgMusic;
    
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (voiceLineRef.current) {
        voiceLineRef.current.pause();
        voiceLineRef.current = null;
      }
    };
  }, []);

  // Handle intro dismissal
  const handleIntroDismiss = () => {
    console.log('Intro dismissed - starting audio');
    setShowIntro(false);
    playTone(440, 100); // Button click sound
    setTimeout(() => playTone(523.25, 150), 100); // Confirmation beep
    
    // Start background music on user interaction
    if (bgMusicRef.current) {
      console.log('Starting background music');
      bgMusicRef.current.play()
        .then(() => console.log('Background music playing'))
        .catch(e => console.error('BG music play failed:', e));
    } else {
      console.error('Background music ref is null');
    }
    
    handlePhaseComplete('phase1_seal');
  };

  const handlePhaseComplete = (nextPhase: Phase) => {
    // Show completion message for certain phases
    if (nextPhase === 'phase2_drag') {
      // Phase 1 complete
      setPhaseCompleteMessage('LEAK SEALED');
      setShowPhaseComplete(true);
      setTimeout(() => setShowPhaseComplete(false), 1500);
    } else if (nextPhase === 'phase3_simon') {
      // Phase 2 complete
      setPhaseCompleteMessage('SEGMENT REPAIRED');
      setShowPhaseComplete(true);
      setTimeout(() => setShowPhaseComplete(false), 1500);
    } else if (nextPhase === 'phase4_rotate') {
      // Phase 3 complete
      setPhaseCompleteMessage('LOGIC CORE STABILIZED');
      setShowPhaseComplete(true);
      setTimeout(() => setShowPhaseComplete(false), 1500);
    } else if (nextPhase === 'phase5_ram') {
      // Phase 4 complete
      setPhaseCompleteMessage('MEMORY BLOCKS ALIGNED');
      setShowPhaseComplete(true);
      setTimeout(() => setShowPhaseComplete(false), 1500);
    }

    setCurrentPhase(nextPhase);
    
    // Play voice line for the NEW phase starting
    if (nextPhase === 'phase1_seal') {
      playVoiceLine('phase1');
    } else if (nextPhase === 'phase2_drag') {
      playVoiceLine('phase2');
    } else if (nextPhase === 'phase3_simon') {
      playVoiceLine('phase3');
    } else if (nextPhase === 'phase4_rotate') {
      playVoiceLine('phase4');
    } else if (nextPhase === 'phase5_ram') {
      playVoiceLine('phase5');
    }
    
    if (nextPhase === 'complete') {
      setShowComplete(true);
    }
  };

  const handleMemoryChange = (delta: number) => {
    setMemoryUsage(prev => {
      const newValue = prev + delta;
      
      // Clamp between 0 and 100
      const clampedValue = Math.max(0, Math.min(100, newValue));
      
      // Check for failure in phase 5
      if (currentPhase === 'phase5_ram' && clampedValue >= 100) {
        setShowFailure(true);
      }
      
      return clampedValue;
    });
  };

  const handleReturnToHallway = () => {
    // Stop background music
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    
    // Play exit sounds
    playTone(523.25, 200); // C5
    setTimeout(() => playTone(659.25, 200), 150); // E5
    setTimeout(() => playTone(783.99, 400), 300); // G5 - Success fanfare
    
    // Mark room as complete and navigate
    setTimeout(() => {
      markRoomFixed('leak');
      router.push('/');
    }, 800);
  };

  return (
    <div className="relative w-full h-screen">
      <Scene3D cameraPosition={[0, 6, 10]} cameraFov={75}>
        <color attach="background" args={['#222222']} />
        <MemoryLeakRoomContent 
          currentPhase={currentPhase}
          onPhaseComplete={handlePhaseComplete}
          onMemoryChange={handleMemoryChange}
          onRedFlash={() => {
            setShowRedFlash(true);
            setTimeout(() => setShowRedFlash(false), 300);
          }}
          onGreenFlash={() => {
            setShowGreenFlash(true);
            setTimeout(() => setShowGreenFlash(false), 500);
          }}
          onExit={handleReturnToHallway}
          memoryUsage={memoryUsage}
        />
      </Scene3D>

      {/* HUD */}
      <MemoryUsageHUD usage={memoryUsage} />
      <IntroOverlay visible={showIntro && !showComplete} onDismiss={handleIntroDismiss} />
      <PhaseInstructions phase={currentPhase} />
      <PhaseCompleteMessage message={phaseCompleteMessage} visible={showPhaseComplete} />
      <RedFlashOverlay visible={showRedFlash} />
      <GreenFlashOverlay visible={showGreenFlash} />
      
      {/* Phase 5 critical state effects */}
      <VignetteOverlay intensity={memoryUsage > 70 ? (memoryUsage - 70) / 30 * 0.6 : 0} />
      <CriticalWarning visible={memoryUsage > 95} />

      {/* Completion overlay */}
      {showComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
          <div className="text-center">
            <h2 className="text-4xl font-mono text-green-400 mb-4">MEMORY STABILIZED</h2>
            <p className="text-xl font-mono text-gray-300 mb-8">EXIT UNLOCKED</p>
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </div>
      )}

      {/* Failure overlay */}
      {showFailure && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center bg-red-900 bg-opacity-50 p-8 rounded-lg border-4 border-red-500">
            <h2 className="text-5xl font-mono text-red-400 mb-4 font-bold">MEMORY OVERFLOW</h2>
            <p className="text-2xl font-mono text-gray-300 mb-8">SYSTEM FAILURE</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white font-mono text-lg px-8 py-3 rounded border-2 border-red-400 transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              RESTART ROOM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
