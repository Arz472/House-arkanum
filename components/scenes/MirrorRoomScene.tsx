'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame, useThree } from '@react-three/fiber';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

type BodyPart = 'leg' | 'arm' | 'hand' | 'face';
type GamePhase = 'find_leg' | 'find_arm' | 'find_hand' | 'find_face' | 'reveal' | 'complete';

// Task instruction messages
const TASK_MESSAGES: Record<GamePhase, { title: string; instruction: string }> = {
  find_leg: {
    title: 'TASK 1: FIND THE LEG',
    instruction: 'Search the dark workshop for the missing leg.\nLook around the room carefully.'
  },
  find_arm: {
    title: 'TASK 2: FIND THE ARM',
    instruction: 'The arm is somewhere in this room.\nBring it back to the table when you find it.'
  },
  find_hand: {
    title: 'TASK 3: FIND THE HAND',
    instruction: 'Only the hand remains missing.\nSearch carefully - it\'s smaller than the others.'
  },
  find_face: {
    title: 'TASK 4: FIND THE FACE',
    instruction: 'The final piece. The face.\nOnce attached, everything will be complete.'
  },
  reveal: {
    title: '',
    instruction: ''
  },
  complete: {
    title: '',
    instruction: ''
  }
};

const PART_POSITIONS: Record<BodyPart, [number, number, number]> = {
  leg: [-6, 0.5, -6],
  arm: [5, 1.2, 4],
  hand: [6, 0.8, -3],
  face: [-5, 1.0, 5]
};

const VOICE_LINES: Record<BodyPart, string> = {
  leg: "You used to chase me around the house with these old legs… Funny… I can't remember who was laughing louder.",
  arm: "These hands… You always tried to fix everything yourself. I guess I learned that from you.",
  hand: "I remember holding your hand. Somewhere along the way… you forgot how to hold mine back.",
  face: "There you are."
};

const VOICE_AUDIO: Record<BodyPart | 'final', string> = {
  leg: '/KIRO_ASSETS/Voices/mirror door/leg.mp3',
  arm: '/KIRO_ASSETS/Voices/mirror door/arm.mp3',
  hand: '/KIRO_ASSETS/Voices/mirror door/hand.mp3',
  face: '/KIRO_ASSETS/Voices/mirror door/there you are.mp3',
  final: '/KIRO_ASSETS/Voices/mirror door/it was me.mp3'
};

const FINAL_REVEAL = "You thought you were fixing your son… but it was me, wasn't it, Dad? I've been here the whole time. Putting you back together.";

interface BodyPartMeshProps {
  part: BodyPart;
  position: [number, number, number];
  isCollected: boolean;
  playerPosition: THREE.Vector3;
  lookDirection: THREE.Vector3;
  canInteract: boolean;
}

