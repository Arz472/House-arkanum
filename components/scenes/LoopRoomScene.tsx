'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';

interface GhostProps {
  onClick: () => void;
  clickCount: number;
  isVisible: boolean;
}

function Ghost({ onClick, clickCount, isVisible }: GhostProps) {
  const ghostRef = useRef<THREE.Mesh>(null);
  const [glitchPhase, setGlitchPhase] = useState(0);

  useFrame((state, delta) => {
    if (ghostRef.current && isVisible) {
      const time = state.clock.getElapsedTime();

      if (clickCount >= 3) {
        // Glitch animation
        const glitchTime = time * 10;
        ghostRef.current.scale.set(
          1 + Math.sin(glitchTime * 5) * 0.3,
          1 + Math.cos(glitchTime * 7) * 0.3,
          1 + Math.sin(glitchTime * 6) * 0.3
        );
        setGlitchPhase((prev) => Math.min(prev + delta * 2, 1));
      } else {
        // Normal floating animation
        ghostRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.3;
        ghostRef.current.position.x = Math.cos(time * 0.8) * 0.5;
        ghostRef.current.position.z = Math.sin(time * 0.8) * 0.5;
        ghostRef.current.scale.set(1, 1, 1);
      }
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group>
      <mesh ref={ghostRef} onClick={onClick} position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={clickCount >= 3 ? Math.max(1 - glitchPhase, 0) : 1}
        />
      </mesh>
      {/* Bright glow around ghost */}
      <pointLight position={[0, 0.5, 0]} intensity={5} distance={10} color="#00ffff" />
    </group>
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
    targetRotation.current.y = mousePos.current.x * 0.15;
    targetRotation.current.x = mousePos.current.y * 0.1;

    // Smoothly interpolate camera rotation
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.05;
    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.05;
  });

  return null;
}

interface LoopRoomContentProps {
  onSuccess: () => void;
}

function LoopRoomContent({ onSuccess }: LoopRoomContentProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isGhostVisible, setIsGhostVisible] = useState(true);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);

  const handleGhostClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setTimeout(() => {
        setIsGhostVisible(false);
        markRoomFixed('loop');
        onSuccess();
      }, 500);
    }
  };

  return (
    <>
      {/* Camera parallax controller */}
      <CameraController />

      {/* Ghost */}
      <Ghost onClick={handleGhostClick} clickCount={clickCount} isVisible={isGhostVisible} />

      {/* Super bright lighting */}
      <ambientLight intensity={3} />
      <directionalLight position={[10, 10, 10]} intensity={3} />
      <directionalLight position={[-10, 10, -10]} intensity={2} />

      {/* Simple visible room */}
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#999999" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
    </>
  );
}

export default function LoopRoomScene() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 2, 10]} cameraFov={75}>
        <color attach="background" args={['#444444']} />
        <LoopRoomContent onSuccess={() => setShowSuccess(true)} />
      </Scene3D>

      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="Infinite loop broken">
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
