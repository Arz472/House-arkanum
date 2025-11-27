'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ================================
// TYPES AND INTERFACES
// ================================

interface LoopRoomProps {
  onLoopBroken?: () => void;
}

interface PatrollingGhostProps {
  waypoints: THREE.Vector3[];
  onGhostClicked: () => void;
  clickCount: number;
  isJumpScaring: boolean;
  onJumpScareComplete: () => void;
}

// ================================
// WAYPOINT DEFINITIONS
// ================================

// Nine waypoints around the graveyard perimeter (8+ units from center)
const GHOST_WAYPOINTS = [
  new THREE.Vector3(-10, 2, -12),  // Far left back
  new THREE.Vector3(10, 2, -12),   // Far right back
  new THREE.Vector3(12, 3, -5),    // Right side
  new THREE.Vector3(12, 2, 5),     // Right front
  new THREE.Vector3(-12, 2, 5),    // Left front
  new THREE.Vector3(-12, 3, -5),   // Left side
  new THREE.Vector3(0, 3, -15),    // Center back (graveyard)
  new THREE.Vector3(8, 2, -10),    // Right graveyard
  new THREE.Vector3(-8, 2, -10),   // Left graveyard
];

// ================================
// GRAVEYARD ENVIRONMENT
// ================================

function GraveyardEnvironment() {
  return (
    <group>
      {/* Ground plane - dark dirt */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>

      {/* Tombstones - scattered around center */}
      {/* Cluster 1 */}
      <mesh position={[-3, 0.8, -8]} castShadow>
        <boxGeometry args={[1.2, 1.6, 0.3]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      <mesh position={[-1, 0.6, -7.5]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.25]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>

      {/* Cluster 2 */}
      <mesh position={[4, 0.9, -9]} castShadow>
        <boxGeometry args={[1.4, 1.8, 0.35]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      <mesh position={[6, 0.7, -8.5]} castShadow>
        <boxGeometry args={[1, 1.4, 0.3]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>

      {/* Cluster 3 */}
      <mesh position={[0, 0.8, -10]} castShadow>
        <boxGeometry args={[1.3, 1.6, 0.3]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>

      {/* Cluster 4 */}
      <mesh position={[-6, 0.7, -9]} castShadow>
        <boxGeometry args={[1.1, 1.4, 0.3]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>

      {/* Simple fence posts at edges */}
      {[-15, -10, -5, 0, 5, 10, 15].map((x, i) => (
        <mesh key={`fence-back-${i}`} position={[x, 1, -18]} castShadow>
          <boxGeometry args={[0.3, 2, 0.3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.2} />

      {/* Fog */}
      <fog attach="fog" args={['#0a0a0a', 10, 30]} />
    </group>
  );
}

// ================================
// PATROLLING GHOST
// ================================

function PatrollingGhost({
  waypoints,
  onGhostClicked,
  clickCount,
  isJumpScaring,
  onJumpScareComplete,
}: PatrollingGhostProps) {
  const ghostRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Movement state
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const targetPosition = useRef(waypoints[0].clone());
  const moveSpeed = 2.5;

  // Jump scare state
  const jumpScareTimer = useRef(0);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Material for ghost (emissive so visible in dark)
  const ghostMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: '#88ffaa',
      emissive: '#00ffaa',
      emissiveIntensity: 1,
      transparent: true,
      opacity: 1,
    })
  );

  // Cleanup
  useEffect(() => {
    return () => {
      ghostMaterial.current.dispose();
    };
  }, []);

  // Update emissive intensity based on click count (darkening)
  useEffect(() => {
    const darkenAmount = clickCount * 0.25;
    ghostMaterial.current.emissiveIntensity = Math.max(0.2, 1 - darkenAmount);
  }, [clickCount]);

  // Handle click - teleport to random waypoint
  const handleClick = () => {
    if (isJumpScaring) return;

    const randomIndex = Math.floor(Math.random() * waypoints.length);
    setCurrentWaypointIndex(randomIndex);
    targetPosition.current = waypoints[randomIndex].clone();

    if (ghostRef.current) {
      ghostRef.current.position.copy(targetPosition.current);
    }

    onGhostClicked();
  };

  useFrame((state, delta) => {
    if (!ghostRef.current) return;

    const time = state.clock.getElapsedTime();

    // ================================
    // JUMP SCARE MODE
    // ================================
    if (isJumpScaring) {
      jumpScareTimer.current += delta;

      if (jumpScareTimer.current < 0.1) {
        // Position ghost in front of camera
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const jumpScarePos = camera.position.clone();
        jumpScarePos.add(cameraDirection.multiplyScalar(2.5));
        jumpScarePos.y = camera.position.y;

        ghostRef.current.position.copy(jumpScarePos);
        ghostRef.current.lookAt(camera.position);

        // Max emissive during scare
        ghostMaterial.current.emissiveIntensity = 2;
        setGlitchIntensity(1);
      }

      // Heavy glitch jitter during scare
      const jitter = Math.sin(time * 50) * 0.05;
      const breathe = Math.sin(time * 2) * 0.1;
      ghostRef.current.scale.set(
        1.5 + breathe + jitter,
        1.5 + breathe + jitter,
        1.5 + breathe + jitter
      );

      // End jump scare after 4 seconds
      if (jumpScareTimer.current >= 4) {
        onJumpScareComplete();
      }

      return;
    }

    // ================================
    // NORMAL PATROL MODE
    // ================================

    // Move toward target waypoint
    const currentPos = ghostRef.current.position;
    const distanceToTarget = currentPos.distanceTo(targetPosition.current);

    if (distanceToTarget > 0.5) {
      const direction = new THREE.Vector3()
        .subVectors(targetPosition.current, currentPos)
        .normalize();

      currentPos.add(direction.multiplyScalar(moveSpeed * delta));

      // Look in direction of movement
      const lookAtPos = currentPos.clone().add(direction);
      ghostRef.current.lookAt(lookAtPos);
    } else {
      // Reached waypoint, pick next one
      const nextIndex = (currentWaypointIndex + 1) % waypoints.length;
      setCurrentWaypointIndex(nextIndex);
      targetPosition.current = waypoints[nextIndex].clone();

      // Occasionally glance at player (30% chance)
      if (Math.random() < 0.3) {
        ghostRef.current.lookAt(camera.position);
      }
    }

    // ================================
    // REALISTIC FLOATING ANIMATION
    // ================================
    const floatSpeed = 0.8;
    const floatHeight = 0.4;
    const baseY = targetPosition.current.y;

    // Dual frequency float
    const primaryFloat = Math.sin(time * floatSpeed) * floatHeight;
    const secondaryFloat = Math.sin(time * floatSpeed * 1.3 + 1) * (floatHeight * 0.3);

    ghostRef.current.position.y = baseY + primaryFloat + secondaryFloat;

    // Subtle breathing scale
    const breathe = Math.sin(time * 0.6) * 0.05;
    ghostRef.current.scale.set(1.5 + breathe, 1.5 + breathe, 1.5 + breathe);

    // ================================
    // DISTANCE-BASED GLITCH EFFECT
    // ================================
    const distanceToCamera = camera.position.distanceTo(ghostRef.current.position);
    const maxDistance = 15;
    const minDistance = 2;

    if (distanceToCamera < maxDistance) {
      // Exponential intensity increase as ghost gets closer
      const normalizedDistance = (distanceToCamera - minDistance) / (maxDistance - minDistance);
      const intensity = Math.pow(1 - Math.max(0, Math.min(1, normalizedDistance)), 2);
      setGlitchIntensity(intensity);

      // Apply glitch jitter when close
      if (intensity > 0.3) {
        const glitchJitter = Math.sin(time * 20) * intensity * 0.02;
        ghostRef.current.position.x += glitchJitter;
        ghostRef.current.position.z += glitchJitter;
      }
    } else {
      setGlitchIntensity(0);
    }
  });

  return (
    <group
      ref={ghostRef}
      position={waypoints[0].toArray()}
      onClick={handleClick}
    >
      {/* Placeholder ghost mesh - replace with useGLTF later */}
      {/* TODO: Replace with: const { scene } = useGLTF('/path/to/ghost.glb') */}
      <mesh castShadow material={ghostMaterial.current}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
      </mesh>

      {/* Ghost glow light */}
      <pointLight
        position={[0, 0, 0]}
        color="#00ffaa"
        intensity={ghostMaterial.current.emissiveIntensity * 2}
        distance={8}
      />
    </group>
  );
}

// ================================
// CAMERA PARALLAX CONTROLLER
// ================================

function CameraParallax() {
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(({ camera }) => {
    // Subtle parallax - full 360 horizontal, minimal vertical
    targetRotation.current.y = -mousePos.current.x * Math.PI;
    targetRotation.current.x = mousePos.current.y * 0.1;

    // Smooth interpolation
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.08;
    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.08;

    // Lock Z rotation to prevent tilt
    camera.rotation.z = 0;
  });

  return null;
}

// ================================
// GLITCH OVERLAY
// ================================

function GlitchOverlay({ intensity }: { intensity: number }) {
  if (intensity === 0) return null;

  return (
    <Html fullscreen>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(
            0deg,
            rgba(255, 0, 0, ${intensity * 0.1}) 0px,
            transparent 2px,
            transparent 4px,
            rgba(0, 255, 255, ${intensity * 0.1}) 4px,
            transparent 6px
          )`,
          animation: `glitch ${0.1 / Math.max(intensity, 0.1)}s infinite`,
          mixBlendMode: 'screen',
        }}
      />
    </Html>
  );
}

// ================================
// MAIN LOOP ROOM COMPONENT
// ================================

export default function LoopRoom({ onLoopBroken }: LoopRoomProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isJumpScaring, setIsJumpScaring] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  const handleGhostClicked = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      // Trigger jump scare
      setIsJumpScaring(true);
    }
  };

  const handleJumpScareComplete = () => {
    setIsJumpScaring(false);
    setIsComplete(true);
    onLoopBroken?.();
  };

  return (
    <>
      {/* Camera setup */}
      <CameraParallax />

      {/* Scene background */}
      <color attach="background" args={['#0a0a0a']} />

      {/* Environment */}
      <GraveyardEnvironment />

      {/* Ghost */}
      {!isComplete && (
        <PatrollingGhost
          waypoints={GHOST_WAYPOINTS}
          onGhostClicked={handleGhostClicked}
          clickCount={clickCount}
          isJumpScaring={isJumpScaring}
          onJumpScareComplete={handleJumpScareComplete}
        />
      )}

      {/* Glitch effect overlay */}
      <GlitchOverlay intensity={glitchIntensity} />

      {/* Success message */}
      {isComplete && (
        <Html center>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '2rem',
              borderRadius: '0.5rem',
              border: '2px solid #00ffaa',
              color: '#00ffaa',
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              textAlign: 'center',
            }}
          >
            <h2>Infinite Loop Broken</h2>
            <p style={{ fontSize: '1rem', marginTop: '1rem', color: '#888' }}>
              The ghost has been defeated
            </p>
          </div>
        </Html>
      )}
    </>
  );
}