function BodyPartMesh({ part, position, isCollected, playerPosition, lookDirection, canInteract }: BodyPartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isInRange, setIsInRange] = useState(false);
  
  useFrame(() => {
    if (isCollected || !meshRef.current) return;
    
    // Check distance to player
    const distance = playerPosition.distanceTo(new THREE.Vector3(...position));
    const inRange = distance < 2.5;
    
    // Check if player is looking at the part
    const toPartDir = new THREE.Vector3(...position).sub(playerPosition).normalize();
    const lookDot = lookDirection.dot(toPartDir);
    const isLookingAt = lookDot > 0.7;
    
    setIsInRange(inRange && isLookingAt && canInteract);
    
    // Gentle glow animation
    const time = Date.now() * 0.001;
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
  });
  
  if (isCollected) return null;
  
  const partNames: Record<BodyPart, string> = {
    leg: 'Leg',
    arm: 'Arm', 
    hand: 'Hand',
    face: 'Face'
  };
  
  return (
    <group position={position}>
      {/* Leg - cylinder for thigh + cylinder for shin */}
      {part === 'leg' && (
        <group>
          <mesh ref={meshRef} position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.55, 0]}>
            <boxGeometry args={[0.15, 0.08, 0.25]} />
            <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>
      )}
      
      {/* Arm - upper arm + forearm */}
      {part === 'arm' && (
        <group>
          <mesh ref={meshRef} position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.4, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>
      )}
      
      {/* Hand - palm + fingers */}
      {part === 'hand' && (
        <group>
          <mesh ref={meshRef} position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 0.2, 0.08]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
          {/* Fingers */}
          {[-0.05, -0.02, 0.01, 0.04].map((offset, i) => (
            <mesh key={i} position={[offset, 0.15, 0]}>
              <boxGeometry args={[0.02, 0.1, 0.06]} />
              <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh position={[-0.08, 0.05, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.02, 0.08, 0.06]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>
      )}
      
      {/* Face - head shape with features */}
      {part === 'face' && (
        <group>
          <mesh ref={meshRef} position={[0, 0, 0]}>
            <boxGeometry args={[0.35, 0.45, 0.25]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.7} />
          </mesh>
          {/* Eye sockets */}
          <mesh position={[-0.1, 0.08, 0.13]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[0.1, 0.08, 0.13]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          {/* Nose */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[0.06, 0.1, 0.08]} />
            <meshStandardMaterial color="#777777" metalness={0.5} roughness={0.7} />
          </mesh>
          {/* Mouth line */}
          <mesh position={[0, -0.12, 0.13]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      )}

      {/* Floating text label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.25}
        color={isInRange ? "#00ff00" : "white"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {partNames[part]}
      </Text>
      
      {/* E to pick up prompt */}
      {isInRange && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          [E] Pick Up
        </Text>
      )}
    </group>
  );
}

interface AnimatronicProps {
  attachedParts: Set<BodyPart>;
  isRevealing: boolean;
}

function Animatronic({ attachedParts, isRevealing }: AnimatronicProps) {
  const torsoRef = useRef<THREE.Group>(null);
  const [sitUpProgress, setSitUpProgress] = useState(0);
  
  useFrame((state, delta) => {
    if (isRevealing && sitUpProgress < 1) {
      setSitUpProgress(prev => Math.min(1, prev + delta * 0.5));
    }
    
    if (torsoRef.current) {
      // Sit up animation - rotate from lying down to sitting
      const targetRotation = isRevealing ? 0 : -Math.PI / 2;
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(-Math.PI / 2, targetRotation, sitUpProgress);
    }
  });
  
  return (
    <group position={[0, 1.2, 0]}>
      {/* Table */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[2, 0.1, 3]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
      
      {/* Table legs */}
      {[[-0.9, -1.1, -1.4], [0.9, -1.1, -1.4], [-0.9, -1.1, 1.4], [0.9, -1.1, 1.4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      ))}
      
      {/* Animatronic body */}
      <group ref={torsoRef}>
        {/* Torso */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.4]} />
          <meshStandardMaterial color="#555555" metalness={0.6} />
        </mesh>
        
        {/* Right leg (missing - player finds this) */}
        {attachedParts.has('leg') && (
          <group position={[-0.2, -0.9, 0]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            <mesh position={[0, -0.55, 0]}>
              <boxGeometry args={[0.15, 0.08, 0.25]} />
              <meshStandardMaterial color="#555555" />
            </mesh>
          </group>
        )}
        
        {/* Left leg (already attached) */}
        <group position={[0.2, -0.9, 0]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <mesh position={[0, -0.55, 0]}>
            <boxGeometry args={[0.15, 0.08, 0.25]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        </group>
        
        {/* Right arm (missing - player finds this) */}
        {attachedParts.has('arm') && (
          <group position={[0.6, 0.3, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.4, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          </group>
        )}
        
        {/* Left arm (already attached) */}
        <group position={[-0.6, 0.3, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.4, 8]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </group>
        
        {/* Right hand (missing - player finds this) */}
        {attachedParts.has('hand') && (
          <group position={[0.85, -0.3, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.2, 0.08]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            {/* Fingers */}
            {[-0.05, -0.02, 0.01, 0.04].map((offset, i) => (
              <mesh key={i} position={[offset, 0.15, 0]}>
                <boxGeometry args={[0.02, 0.1, 0.06]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            ))}
            {/* Thumb */}
            <mesh position={[-0.08, 0.05, 0]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.02, 0.08, 0.06]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          </group>
        )}
        
        {/* Left hand (already attached) */}
        <group position={[-0.85, -0.3, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 0.2, 0.08]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          {/* Fingers */}
          {[-0.05, -0.02, 0.01, 0.04].map((offset, i) => (
            <mesh key={i} position={[offset, 0.15, 0]}>
              <boxGeometry args={[0.02, 0.1, 0.06]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh position={[0.08, 0.05, 0]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.02, 0.08, 0.06]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </group>
        
        {/* Head/Face */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#555555" metalness={0.6} />
        </mesh>
        
        {/* Face attached */}
        {attachedParts.has('face') && (
          <>
            {/* Eyes */}
            <mesh position={[-0.12, 0.85, 0.21]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial 
                color="#ff0000" 
                emissive="#ff0000"
                emissiveIntensity={isRevealing ? 2 : 0.5}
              />
            </mesh>
            <mesh position={[0.12, 0.85, 0.21]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial 
                color="#ff0000" 
                emissive="#ff0000"
                emissiveIntensity={isRevealing ? 2 : 0.5}
              />
            </mesh>
          </>
        )}
      </group>
      
      {/* Overhead light */}
      <pointLight position={[0, 3, 0]} intensity={2} distance={8} color="#ffeecc" />
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#222222" emissive="#ffeecc" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

interface MirrorRoomContentProps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  heldPart: BodyPart | null;
  setHeldPart: (part: BodyPart | null) => void;
  attachedParts: Set<BodyPart>;
  setAttachedParts: (parts: Set<BodyPart>) => void;
  currentVoiceLine: string;
  setCurrentVoiceLine: (line: string) => void;
  setIsNearTable: (near: boolean) => void;
  setIsNearPart: (near: boolean) => void;
}

function MirrorRoomContent({
  phase,
  setPhase,
  heldPart,
  setHeldPart,
  attachedParts,
  setAttachedParts,
  currentVoiceLine,
  setCurrentVoiceLine,
  setIsNearTable,
  setIsNearPart
}: MirrorRoomContentProps) {
  const { camera, size } = useThree();
  const playerPosition = useRef(new THREE.Vector3(0, 1.6, 8));
  const lookDirection = useRef(new THREE.Vector3(0, 0, -1));
  const velocity = useRef(new THREE.Vector3());
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  const isNearTableRef = useRef(false);
  const isNearPartRef = useRef(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'KeyE':
          if (heldPart && isNearTableRef.current) {
            handleAttachPart();
          } else if (!heldPart && isNearPartRef.current) {
            handlePickupPart();
          }
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (e.clientX / size.width) * 2 - 1;
      mousePos.current.y = -(e.clientY / size.height) * 2 + 1;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [heldPart, size]);
  
  const handlePickupPart = () => {
    // Check if this is the correct part for current phase
    const expectedPart = phase.replace('find_', '') as BodyPart;
    setHeldPart(expectedPart);
  };
  
  const handleAttachPart = () => {
    if (!heldPart) return;
    
    // Attach the part
    const newAttached = new Set(attachedParts);
    newAttached.add(heldPart);
    setAttachedParts(newAttached);
    
    // Show voice line and play audio
    setCurrentVoiceLine(VOICE_LINES[heldPart]);
    
    // Play voice audio
    const audio = new Audio(VOICE_AUDIO[heldPart]);
    audio.volume = 0.8;
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    // Progress to next phase
    setTimeout(() => {
      setCurrentVoiceLine('');
      
      if (heldPart === 'leg') {
        setPhase('find_arm');
      } else if (heldPart === 'arm') {
        setPhase('find_hand');
      } else if (heldPart === 'hand') {
        setPhase('find_face');
      } else if (heldPart === 'face') {
        setPhase('reveal');
        setTimeout(() => {
          setCurrentVoiceLine(FINAL_REVEAL);
          
          // Play final reveal audio
          const finalAudio = new Audio(VOICE_AUDIO.final);
          finalAudio.volume = 0.8;
          finalAudio.play().catch(err => console.log('Audio play failed:', err));
          
          setTimeout(() => {
            // Fade out voice line
            setCurrentVoiceLine('');
            setTimeout(() => {
              markRoomFixed('mirror');
              setPhase('complete');
            }, 1000);
          }, 6000);
        }, 2000);
      }
      
      setHeldPart(null);
    }, 4000);
  };
  
  useFrame((state, delta) => {
    // Mouse parallax - full 360 degree horizontal rotation only (no tilt)
    targetRotation.current.y = -mousePos.current.x * Math.PI; // Full horizontal rotation (inverted) - 360 degrees
    
    // Smoothly interpolate camera rotation with higher lerp factor for more fluid movement
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.08;
    camera.rotation.x = 0; // Keep camera level - no tilt
    
    // Update look direction from camera
    camera.getWorldDirection(lookDirection.current);
    
    // Movement
    const moveSpeed = 5 * delta;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    
    velocity.current.set(0, 0, 0);
    
    if (moveState.current.forward) velocity.current.add(forward.multiplyScalar(moveSpeed));
    if (moveState.current.backward) velocity.current.add(forward.multiplyScalar(-moveSpeed));
    if (moveState.current.left) velocity.current.add(right.multiplyScalar(-moveSpeed));
    if (moveState.current.right) velocity.current.add(right.multiplyScalar(moveSpeed));
    
    playerPosition.current.add(velocity.current);
    
    // Constrain to room bounds
    playerPosition.current.x = Math.max(-7, Math.min(7, playerPosition.current.x));
    playerPosition.current.z = Math.max(-7, Math.min(7, playerPosition.current.z));
    
    camera.position.copy(playerPosition.current);
    
    // Check if near table
    const distanceToTable = playerPosition.current.distanceTo(new THREE.Vector3(0, 1.6, 0));
    const nearTable = distanceToTable < 3;
    isNearTableRef.current = nearTable;
    setIsNearTable(nearTable);
    
    // Check if near current part
    if (!heldPart && phase.startsWith('find_')) {
      const currentPartType = phase.replace('find_', '') as BodyPart;
      const partPos = PART_POSITIONS[currentPartType];
      const distanceToPart = playerPosition.current.distanceTo(new THREE.Vector3(...partPos));
      
      // Check if looking at part
      const toPartDir = new THREE.Vector3(...partPos).sub(playerPosition.current).normalize();
      const lookDot = lookDirection.current.dot(toPartDir);
      const isLookingAtPart = lookDot > 0.7;
      
      const nearPart = distanceToPart < 2.5 && isLookingAtPart;
      isNearPartRef.current = nearPart;
      setIsNearPart(nearPart);
    } else {
      isNearPartRef.current = false;
      setIsNearPart(false);
    }
  });
  
  const currentPart = phase.startsWith('find_') ? phase.replace('find_', '') as BodyPart : null;
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <fog attach="fog" args={['#111111', 5, 15]} />
      
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 4, -10]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-10, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[10, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 4, 10]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Animatronic on table */}
      <Animatronic attachedParts={attachedParts} isRevealing={phase === 'reveal'} />
      
      {/* Body parts to collect */}
      {(['leg', 'arm', 'hand', 'face'] as BodyPart[]).map(part => {
        const currentPartType = phase.startsWith('find_') ? phase.replace('find_', '') as BodyPart : null;
        const canInteract = part === currentPartType && !heldPart;
        
        return (
          <BodyPartMesh
            key={part}
            part={part}
            position={PART_POSITIONS[part]}
            isCollected={attachedParts.has(part) || heldPart === part}
            playerPosition={playerPosition.current}
            lookDirection={lookDirection.current}
            canInteract={canInteract}
          />
        );
      })}
      
      {/* Scattered props for atmosphere */}
      <mesh position={[6, 0.5, 6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-6, 0.3, -3]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </>
  );
}

import PauseMenu from '@/components/ui/PauseMenu';
import { usePauseMenu } from '@/lib/usePauseMenu';

export default function MirrorRoomScene() {
  const [phase, setPhase] = useState<GamePhase>('find_leg');
  const [heldPart, setHeldPart] = useState<BodyPart | null>(null);
  const [attachedParts, setAttachedParts] = useState<Set<BodyPart>>(new Set());
  const [currentVoiceLine, setCurrentVoiceLine] = useState('');
  const [isNearTable, setIsNearTable] = useState(false);
  const [isNearPart, setIsNearPart] = useState(false);
  const router = useRouter();
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const { isPaused, closePause } = usePauseMenu();

  // Background music
  useEffect(() => {
    const audio = new Audio('/KIRO_ASSETS/Voices/mirror door/mind chaos.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Background audio play failed:', err));
    bgAudioRef.current = audio;

    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, []);

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      {/* Pause Menu */}
      <PauseMenu isOpen={isPaused} onClose={closePause} roomName="Mirror Room" />
      
      <Scene3D cameraPosition={[0, 1.6, 8]} cameraFov={75}>
        <color attach="background" args={['#111111']} />
        <MirrorRoomContent 
          phase={phase}
          setPhase={setPhase}
          heldPart={heldPart}
          setHeldPart={setHeldPart}
          attachedParts={attachedParts}
          setAttachedParts={setAttachedParts}
          currentVoiceLine={currentVoiceLine}
          setCurrentVoiceLine={setCurrentVoiceLine}
          setIsNearTable={setIsNearTable}
          setIsNearPart={setIsNearPart}
        />
      </Scene3D>

      {/* Task Instructions */}
      {TASK_MESSAGES[phase].title && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 text-center z-10 bg-black bg-opacity-80 p-6 rounded-lg border-2 border-cyan-500 max-w-xl">
          <h2 className="font-mono text-2xl text-cyan-400 mb-3 font-bold">
            {TASK_MESSAGES[phase].title}
          </h2>
          <p className="font-mono text-base text-gray-300 whitespace-pre-line leading-relaxed">
            {TASK_MESSAGES[phase].instruction}
          </p>
          <div className="mt-3 text-xs text-gray-500 font-mono">
            WASD to move • Mouse to look around • E to interact
          </div>
        </div>
      )}

      {/* Holding part reminder */}
      {heldPart && (
        <div className="absolute bottom-4 left-4 bg-black/90 border border-yellow-500 px-4 py-3 rounded z-20">
          <p className="text-yellow-500 font-mono text-sm font-bold">Holding: {heldPart.toUpperCase()}</p>
          <p className="text-yellow-500/80 font-mono text-xs mt-1">
            {isNearTable ? '[E] Attach to body' : 'Return to the table in the center'}
          </p>
        </div>
      )}
      
      {/* Pick up prompt when near part */}
      {!heldPart && isNearPart && phase.startsWith('find_') && (
        <div className="absolute bottom-4 left-4 bg-black/90 border border-green-500 px-4 py-3 rounded z-20">
          <p className="text-green-500 font-mono text-sm font-bold">[E] Pick up {phase.replace('find_', '')}</p>
        </div>
      )}

      {/* Voice line display */}
      {currentVoiceLine && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 border border-red-500 px-8 py-6 rounded z-30 max-w-2xl transition-opacity duration-1000">
          <p className="text-red-500 font-mono text-lg text-center italic">
            "{currentVoiceLine}"
          </p>
        </div>
      )}

      {/* Success overlay */}
      {phase === 'complete' && (
        <Overlay title="The Mirror Breaks">
          <p className="text-center text-gray-300 mb-4 font-mono">
            You weren't rebuilding him. He was rebuilding you.
          </p>
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
      
      {/* Mouse look hint */}
      <div className="absolute top-4 right-4 bg-black/80 border border-cyan-500 px-3 py-2 rounded z-20">
        <p className="text-cyan-500 font-mono text-xs">Move mouse to look around</p>
      </div>
    </div>
  );
}
