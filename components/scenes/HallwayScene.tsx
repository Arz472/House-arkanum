'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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
  const { scene } = useGLTF('/KIRO_ASSETS/hallway/loopdoor.glb');
  
  const scale = hovered ? 1.1 : 1;
  
  // Determine rotation based on which wall (left wall faces right, right wall faces left)
  const rotation: [number, number, number] = config.position[0] > 0 
    ? [0, -Math.PI / 2, 0]  // Right wall - face left
    : [0, Math.PI / 2, 0];   // Left wall - face right
  
  // Clone the scene to allow different materials per door
  const doorScene = scene.clone();
  
  // Apply unique texture/material to each door
  useEffect(() => {
    doorScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = (child.material as THREE.MeshStandardMaterial).clone();
        
        // Customize material based on door type
        switch (config.id) {
          case 'loop':
            // Swirling, hypnotic pattern
            material.color = new THREE.Color(config.color);
            material.emissive = new THREE.Color(config.color);
            material.emissiveIntensity = hovered ? 0.4 : 0.2;
            material.metalness = 0.3;
            material.roughness = 0.7;
            break;
            
          case 'nullCandles':
            // Flickering, unstable appearance
            material.color = new THREE.Color(config.color);
            material.emissive = new THREE.Color('#ffaa00');
            material.emissiveIntensity = hovered ? 0.5 : 0.3;
            material.metalness = 0.1;
            material.roughness = 0.9;
            break;
            
          case 'door404':
            // Glitchy, corrupted texture
            material.color = new THREE.Color(config.color);
            material.emissive = new THREE.Color(config.color);
            material.emissiveIntensity = hovered ? 0.6 : 0.3;
            material.metalness = 0.8;
            material.roughness = 0.4;
            break;
            
          case 'leak':
            // Wet, dripping appearance
            material.color = new THREE.Color(config.color);
            material.emissive = new THREE.Color('#2266ff');
            material.emissiveIntensity = hovered ? 0.5 : 0.25;
            material.metalness = 0.9;
            material.roughness = 0.2;
            break;
            
          case 'mirror':
            // Reflective, shimmering surface
            material.color = new THREE.Color(config.color);
            material.emissive = new THREE.Color(config.color);
            material.emissiveIntensity = hovered ? 0.7 : 0.4;
            material.metalness = 1.0;
            material.roughness = 0.1;
            break;
        }
        
        child.material = material;
      }
    });
  }, [doorScene, config.id, config.color, hovered]);
  
  // Add unique decorative elements per door
  const getDoorDecoration = () => {
    switch (config.id) {
      case 'loop':
        // Spinning circles
        return (
          <>
            <mesh position={[0, 0, 0.15]}>
              <torusGeometry args={[0.3, 0.05, 16, 32]} />
              <meshStandardMaterial 
                color={config.color}
                emissive={config.color}
                emissiveIntensity={1}
              />
            </mesh>
            <mesh position={[0, 0, 0.2]}>
              <torusGeometry args={[0.2, 0.03, 16, 32]} />
              <meshStandardMaterial 
                color={config.color}
                emissive={config.color}
                emissiveIntensity={1.5}
              />
            </mesh>
          </>
        );
        
      case 'nullCandles':
        // Three small flames
        return (
          <>
            <mesh position={[-0.3, 0.3, 0.15]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshStandardMaterial 
                color="#ffaa00"
                emissive="#ffaa00"
                emissiveIntensity={2}
              />
            </mesh>
            <mesh position={[0, 0.3, 0.15]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshStandardMaterial 
                color="#ffaa00"
                emissive="#ffaa00"
                emissiveIntensity={2}
              />
            </mesh>
            <mesh position={[0.3, 0.3, 0.15]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshStandardMaterial 
                color="#ffaa00"
                emissive="#ffaa00"
                emissiveIntensity={2}
              />
            </mesh>
          </>
        );
        
      case 'door404':
        // Glitchy squares
        return (
          <>
            <mesh position={[-0.2, 0.2, 0.15]}>
              <boxGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial 
                color={config.color}
                emissive={config.color}
                emissiveIntensity={1.5}
                transparent
                opacity={0.7}
              />
            </mesh>
            <mesh position={[0.2, -0.2, 0.15]}>
              <boxGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial 
                color={config.color}
                emissive={config.color}
                emissiveIntensity={1.5}
                transparent
                opacity={0.7}
              />
            </mesh>
          </>
        );
        
      case 'leak':
        // Dripping effect
        return (
          <>
            <mesh position={[-0.3, 0.5, 0.15]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial 
                color="#4488ff"
                emissive="#2266ff"
                emissiveIntensity={1}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.3, 0.15]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial 
                color="#4488ff"
                emissive="#2266ff"
                emissiveIntensity={1}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0.3, 0.4, 0.15]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial 
                color="#4488ff"
                emissive="#2266ff"
                emissiveIntensity={1}
                transparent
                opacity={0.8}
              />
            </mesh>
          </>
        );
        
      case 'mirror':
        // Reflective diamond
        return (
          <mesh position={[0, 0, 0.15]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.4, 0.05]} />
            <meshStandardMaterial 
              color={config.color}
              emissive={config.color}
              emissiveIntensity={2}
              metalness={1}
              roughness={0}
            />
          </mesh>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <group position={config.position} scale={scale} rotation={rotation}>
      <primitive 
        object={doorScene} 
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      />
      
      {/* Unique decorations per door */}
      {getDoorDecoration()}
      
      {/* Colored light above door */}
      <pointLight 
        position={[0, 2, 0.5]} 
        color={config.color} 
        intensity={hovered ? 4 : 3} 
        distance={5} 
      />
      
      {/* Additional front light for better visibility */}
      <pointLight 
        position={[0, 0, 1]} 
        color={config.color} 
        intensity={hovered ? 2 : 1.5} 
        distance={3} 
      />
      
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

// Flickering candle/torch component with multi-layered flames
function WallTorch({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      // Intense flicker effect
      const flicker = Math.sin(state.clock.elapsedTime * 10) * 0.1 + Math.random() * 0.2;
      lightRef.current.intensity = 1.2 + flicker;
    }
    if (flameRef.current) {
      // Flame dancing animation
      flameRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.15;
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      {/* Rusty torch holder */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.05, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#2a1a0a" metalness={0.6} roughness={0.8} />
      </mesh>
      
      {/* Multi-layered flame */}
      <group ref={flameRef} position={[0, 0.2, 0.1]}>
        {/* Inner bright core */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ffff00"
            emissiveIntensity={3}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Middle orange layer */}
        <mesh position={[0, 0.05, 0]}>
          <coneGeometry args={[0.12, 0.35, 8]} />
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff4400"
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Outer red layer */}
        <mesh position={[0, 0.08, 0]}>
          <coneGeometry args={[0.14, 0.4, 8]} />
          <meshStandardMaterial 
            color="#ff2200" 
            emissive="#ff0000"
            emissiveIntensity={1.5}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
      
      {/* Flickering light with color variation */}
      <pointLight 
        ref={lightRef}
        position={[0, 0.2, 0.2]} 
        color="#ff5500" 
        intensity={1.2} 
        distance={5}
        castShadow
      />
      
      {/* Smoke particles rising */}
      <mesh position={[0, 0.6, 0.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#333333"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

// Animated shadow creature on walls
function WallShadow({ position, side }: { position: [number, number, number]; side: 'left' | 'right' }) {
  const shadowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (shadowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      shadowRef.current.scale.y = 1 + pulse;
      const material = shadowRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });
  
  const rotation: [number, number, number] = side === 'left' 
    ? [0, Math.PI / 2, 0] 
    : [0, -Math.PI / 2, 0];
  
  return (
    <mesh ref={shadowRef} position={position} rotation={rotation}>
      <planeGeometry args={[2, 3]} />
      <meshStandardMaterial 
        color="#000000"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Dripping water effect
function WaterDrip({ position }: { position: [number, number, number] }) {
  const dripRef = useRef<THREE.Mesh>(null);
  const [offset] = useState(Math.random() * 10);
  
  useFrame((state) => {
    if (dripRef.current) {
      const time = state.clock.elapsedTime + offset;
      const dropProgress = (time % 3) / 3;
      dripRef.current.position.y = position[1] - dropProgress * 2;
      const material = dripRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 1 - dropProgress;
    }
  });
  
  return (
    <mesh ref={dripRef} position={position}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial 
        color="#4488aa"
        transparent
        opacity={0.8}
        emissive="#2266aa"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Scurrying rat
function Rat({ position }: { position: [number, number, number] }) {
  const ratRef = useRef<THREE.Group>(null);
  const [offset] = useState(Math.random() * 10);
  
  useFrame((state) => {
    if (ratRef.current) {
      const time = state.clock.elapsedTime * 0.5 + offset;
      ratRef.current.position.x = position[0] + Math.sin(time) * 2;
      ratRef.current.rotation.y = Math.cos(time) * Math.PI;
    }
  });
  
  return (
    <group ref={ratRef} position={position}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.08, 0.15, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0, 0.12]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0, -0.15]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.01, 0.02, 0.2, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Red eyes */}
      <mesh position={[0.03, 0.02, 0.15]}>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.03, 0.02, 0.15]}>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Flying bat
function Bat({ position }: { position: [number, number, number] }) {
  const batRef = useRef<THREE.Group>(null);
  const [offset] = useState(Math.random() * 10);
  
  useFrame((state) => {
    if (batRef.current) {
      const time = state.clock.elapsedTime + offset;
      batRef.current.position.x = position[0] + Math.sin(time * 0.8) * 3;
      batRef.current.position.y = position[1] + Math.cos(time * 1.2) * 0.5;
      batRef.current.position.z = position[2] + Math.sin(time * 0.6) * 2;
      batRef.current.rotation.z = Math.sin(time * 4) * 0.3;
    }
  });
  
  return (
    <group ref={batRef} position={position}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Wings */}
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.08, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Blood stain on wall
function BloodStain({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.4, 0.6]} />
      <meshStandardMaterial 
        color="#4a0000"
        transparent
        opacity={0.6}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Broken furniture/debris
function BrokenChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.3, Math.random() * Math.PI, 0.2]}>
      {/* Broken leg */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>
      {/* Seat fragment */}
      <mesh position={[0.1, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.25]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Cracked wall texture overlay
function WallCracks({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Multiple crack lines */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.5, 0.02]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0.2, -0.3, 0.01]} rotation={[0, 0, Math.PI / 6]}>
        <planeGeometry args={[1, 0.02]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
      <mesh position={[-0.3, 0.4, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[0.8, 0.02]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// Multi-layered floating dust and mist particles
function DustParticles() {
  const dustRef = useRef<THREE.Points>(null);
  const mistRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  
  const dustPositions = new Float32Array(particleCount * 3);
  const mistPositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    // Dust particles
    dustPositions[i * 3] = (Math.random() - 0.5) * 10;
    dustPositions[i * 3 + 1] = Math.random() * 6 - 1;
    dustPositions[i * 3 + 2] = Math.random() * -30;
    
    // Mist particles (larger, lower)
    mistPositions[i * 3] = (Math.random() - 0.5) * 10;
    mistPositions[i * 3 + 1] = Math.random() * 2 - 1.5;
    mistPositions[i * 3 + 2] = Math.random() * -30;
  }
  
  useFrame((state) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
        positions[i * 3] += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.001;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (mistRef.current) {
      mistRef.current.rotation.y = -state.clock.elapsedTime * 0.01;
      
      const positions = mistRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] += Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.003;
      }
      mistRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <>
      {/* Fine dust particles */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.04} 
          color="#999999" 
          transparent 
          opacity={0.5}
          sizeAttenuation
        />
      </points>
      
      {/* Thick mist particles */}
      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={mistPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.15} 
          color="#555566" 
          transparent 
          opacity={0.3}
          sizeAttenuation
        />
      </points>
    </>
  );
}

// Cobweb decoration with multiple strands
function Cobweb({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number }) {
  const webRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (webRef.current) {
      // Subtle swaying animation
      webRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });
  
  return (
    <group ref={webRef} position={position} rotation={rotation} scale={scale}>
      {/* Main web plane */}
      <mesh>
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial 
          color="#dddddd" 
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Additional web strands for depth */}
      <mesh position={[0.2, -0.1, 0.05]} rotation={[0, 0, Math.PI / 6]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial 
          color="#cccccc" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[-0.15, 0.1, 0.03]} rotation={[0, 0, -Math.PI / 8]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial 
          color="#bbbbbb" 
          transparent 
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Creepy skull decoration
function Skull({ position }: { position: [number, number, number] }) {
  const skullRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (skullRef.current) {
      // Subtle bobbing
      skullRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group ref={skullRef} position={position}>
      {/* Skull */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.8} />
      </mesh>
      {/* Eye sockets */}
      <mesh position={[-0.05, 0.03, 0.12]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.05, 0.03, 0.12]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Creepy vines/roots
function Vines({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const vineRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (vineRef.current) {
      vineRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
  });
  
  return (
    <group ref={vineRef} position={position} rotation={rotation}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.sin(i) * 0.1, -i * 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.4, 6]} />
          <meshStandardMaterial color="#2d4a2b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Ghostly orbs floating with trails
function GhostOrb({ position, color }: { position: [number, number, number]; color: string }) {
  const orbRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.4;
      orbRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.5) * 0.3;
      orbRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.4;
    }
    if (trailRef.current) {
      const material = trailRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  return (
    <group>
      {/* Main orb */}
      <mesh ref={orbRef} position={position}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Ghostly trail */}
      <mesh ref={trailRef} position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Pulsing light */}
      <pointLight 
        ref={lightRef}
        position={position}
        color={color}
        intensity={0.6}
        distance={4}
      />
    </group>
  );
}

// Pulsing veins on walls (organic horror)
function WallVeins({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const veinRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (veinRef.current) {
      veinRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
        }
      });
    }
  });
  
  return (
    <group ref={veinRef} position={position} rotation={rotation}>
      {/* Main vein */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.02, 1.5, 8]} />
        <meshStandardMaterial 
          color="#660000"
          emissive="#aa0000"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Branch veins */}
      <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.01, 0.015, 0.8, 6]} />
        <meshStandardMaterial 
          color="#660000"
          emissive="#aa0000"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-0.25, -0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.01, 0.015, 0.6, 6]} />
        <meshStandardMaterial 
          color="#660000"
          emissive="#aa0000"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

// Creepy eyes watching from darkness
function WatchingEyes({ position }: { position: [number, number, number] }) {
  const eyesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (eyesRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 0.5) < -0.9 ? 0.1 : 1;
      eyesRef.current.scale.y = blink;
      
      const intensity = 0.8 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      eyesRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.emissiveIntensity = intensity;
        }
      });
    }
  });
  
  return (
    <group ref={eyesRef} position={position}>
      {/* Left eye */}
      <mesh position={[-0.08, 0, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.08, 0, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.08, 0, 0.03]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 0, 0.03]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Hanging corpse silhouette
function HangingCorpse({ position }: { position: [number, number, number] }) {
  const corpseRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (corpseRef.current) {
      corpseRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });
  
  return (
    <group ref={corpseRef} position={position}>
      {/* Rope */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Body silhouette */}
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Hanging chains
function Chain({ position }: { position: [number, number, number] }) {
  const chainRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (chainRef.current) {
      chainRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={chainRef} position={position}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, -i * 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Glowing pathway leading to doors - like a road/walkway
function DoorPathway({ doorPosition, color }: { doorPosition: [number, number, number]; color: string }) {
  const pathRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (pathRef.current) {
      pathRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          // Pulsing glow effect flowing toward door
          material.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 2 - i * 0.5) * 0.15;
        }
      });
    }
  });
  
  // Calculate pathway from center to door
  const startPos: [number, number, number] = [0, -1.95, 2]; // Starting position
  const pathWidth = 0.8;
  
  // Calculate direction and distance
  const dx = doorPosition[0] - startPos[0];
  const dz = doorPosition[2] - startPos[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  
  // Create path segments
  const segmentLength = 1.5;
  const numSegments = Math.floor(distance / segmentLength);
  
  return (
    <group ref={pathRef}>
      {Array.from({ length: numSegments }).map((_, i) => {
        const t = (i + 0.5) / numSegments;
        const x = startPos[0] + dx * t;
        const z = startPos[2] + dz * t;
        
        return (
          <mesh 
            key={i} 
            position={[x, startPos[1], z]} 
            rotation={[-Math.PI / 2, angle, 0]}
          >
            <planeGeometry args={[pathWidth, segmentLength * 0.9]} />
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}
      
      {/* Side borders for road effect */}
      <mesh 
        position={[
          startPos[0] + dx * 0.5,
          startPos[1] + 0.01,
          startPos[2] + dz * 0.5
        ]}
        rotation={[-Math.PI / 2, angle, 0]}
      >
        <planeGeometry args={[0.05, distance]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh 
        position={[
          startPos[0] + dx * 0.5 + Math.sin(angle + Math.PI / 2) * (pathWidth / 2),
          startPos[1] + 0.01,
          startPos[2] + dz * 0.5 + Math.cos(angle + Math.PI / 2) * (pathWidth / 2)
        ]}
        rotation={[-Math.PI / 2, angle, 0]}
      >
        <planeGeometry args={[0.05, distance]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh 
        position={[
          startPos[0] + dx * 0.5 - Math.sin(angle + Math.PI / 2) * (pathWidth / 2),
          startPos[1] + 0.01,
          startPos[2] + dz * 0.5 - Math.cos(angle + Math.PI / 2) * (pathWidth / 2)
        ]}
        rotation={[-Math.PI / 2, angle, 0]}
      >
        <planeGeometry args={[0.05, distance]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
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
      
      {/* Ambient light - balanced for visibility */}
      <ambientLight intensity={0.15} />
      
      {/* Directional light from above - creates path lighting */}
      <directionalLight position={[0, 10, 2]} intensity={0.3} />
      
      {/* Fog - atmospheric but not too thick */}
      <fog attach="fog" args={['#0d0d1a', 8, 30]} />
      
      {/* Dust particles */}
      <DustParticles />
      
      {/* Wall torches - positioned to light the pathway */}
      <WallTorch position={[-4.8, 2, -3]} />
      <WallTorch position={[4.8, 2, -7]} />
      <WallTorch position={[-4.8, 2, -12]} />
      <WallTorch position={[4.8, 2, -16]} />
      <WallTorch position={[-4.8, 2, -20]} />
      <WallTorch position={[4.8, 2, -23]} />
      
      {/* Spotlights on doors to guide players */}
      <spotLight position={[2, 3, -5]} angle={0.4} penumbra={0.5} intensity={0.3} target-position={[4, 1, -5]} color="#ff6b6b" />
      <spotLight position={[-2, 3, -8]} angle={0.4} penumbra={0.5} intensity={0.3} target-position={[-4, 1, -8]} color="#ffd93d" />
      <spotLight position={[2, 3, -11]} angle={0.4} penumbra={0.5} intensity={0.3} target-position={[4, 1, -11]} color="#6bcf7f" />
      <spotLight position={[-2, 3, -14]} angle={0.4} penumbra={0.5} intensity={0.3} target-position={[-4, 1, -14]} color="#4d96ff" />
      <spotLight position={[2, 3, -17]} angle={0.4} penumbra={0.5} intensity={0.3} target-position={[4, 1, -17]} color="#c77dff" />
      <spotLight position={[0, 4, -18]} angle={0.5} penumbra={0.4} intensity={0.5} target-position={[0, 1, -21]} color="#ffd700" />
      
      {/* Cobwebs in corners - reduced amount */}
      <Cobweb position={[-4.7, 3.8, -3]} rotation={[0, Math.PI / 4, Math.PI / 6]} scale={1.2} />
      <Cobweb position={[4.7, 3.8, -7]} rotation={[0, -Math.PI / 4, -Math.PI / 6]} scale={1.3} />
      <Cobweb position={[-4.7, 3.8, -13]} rotation={[0, Math.PI / 4, Math.PI / 6]} scale={1.4} />
      <Cobweb position={[4.7, 3.8, -17]} rotation={[0, -Math.PI / 4, -Math.PI / 6]} scale={1.2} />
      <Cobweb position={[-4.7, 3.8, -22]} rotation={[0, Math.PI / 4, Math.PI / 6]} scale={1.3} />
      
      {/* Ceiling cobwebs */}
      <Cobweb position={[-2, 3.9, -10]} rotation={[Math.PI / 2, 0, 0]} scale={1.5} />
      <Cobweb position={[2, 3.9, -18]} rotation={[Math.PI / 2, 0, Math.PI / 4]} scale={1.4} />
      
      {/* Chains - minimal */}
      <Chain position={[-2, 4, -10]} />
      <Chain position={[2, 4, -18]} />
      
      {/* Skulls - just a few */}
      <Skull position={[-3.5, -1.7, -9]} />
      <Skull position={[3.2, -1.7, -19]} />
      
      {/* Ghostly orbs - fewer, more strategic */}
      <GhostOrb position={[-3, 2.5, -12]} color="#4d96ff" />
      <GhostOrb position={[3, 2.5, -20]} color="#c77dff" />
      
      {/* Floor - with subtle path lighting */}
      <mesh position={[0, -2, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 30]} />
        <meshStandardMaterial 
          color="#1a1a28" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Subtle floor path markers */}
      <mesh position={[0, -1.95, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial 
          color="#2a2a38"
          emissive="#3a3a48"
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[0, -1.95, -11]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial 
          color="#2a2a38"
          emissive="#3a3a48"
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[0, -1.95, -17]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial 
          color="#2a2a38"
          emissive="#3a3a48"
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Ceiling - dark but visible */}
      <mesh position={[0, 4, -10]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 30]} />
        <meshStandardMaterial 
          color="#0d0d1a" 
          roughness={0.95}
        />
      </mesh>
      
      {/* Left wall - dark stone */}
      <mesh position={[-5, 1, -10]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial 
          color="#1a1a28" 
          roughness={0.9}
        />
      </mesh>
      
      {/* Right wall - dark stone */}
      <mesh position={[5, 1, -10]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial 
          color="#1a1a28" 
          roughness={0.9}
        />
      </mesh>
      
      {/* Back wall - darker */}
      <mesh position={[0, 1, -25]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#0d0d1a" 
          roughness={0.95}
        />
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
      
      {/* Glowing pathways leading to each door */}
      {DOORS.map((door) => (
        <DoorPathway 
          key={`path-${door.id}`}
          doorPosition={door.position}
          color={door.color}
        />
      ))}
      
      {/* Pathway to altar door */}
      <DoorPathway doorPosition={ALTAR_DOOR_POSITION} color="#ffd700" />
      
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
    audio.volume = 0.25;
    
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
      {showPopup && <LoopRoomPopup 
        popupRoomName={popupRoomName} 
        onEnter={handleEnterRoom}
        onCancel={handleCancel}
      />}
    </div>
  );
}

function LoopRoomPopup({ popupRoomName, onEnter, onCancel }: { 
  popupRoomName: string | null; 
  onEnter: () => void;
  onCancel: () => void;
}) {
  // Play intro audio for rooms
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    
    if (popupRoomName === 'Loop') {
      audio = new Audio('/KIRO_ASSETS/Voices/looproom intro.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => console.log('Audio play error:', err));
    } else if (popupRoomName === 'Null') {
      audio = new Audio('/KIRO_ASSETS/Voices/candleintro.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => console.log('Audio play error:', err));
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [popupRoomName]);

  // Get room-specific content
  const getRoomContent = () => {
    switch (popupRoomName) {
      case 'Loop':
        return {
          title: 'The Infinite Loop',
          description: (
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
          )
        };
      case 'Null':
        return {
          title: 'The Null Candles',
          description: (
            <p className="text-gray-300 font-mono mb-6 text-center">
              Three candles flicker in the darkness. One holds the truth, but which one is real?
            </p>
          )
        };
      case '404':
        return {
          title: 'The 404 Door',
          description: (
            <p className="text-gray-300 font-mono mb-6 text-center">
              A door that shouldn't exist. Can you find what's missing?
            </p>
          )
        };
      case 'Leak':
        return {
          title: 'The Memory Leak',
          description: (
            <p className="text-gray-300 font-mono mb-6 text-center">
              Something is consuming everything. Stop it before it's too late.
            </p>
          )
        };
      case 'Mirror':
        return {
          title: 'The Mirror Room',
          description: (
            <p className="text-gray-300 font-mono mb-6 text-center">
              Your reflection stares back, but something isn't quite right...
            </p>
          )
        };
      case 'Commit Altar':
        return {
          title: 'The Commit Altar',
          description: (
            <p className="text-gray-300 font-mono mb-6 text-center">
              The final sanctuary. Commit your fixes and escape this cursed place.
            </p>
          )
        };
      default:
        return {
          title: `Enter ${popupRoomName}?`,
          description: (
            <p className="text-gray-300 font-mono mb-6">
              Are you ready to face this bug?
            </p>
          )
        };
    }
  };

  const content = getRoomContent();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
      <div className="bg-gray-900 border-2 border-cyan-400 p-8 rounded-lg shadow-2xl max-w-md">
        <h2 className="text-2xl font-bold text-cyan-400 font-mono mb-4">
          {content.title}
        </h2>
        
        {content.description}
        
        <div className="flex gap-4">
          <button
            onClick={onEnter}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-3 px-6 rounded transition-colors"
          >
            Enter Room
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold py-3 px-6 rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
