'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import Button from '@/components/ui/Button';
import Overlay from '@/components/ui/Overlay';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';

function AtticContent({ 
  onShowExitConfirm,
  onShowPaper,
  onShowUncoverPrompt,
  onWinningCandleClick,
  furnitureUncovered,
  candleLit,
  onCandleBlowOut
}: { 
  onShowExitConfirm: (show: boolean) => void;
  onShowPaper: (show: boolean) => void;
  onShowUncoverPrompt: (show: boolean) => void;
  onWinningCandleClick: () => void;
  furnitureUncovered: boolean;
  candleLit: boolean;
  onCandleBlowOut: () => void;
}) {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const [stairsHovered, setStairsHovered] = useState(false);
  const [shelfHovered, setShelfHovered] = useState(false);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  
  // Camera animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const animationProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startRotation = useRef(new THREE.Euler());
  const targetPosition = useRef(new THREE.Vector3());
  const targetCameraRotation = useRef(new THREE.Euler());
  
  // Candle flicker state
  const [candleIntensity, setCandleIntensity] = useState(1.5);
  const [candleHovered, setCandleHovered] = useState(false);
  const [boxesHovered, setBoxesHovered] = useState(false);
  const [paperHovered, setPaperHovered] = useState(false);
  const [furnitureHovered, setFurnitureHovered] = useState(false);
  const [winningCandleHovered, setWinningCandleHovered] = useState(false);
  const flickerTime = useRef(0);
  
  // Handle winning candle click
  const handleWinningCandleClick = () => {
    markRoomFixed('nullCandles');
    onWinningCandleClick();
  };

  // Track mouse position for camera rotation
  useState(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });

  // Handle shelf click - animate camera to shelf
  const handleShelfClick = (position: [number, number, number]) => {
    if (isAnimating) return;
    
    startPosition.current.copy(camera.position);
    startRotation.current.copy(camera.rotation);
    targetPosition.current.set(...position);
    
    // Keep current rotation but look slightly at the shelf
    targetCameraRotation.current.set(-0.2, camera.rotation.y, 0);
    
    animationProgress.current = 0;
    setIsAnimating(true);
  };

  // Apply smooth camera rotation based on mouse position or animate to shelf
  useFrame((state, delta) => {
    if (isAnimating) {
      // Animate camera to shelf
      animationProgress.current += delta * 0.4;
      
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
      // Normal mouse-based rotation
      targetRotation.current.y = -mousePos.current.x * Math.PI;
      targetRotation.current.x = mousePos.current.y * 0.5;
      
      camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.08;
      camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.08;
    }
    
    // Candle flicker animation
    flickerTime.current += delta * 3;
    const flicker = Math.sin(flickerTime.current) * 0.3 + Math.sin(flickerTime.current * 2.3) * 0.2;
    setCandleIntensity(1.5 + flicker);
  });

  return (
    <>
      {/* Lighting - Similar to library first floor */}
      <ambientLight intensity={0.3} color="#2a2530" />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.4}
        color="#3a3545"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight 
        position={[-5, 8, 3]} 
        intensity={0.25}
        color="#2a2535"
      />
      <directionalLight 
        position={[0, 12, -10]} 
        intensity={0.3}
        color="#2a2535"
      />
      
      {/* Fog */}
      <fog attach="fog" args={['#1a1510', 5, 20]} />
      
      {/* Point lights throughout the room */}
      <pointLight position={[-6, 2, -8]} intensity={1.2} distance={10} color="#5a7a6a" />
      <pointLight position={[6, 2, -8]} intensity={1.2} distance={10} color="#5a7a6a" />
      <pointLight position={[-6, 2, -2]} intensity={0.8} distance={8} color="#5a6a5a" />
      <pointLight position={[6, 2, -2]} intensity={0.8} distance={8} color="#5a6a5a" />
      <pointLight position={[0, 3, -5]} intensity={1.0} distance={12} color="#6a7a7a" />

      {/* FLOOR - Same size as library (20x20) */}
      <mesh position={[0, 0, -6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 20, 0.2]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.95} />
      </mesh>

      {/* CEILING - Flat wooden ceiling */}
      <mesh position={[0, 4, -6]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 20, 0.2]} />
        <meshStandardMaterial color="#1a1210" roughness={0.95} />
      </mesh>



      {/* WALLS - Same dimensions as library */}
      {/* Front wall with entrance */}
      <mesh position={[0, 2, 4]}>
        <boxGeometry args={[20, 4, 0.3]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, 2, -16]}>
        <boxGeometry args={[20, 4, 0.3]} />
        <meshStandardMaterial color="#0a0a08" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-10, 2, -6]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 4, 0.3]} />
        <meshStandardMaterial color="#1a1a10" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[10, 2, -6]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 4, 0.3]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>

      {/* WOODEN SUPPORT BEAMS - Across the ceiling (skip center beam) */}
      {Array.from({ length: 5 }).map((_, i) => {
        // Skip the center beam (index 2)
        if (i === 2) return null;
        return (
          <mesh key={`beam-vertical-${i}`} position={[-8 + i * 4, 2, -6]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
          </mesh>
        );
      })}
      
      {/* Horizontal ceiling beams */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`beam-horizontal-${i}`} position={[0, 3.9, -14 + i * 6]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.25, 0.25, 18, 1]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
        </mesh>
      ))}

      {/* STAIRCASE EXIT - Behind player */}
      <group position={[0, 0, 4]}>
        {/* Door frame */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2.2, 3.2, 0.3]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
        </mesh>
        
        {/* Opening */}
        <mesh position={[0, 1.5, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.8, 0.2]} />
          <meshStandardMaterial color="#1a1210" roughness={0.6} />
        </mesh>
        
        {/* Clickable text */}
        <Text
          position={[0, 3.2, 0.4]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          onClick={(e) => {
            e.stopPropagation();
            onShowExitConfirm(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setStairsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setStairsHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          Go Down
        </Text>
        
        {/* Glow when hovered */}
        {stairsHovered && (
          <mesh position={[0, 3.2, 0.35]}>
            <planeGeometry args={[1.5, 0.5]} />
            <meshBasicMaterial color="#ffaa44" transparent opacity={0.2} />
          </mesh>
        )}
      </group>

      {/* STORAGE SHELVES - Left wall */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`shelf-left-${i}`} position={[-9, 1.2, -14 + i * 6]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 2.4, 2]} />
            <meshStandardMaterial color="#3a2515" roughness={0.9} />
          </mesh>
          {/* Shelves */}
          {[0.6, 1.2].map((y, j) => (
            <mesh key={`shelf-${j}`} position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.95, 0.05, 1.95]} />
              <meshStandardMaterial color="#4a3520" roughness={0.8} />
            </mesh>
          ))}
          
          {/* Add clickable text to the middle shelf */}
          {i === 1 && (
            <>
              <Text
                position={[0.8, 1.8, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.03}
                outlineColor="#000000"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShelfClick([-6, 1.5, -6]);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setShelfHovered(true);
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setShelfHovered(false);
                  document.body.style.cursor = 'default';
                }}
              >
                Old Bookshelf
              </Text>
              
              {/* Glow when hovered */}
              {shelfHovered && (
                <mesh position={[0.8, 1.8, 0]}>
                  <planeGeometry args={[2.2, 0.5]} />
                  <meshBasicMaterial color="#ffaa44" transparent opacity={0.2} />
                </mesh>
              )}
            </>
          )}
        </group>
      ))}

      {/* Small table next to the middle left bookshelf with candle */}
      <group position={[-6.5, 0, -8]}>
        {/* Table top */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.08, 0.8]} />
          <meshStandardMaterial color="#3a2515" roughness={0.8} />
        </mesh>
        {/* Table legs */}
        {[[-0.4, -0.2, -0.3], [0.4, -0.2, -0.3], [-0.4, -0.2, 0.3], [0.4, -0.2, 0.3]].map((pos, i) => (
          <mesh key={`table-leg-${i}`} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#2a1a0f" roughness={0.9} />
          </mesh>
        ))}
        
        {/* Candle on table */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#f0e0c0" roughness={0.8} />
        </mesh>
        
        {/* Flame - with flickering, clickable to blow out */}
        {candleLit && (
          <mesh 
            position={[0, 0.6, 0]}
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
              emissiveIntensity={candleHovered ? candleIntensity * 1.3 : candleIntensity} 
            />
            <pointLight intensity={candleIntensity * 0.8} distance={5} color="#ffaa66" />
          </mesh>
        )}
      </group>

      {/* STORAGE SHELVES - Right wall */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`shelf-right-${i}`} position={[9, 1.2, -14 + i * 6]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 2.4, 2]} />
            <meshStandardMaterial color="#3a2515" roughness={0.9} />
          </mesh>
          {/* Shelves */}
          {[0.6, 1.2].map((y, j) => (
            <mesh key={`shelf-${j}`} position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.95, 0.05, 1.95]} />
              <meshStandardMaterial color="#4a3520" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* STORAGE SHELVES - Back wall */}
      {Array.from({ length: 2 }).map((_, i) => (
        <group key={`shelf-back-${i}`} position={[-4 + i * 8, 1.2, -15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2, 2.4, 1]} />
            <meshStandardMaterial color="#3a2515" roughness={0.9} />
          </mesh>
          {/* Shelves */}
          {[0.6, 1.2].map((y, j) => (
            <mesh key={`shelf-${j}`} position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.95, 0.05, 0.95]} />
              <meshStandardMaterial color="#4a3520" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* LARGE CRATES - Scattered around */}
      <group position={[-5, 0, -8]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.2, 1.5]} />
          <meshStandardMaterial color="#4a3520" roughness={0.9} />
        </mesh>
        {/* Crate bands */}
        <mesh position={[0, 0.6, 0.76]}>
          <boxGeometry args={[1.52, 0.1, 0.05]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, -0.76]}>
          <boxGeometry args={[1.52, 0.1, 0.05]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
        </mesh>
      </group>

      <group position={[5, 0, -10]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.2, 1.5]} />
          <meshStandardMaterial color="#4a3520" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.6, 0.76]}>
          <boxGeometry args={[1.52, 0.1, 0.05]} />
          <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
        </mesh>
      </group>

      {/* STACK OF BOXES - Center area */}
      <group position={[0, 0, -10]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#4a3520" roughness={0.9} />
        </mesh>
        <mesh position={[0.3, 1.1, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.8, 1]} />
          <meshStandardMaterial color="#3a2515" roughness={0.9} />
        </mesh>
        <mesh position={[-0.2, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshStandardMaterial color="#4a3520" roughness={0.9} />
        </mesh>
        
        {/* Clickable paper on front side of top box */}
        <mesh 
          position={[-0.2, 1.8, 0.41]} 
          rotation={[0, 0, 0.1]} 
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onShowPaper(true);
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
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial 
            color={paperHovered ? "#ffffff" : "#f0e8d8"} 
            roughness={0.9}
            emissive={paperHovered ? "#ffaa44" : "#000000"}
            emissiveIntensity={paperHovered ? 0.3 : 0}
          />
        </mesh>
        
        {/* Glowing outline when paper hovered */}
        {paperHovered && (
          <mesh position={[-0.2, 1.8, 0.42]} rotation={[0, 0, 0.1]}>
            <planeGeometry args={[0.35, 0.45]} />
            <meshBasicMaterial color="#ffaa44" transparent opacity={0.4} />
          </mesh>
        )}
        
        {/* Clickable text above boxes */}
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          onClick={(e) => {
            e.stopPropagation();
            handleShelfClick([0, 1.5, -7]);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setBoxesHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setBoxesHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          Storage Boxes
        </Text>
        
        {/* Glow when hovered */}
        {boxesHovered && (
          <mesh position={[0, 2.8, 0]}>
            <planeGeometry args={[2.2, 0.5]} />
            <meshBasicMaterial color="#ffaa44" transparent opacity={0.2} />
          </mesh>
        )}
      </group>

      {/* BARRELS - Various locations */}
      <group position={[-7, 0, -5]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial color="#3a2010" roughness={0.9} />
        </mesh>
        <mesh position={[0.9, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial color="#3a2010" roughness={0.9} />
        </mesh>
        <mesh position={[0.45, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial color="#3a2010" roughness={0.9} />
        </mesh>
      </group>

      <group position={[7, 0, -12]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial color="#3a2010" roughness={0.9} />
        </mesh>
        <mesh position={[0.9, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial color="#3a2010" roughness={0.9} />
        </mesh>
      </group>

      {/* OLD FURNITURE COVERED WITH SHEETS */}
      <group position={[3, 0, -5]}>
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 1.6, 1.5]} />
          <meshStandardMaterial color="#d0d0c0" roughness={0.95} />
        </mesh>
      </group>

      <group position={[-3, 0, -12]}>
        {/* Sheet covering - only visible if not uncovered */}
        {!furnitureUncovered && (
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.2, 1.2]} />
            <meshStandardMaterial color="#d0d0c0" roughness={0.95} />
          </mesh>
        )}
        
        {/* Revealed furniture - old desk with UPSIDE-DOWN CANDLE */}
        {furnitureUncovered && (
          <>
            {/* Desk top */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.08, 1]} />
              <meshStandardMaterial color="#3a2515" roughness={0.8} />
            </mesh>
            {/* Desk legs */}
            {[[-0.6, -0.2, -0.4], [0.6, -0.2, -0.4], [-0.6, -0.2, 0.4], [0.6, -0.2, 0.4]].map((pos, i) => (
              <mesh key={`desk-leg-${i}`} position={pos as [number, number, number]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
                <meshStandardMaterial color="#2a1a0f" roughness={0.9} />
              </mesh>
            ))}
            {/* Old book on desk */}
            <mesh position={[-0.3, 0.56, 0]} castShadow>
              <boxGeometry args={[0.3, 0.06, 0.4]} />
              <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
            </mesh>
            
            {/* UPSIDE-DOWN CANDLE ON DESK - The winning candle */}
            <group position={[0.3, 0.54, 0]} rotation={[Math.PI, 0, 0]}>
              {/* Candle body - upside down */}
              <mesh 
                position={[0, 0, 0]} 
                castShadow
                onClick={(e) => {
                  e.stopPropagation();
                  handleWinningCandleClick();
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setWinningCandleHovered(true);
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setWinningCandleHovered(false);
                  document.body.style.cursor = 'default';
                }}
              >
                <cylinderGeometry args={[0.05, 0.05, 0.25, 16]} />
                <meshStandardMaterial 
                  color={winningCandleHovered ? "#ffffff" : "#f0e0c0"} 
                  roughness={0.7}
                  emissive={winningCandleHovered ? "#ffaa44" : "#000000"}
                  emissiveIntensity={winningCandleHovered ? 0.5 : 0}
                />
              </mesh>
              
              {/* Flame pointing down (upside down) */}
              <mesh position={[0, -0.14, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial 
                  color="#44aaff" 
                  emissive="#44aaff" 
                  emissiveIntensity={winningCandleHovered ? 2.5 : 1.8} 
                />
                <pointLight intensity={winningCandleHovered ? 1.5 : 1} distance={4} color="#44aaff" />
              </mesh>
              
              {/* Mysterious glow ring around it */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.13, 32]} />
                <meshBasicMaterial color="#44aaff" transparent opacity={0.5} side={2} />
              </mesh>
            </group>
          </>
        )}
        
        {/* Clickable text above furniture */}
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.28}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          onClick={(e) => {
            e.stopPropagation();
            handleShelfClick([-3, 1.5, -9]);
            // Show uncover prompt after animation if not already uncovered
            if (!furnitureUncovered) {
              setTimeout(() => onShowUncoverPrompt(true), 2500);
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setFurnitureHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setFurnitureHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          {furnitureUncovered ? "Old Desk" : "Covered Furniture"}
        </Text>
        
        {/* Glow when hovered */}
        {furnitureHovered && (
          <mesh position={[0, 1.5, 0]}>
            <planeGeometry args={[2.5, 0.5]} />
            <meshBasicMaterial color="#ffaa44" transparent opacity={0.2} />
          </mesh>
        )}
      </group>

      {/* LANTERNS - Hanging from ceiling */}
      {[
        [-6, 3.5, -8], [6, 3.5, -8], [0, 3.5, -12], [-6, 3.5, -3], [6, 3.5, -3],
      ].map((pos, i) => (
        <group key={`lantern-${i}`} position={pos as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 6]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.6} metalness={0.4} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={1.5} />
            <pointLight intensity={1.2} distance={6} color="#ffaa66" />
          </mesh>
        </group>
      ))}

      {/* COBWEBS - In all corners */}
      {[
        [-9.5, 3.8, -15.5], [9.5, 3.8, -15.5], [-9.5, 3.8, 3.5], [9.5, 3.8, 3.5],
      ].map((pos, i) => (
        <group key={`cobweb-${i}`} position={pos as [number, number, number]}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshBasicMaterial color="#cccccc" transparent opacity={0.2} side={2} />
          </mesh>
        </group>
      ))}

      {/* FLOOR RUG - Center */}
      <mesh position={[0, 0.02, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.95} />
      </mesh>
    </>
  );
}

export default function LibraryAtticScene() {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPaper, setShowPaper] = useState(false);
  const [showUncoverPrompt, setShowUncoverPrompt] = useState(false);
  const [showWinning, setShowWinning] = useState(false);
  const [furnitureUncovered, setFurnitureUncovered] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

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

  const handleReturnToLibrary = () => {
    router.push('/room/null-candles');
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 1.5, 2]} cameraFov={75}>
        <color attach="background" args={['#1a1510']} />
        <AtticContent 
          onShowExitConfirm={setShowExitConfirm}
          onShowPaper={setShowPaper}
          onShowUncoverPrompt={setShowUncoverPrompt}
          onWinningCandleClick={() => setShowWinning(true)}
          furnitureUncovered={furnitureUncovered}
          candleLit={candleLit}
          onCandleBlowOut={() => setCandleLit(false)}
        />
      </Scene3D>

      {/* Success overlay */}
      {showWinning && (
        <Overlay title="The True Candle Found">
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={() => router.push('/')} />
          </div>
        </Overlay>
      )}

      {/* Uncover furniture prompt */}
      {showUncoverPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 border-2 border-gray-700 p-6 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Covered Furniture</h2>
            <p className="text-gray-300 mb-6 text-center">
              A dusty sheet covers something beneath. Remove it?
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                label="Uncover Furniture" 
                onClick={() => {
                  setShowUncoverPrompt(false);
                  setFurnitureUncovered(true);
                }} 
              />
              <Button 
                label="Leave It" 
                onClick={() => setShowUncoverPrompt(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Paper popup */}
      {showPaper && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white border-4 border-gray-800 p-8 rounded-lg max-w-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center font-serif">Attic Inventory</h2>
            <div className="text-gray-800 text-lg leading-relaxed mb-6 font-serif">
              <p className="mb-4">
                <span className="font-bold">Storage Log - Year Unknown</span>
              </p>
              <p className="mb-3">
                Items catalogued and stored in upper library chamber:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Ancient manuscripts (condition: deteriorating)</li>
                <li>Forbidden texts (sealed)</li>
                <li>Personal effects of previous librarians</li>
                <li>Ceremonial artifacts</li>
                <li>One peculiar candle that never seems to burn down...</li>
              </ul>
              <p className="text-sm text-gray-600 italic mt-6">
                Note: Some items have been moved to unknown locations. 
                Strange sounds reported from the corners at night.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowPaper(false)}
                className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirmation popup */}
      {showExitConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 border-2 border-gray-700 p-6 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Return to Library?</h2>
            <p className="text-gray-300 mb-6 text-center">
              Go back down to the main library floor?
            </p>
            <div className="flex gap-3">
              <Button label="Yes, Go Down" onClick={handleReturnToLibrary} />
              <Button label="Stay Here" onClick={() => setShowExitConfirm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
