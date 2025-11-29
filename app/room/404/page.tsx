'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import { useGameState } from '@/store/gameState';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';

// Clickable paper clue component (handwritten notes)
function PaperClue({ position, rotation, text, onRead, audioFile }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
  text: string;
  onRead: () => void;
  audioFile?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onRead();
    
    // Play audio if provided
    if (audioFile) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(audioFile);
      audioRef.current.play();
    }
  };
  
  return (
    <mesh 
      position={position} 
      rotation={rotation || [0, 0, 0]}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <planeGeometry args={[0.4, 0.5]} />
      <meshStandardMaterial 
        color={hovered ? "#ffffff" : "#f5f5dc"} 
        emissive={hovered ? "#ffff88" : "#ffffcc"}
        emissiveIntensity={hovered ? 0.8 : 0.5}
      />
    </mesh>
  );
}

// Blue medical stamp component
function MedicalStamp({ position, rotation, text, onRead }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
  text: string;
  onRead: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <mesh 
      position={position} 
      rotation={rotation || [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onRead();
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <planeGeometry args={[0.5, 0.6]} />
      <meshStandardMaterial 
        color={hovered ? "#6699ff" : "#4477cc"} 
        emissive={hovered ? "#6699ff" : "#3366aa"}
        emissiveIntensity={hovered ? 0.5 : 0.2}
      />
    </mesh>
  );
}

// Blue medical book component
function MedicalBook({ position, rotation, text, onRead, audioFile }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
  text: string;
  onRead: () => void;
  audioFile?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onRead();
    
    // Play audio if provided
    if (audioFile) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(audioFile);
      audioRef.current.play();
    }
  };
  
  return (
    <mesh 
      position={position} 
      rotation={rotation || [0, 0, 0]}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[0.4, 0.2, 0.6]} />
      <meshStandardMaterial 
        color="#0000ff" 
        emissive="#0066ff" 
        emissiveIntensity={hovered ? 4 : 2}
      />
    </mesh>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function GraduationParty({ onReadClue, clueTexts, showWhiteNotes }: { onReadClue: (index: number) => void; clueTexts: string[]; showWhiteNotes: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#8b7355" side={2} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#d4a574" side={2} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0.5, -5]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e8d5b7" side={2} />
      </mesh>
      {/* Front wall (with portal) */}
      <mesh position={[0, 0.5, 5]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e8d5b7" side={2} />
      </mesh>
      <mesh position={[0, 0.5, 4.9]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshStandardMaterial color="#2c5aa0" emissive="#2c5aa0" emissiveIntensity={0.8} side={2} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#d4a574" side={2} />
      </mesh>
      {/* Right wall */}
      <mesh position={[5, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#d4a574" side={2} />
      </mesh>
      {/* Happy Graduation Text on back wall */}
      <Text
        position={[0, 2, -4.9]}
        fontSize={0.5}
        color="#2c5aa0"
        anchorX="center"
        anchorY="middle"
      >
        HAPPY GRADUATION
      </Text>
      
      {/* Balloons */}
      <mesh position={[-3, 2, -3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[-2.5, 2.5, -3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>
      <mesh position={[2.5, 2.5, -3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffe66d" />
      </mesh>
      <mesh position={[3, 2, -3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#a8e6cf" />
      </mesh>
      <mesh position={[-3.5, 1.5, 2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[3.5, 1.5, 2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#9370db" />
      </mesh>
      
      {/* Table */}
      <mesh position={[0, -1.5, -1]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Graduation Cake */}
      <mesh position={[0, -1.2, -1]}>
        <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
        <meshStandardMaterial color="#fff5e1" />
      </mesh>
      <mesh position={[0, -0.9, -1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#ffe4e1" />
      </mesh>
      
      {/* Candle on cake */}
      <mesh position={[0, -0.7, -1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      {/* Flame */}
      <mesh position={[0, -0.4, -1]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffaa00" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, -0.4, -1]} intensity={0.8} color="#ffaa00" distance={2} />
      
      {/* Fake people around the room */}
      {/* Person 1 - left side */}
      <group position={[-3, -1, 1]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#4a90e2" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      {/* Person 2 - right side */}
      <group position={[3, -1, 1]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      {/* Person 3 - back left */}
      <group position={[-2, -1, -3]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#2ecc71" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      {/* Person 4 - back right */}
      <group position={[2, -1, -3]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#9b59b6" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      {/* CLUE 1: Medical admission paper on table - Only shows after all blue books found */}
      {showWhiteNotes && (
        <PaperClue 
          position={[-0.9, -1, -0.5]}
          rotation={[-Math.PI / 2, 0, 0.3]}
          text={clueTexts[0]}
          onRead={() => onReadClue(0)}
          audioFile="/KIRO_ASSETS/Voices/404 door/note1.mp3"
        />
      )}
      
      {/* BLUE MEDICAL BOOK ON TABLE */}
      <MedicalBook 
        position={[0.8, -1, -0.8]}
        text={clueTexts[4]}
        onRead={() => onReadClue(4)}
        audioFile="/KIRO_ASSETS/Voices/404 door/book1.mp3"
      />
    </group>
  );
}

function SoccerGame({ onReadClue, clueTexts, showWhiteNotes }: { onReadClue: (index: number) => void; clueTexts: string[]; showWhiteNotes: boolean }) {
  return (
    <group position={[0, -20, -20]}>
      {/* Floor - grass (bigger) */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#2d5016" side={2} />
      </mesh>
      {/* Ceiling - sky (bigger) */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#87ceeb" side={2} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1, -7.5]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#87ceeb" side={2} />
      </mesh>
      {/* Front wall (with portal) */}
      <mesh position={[0, 1, 7.5]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#87ceeb" side={2} />
      </mesh>
      <mesh position={[0, 1, 7.4]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} side={2} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-7.5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#6b8e23" side={2} />
      </mesh>
      {/* Right wall */}
      <mesh position={[7.5, 1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#6b8e23" side={2} />
      </mesh>
      
      {/* Goal at back */}
      <mesh position={[0, -1, -7]}>
        <boxGeometry args={[4, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1, -7]}>
        <boxGeometry args={[4, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-2, 0, -7]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[2, 0, -7]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Net for back goal */}
      <mesh position={[0, 0, -7.3]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.3} transparent />
      </mesh>
      
      {/* Goal at front */}
      <mesh position={[0, -1, 7]}>
        <boxGeometry args={[4, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1, 7]}>
        <boxGeometry args={[4, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-2, 0, 7]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[2, 0, 7]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Net for front goal */}
      <mesh position={[0, 0, 7.3]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.3} transparent />
      </mesh>
      
      {/* Soccer ball */}
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.41, 16, 16]} />
        <meshStandardMaterial color="#000000" wireframe />
      </mesh>
      
      {/* Players - Team 1 (Blue) */}
      <group position={[-3, -1, -2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#0066cc" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      <group position={[3, -1, -2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#0066cc" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      <group position={[0, -1, -4]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#0066cc" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      {/* Players - Team 2 (Red) */}
      <group position={[-3, -1, 2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      <group position={[3, -1, 2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      <group position={[0, -1, 4]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f5d5c0" />
        </mesh>
      </group>
      
      {/* CLUE 2: Medical log on sideline bench - Only shows after all blue books found */}
      {showWhiteNotes && (
        <PaperClue 
          position={[-6, -1.5, 3]}
          rotation={[-Math.PI / 2, 0, -0.2]}
          text={clueTexts[1]}
          onRead={() => onReadClue(1)}
          audioFile="/KIRO_ASSETS/Voices/404 door/note2.mp3"
        />
      )}
      
      {/* BLUE MEDICAL BOOK - SOCCER */}
      <MedicalBook 
        position={[-6, -1.5, 4.5]}
        rotation={[-Math.PI / 2, 0, 0.1]}
        text={clueTexts[5]}
        onRead={() => onReadClue(5)}
        audioFile="/KIRO_ASSETS/Voices/404 door/book2.mp3"
      />
    </group>
  );
}

function School({ onReadClue, clueTexts, showWhiteNotes }: { onReadClue: (index: number) => void; clueTexts: string[]; showWhiteNotes: boolean }) {
  return (
    <group position={[0, 0, -45]}>
      {/* Floor - HUGE */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#d4d4d4" side={2} />
      </mesh>
      {/* Ceiling - HUGE */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f5f5dc" side={2} />
      </mesh>
      {/* Back wall - BLACK chalkboard */}
      <mesh position={[0, 1.5, -15]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#f5f5dc" side={2} />
      </mesh>
      <mesh position={[0, 1.5, -14.9]}>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#1a1a1a" side={2} />
      </mesh>
      {/* Front wall (with portal) */}
      <mesh position={[0, 1.5, 15]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#f5f5dc" side={2} />
      </mesh>
      <mesh position={[0, 1.5, 14.9]}>
        <ringGeometry args={[2, 2.3, 32]} />
        <meshStandardMaterial color="#2f4f2f" emissive="#2f4f2f" emissiveIntensity={0.8} side={2} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-15, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#f5f5dc" side={2} />
      </mesh>
      {/* Right wall */}
      <mesh position={[15, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#f5f5dc" side={2} />
      </mesh>
      
      {/* Row 1 - Back left */}
      <mesh position={[-3, -1.5, -2]}>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-3, -1, -2.3]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Row 1 - Back right */}
      <mesh position={[3, -1.5, -2]}>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[3, -1, -2.3]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Row 2 - Middle left */}
      <mesh position={[-3, -1.5, 0]}>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-3, -1, -0.3]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Row 2 - Middle right */}
      <mesh position={[3, -1.5, 0]}>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[3, -1, -0.3]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Row 3 - Front left */}
      <mesh position={[-3, -1.5, 2]}>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-3, -1, 1.7]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Row 3 - Front right */}
      <mesh position={[3, -1.5, 2]}>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[3, -1, 1.7]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Teacher's desk at front */}
      <mesh position={[0, -2, -12]}>
        <boxGeometry args={[3, 0.15, 1.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Globe on teacher's desk */}
      <mesh position={[1, -1.5, -12]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#4169e1" />
      </mesh>
      
      {/* Books on teacher's desk */}
      <mesh position={[-0.8, -1.7, -12]}>
        <boxGeometry args={[0.3, 0.5, 0.4]} />
        <meshStandardMaterial color="#8b0000" />
      </mesh>
      <mesh position={[-0.4, -1.7, -12]}>
        <boxGeometry args={[0.3, 0.5, 0.4]} />
        <meshStandardMaterial color="#006400" />
      </mesh>
      
      {/* Clock on back wall */}
      <mesh position={[8, 4, -14.8]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[8, 4, -14.7]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Bulletin board on left wall */}
      <mesh position={[-14.8, 2, -8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#cd853f" />
      </mesh>
      
      {/* Papers on bulletin board */}
      <mesh position={[-14.7, 2.5, -7]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-14.7, 2.5, -9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial color="#ffff99" />
      </mesh>
      
      {/* Windows on right wall */}
      <mesh position={[14.8, 3, -5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial color="#87ceeb" opacity={0.6} transparent />
      </mesh>
      <mesh position={[14.8, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial color="#87ceeb" opacity={0.6} transparent />
      </mesh>
      <mesh position={[14.8, 3, 5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial color="#87ceeb" opacity={0.6} transparent />
      </mesh>
      
      {/* Bookshelf on left wall */}
      <mesh position={[-14, -1, 8]}>
        <boxGeometry args={[0.5, 3, 4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* CLUE 3: Incident report on teacher's desk - Only shows after all blue books found */}
      {showWhiteNotes && (
        <PaperClue 
          position={[0.8, -1.8, -12]}
          rotation={[-Math.PI / 2, 0, 0.5]}
          text={clueTexts[2]}
          onRead={() => onReadClue(2)}
          audioFile="/KIRO_ASSETS/Voices/404 door/note3.mp3"
        />
      )}
      
      {/* BLUE MEDICAL BOOK - SCHOOL */}
      <MedicalBook 
        position={[-0.5, -1.8, -12]}
        rotation={[-Math.PI / 2, 0, -0.3]}
        text={clueTexts[6]}
        onRead={() => onReadClue(6)}
        audioFile="/KIRO_ASSETS/Voices/404 door/book3.mp3"
      />
    </group>
  );
}

function Hospital({ onReadClue, clueTexts, showWhiteNotes }: { onReadClue: (index: number) => void; clueTexts: string[]; showWhiteNotes: boolean }) {
  return (
    <group position={[0, 0, -80]}>
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" side={2} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#ffffff" side={2} />
      </mesh>
      {/* Back wall - no portal (final room) */}
      <mesh position={[0, 0.5, -5]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#ffffff" side={2} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 0.5, 5]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#ffffff" side={2} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#f5f5f5" side={2} />
      </mesh>
      {/* Right wall */}
      <mesh position={[5, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#f5f5f5" side={2} />
      </mesh>
      {/* Hospital bed */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[2, 0.3, 3]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* IV stand */}
      <mesh position={[2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      {/* CLUE 4: Final medical note - THE TRUTH - Only shows after all blue books found */}
      {showWhiteNotes && (
        <PaperClue 
          position={[-2, -0.8, 1]}
          rotation={[-Math.PI / 2, 0, -0.4]}
          text={clueTexts[3]}
          onRead={() => onReadClue(3)}
          audioFile="/KIRO_ASSETS/Voices/404 door/note4.mp3"
        />
      )}
      
      {/* BLUE MEDICAL BOOK - HOSPITAL */}
      <MedicalBook 
        position={[-2, -0.8, 2]}
        rotation={[-Math.PI / 2, 0, 0.2]}
        text={clueTexts[7]}
        onRead={() => onReadClue(7)}
        audioFile="/KIRO_ASSETS/Voices/404 door/book4.mp3"
      />
    </group>
  );
}

function ForwardScrollContent({ scrollZ, mousePos, onReadClue, clueTexts, showWhiteNotes }: { 
  scrollZ: number; 
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
  onReadClue: (index: number) => void;
  clueTexts: string[];
  showWhiteNotes: boolean;
}) {
  useFrame((state) => {
    const camera = state.camera;
    
    // Smooth Z movement
    camera.position.z += (scrollZ - camera.position.z) * 0.1;
    
    // Calculate target Y based on Z position
    let targetY = 1; // Default Y for graduation party
    
    // Transition from graduation (Y: 1) to soccer (Y: -19) between Z: -10 and Z: -15
    if (scrollZ <= -10 && scrollZ >= -15) {
      const progress = (scrollZ + 10) / -5; // 0 at -10, 1 at -15
      targetY = 1 + (progress * -20); // Interpolate from 1 to -19
    } 
    // Stay at soccer level
    else if (scrollZ < -15 && scrollZ >= -35) {
      targetY = -19;
    }
    // Transition from soccer (Y: -19) to school (Y: 1) between Z: -35 and Z: -40
    else if (scrollZ <= -35 && scrollZ >= -40) {
      const progress = (scrollZ + 35) / -5; // 0 at -35, 1 at -40
      targetY = -19 + (progress * 20); // Interpolate from -19 to 1
    }
    // School scene - position camera at front of classroom
    else if (scrollZ < -40 && scrollZ >= -60) {
      targetY = 1;
    }
    // Beyond school
    else if (scrollZ < -60) {
      targetY = 1;
    }
    
    // Smooth Y movement
    camera.position.y += (targetY - camera.position.y) * 0.1;
    
    // Mouse parallax rotation
    const targetRotationY = -mousePos.current.x * 0.5;
    const targetRotationX = mousePos.current.y * 0.3;
    
    camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.05;
    camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.05;
  });
  
  return (
    <>
      <ambientLight intensity={showWhiteNotes ? 0.3 : 0.7} color={showWhiteNotes ? "#4a4a5e" : "#e8d5f0"} />
      <pointLight position={[0, 3, scrollZ + 5]} intensity={showWhiteNotes ? 0.3 : 0.8} color={showWhiteNotes ? "#6a5a7a" : "#ffd4e5"} />
      <pointLight position={[-5, 2, scrollZ]} intensity={showWhiteNotes ? 0.2 : 0.5} color={showWhiteNotes ? "#3a4a6a" : "#c5d4ff"} />
      <pointLight position={[5, 2, scrollZ]} intensity={showWhiteNotes ? 0.2 : 0.5} color={showWhiteNotes ? "#5a4a6a" : "#ffc5e8"} />
      <directionalLight position={[5, 5, scrollZ + 10]} intensity={showWhiteNotes ? 0.15 : 0.4} color={showWhiteNotes ? "#3a3a4a" : "#e8d5ff"} />
      
      <GraduationParty onReadClue={onReadClue} clueTexts={clueTexts} showWhiteNotes={showWhiteNotes} />
      <SoccerGame onReadClue={onReadClue} clueTexts={clueTexts} showWhiteNotes={showWhiteNotes} />
      <School onReadClue={onReadClue} clueTexts={clueTexts} showWhiteNotes={showWhiteNotes} />
      <Hospital onReadClue={onReadClue} clueTexts={clueTexts} showWhiteNotes={showWhiteNotes} />
    </>
  );
}

export default function Door404RoomPage() {
  const router = useRouter();
  const [scrollZ, setScrollZ] = useState(5);
  const mousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentClue, setCurrentClue] = useState<string | null>(null);
  const [cluesFound, setCluesFound] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  
  const MIN_Z = 5;
  const MAX_Z = -75;
  
  // Check if all 4 blue books (indices 4, 5, 6, 7) have been found
  const allBlueBooksFound = [4, 5, 6, 7].every(index => cluesFound.has(index));
  const [hasRespawned, setHasRespawned] = useState(false);
  
  // Respawn to graduation party when all blue books are found (only once)
  useEffect(() => {
    if (allBlueBooksFound && !hasRespawned) {
      setScrollZ(5);
      setHasRespawned(true);
    }
  }, [allBlueBooksFound, hasRespawned]);
  
  // Mark room as completed when all 8 clues are found
  useEffect(() => {
    if (cluesFound.size === 8) {
      markRoomFixed('door404');
      setShowSuccess(true);
    }
  }, [cluesFound, markRoomFixed]);
  
  // Background music management
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Start with light music
    const lightMusic = new Audio('/KIRO_ASSETS/Voices/404 door/bg music light.mp3');
    lightMusic.loop = true;
    lightMusic.volume = 0.3;
    lightMusic.play();
    bgMusicRef.current = lightMusic;
    
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);
  
  // Switch to dark music when all blue books are found
  useEffect(() => {
    if (allBlueBooksFound && bgMusicRef.current) {
      // Fade out current music
      const fadeOut = setInterval(() => {
        if (bgMusicRef.current && bgMusicRef.current.volume > 0.05) {
          bgMusicRef.current.volume -= 0.05;
        } else {
          clearInterval(fadeOut);
          if (bgMusicRef.current) {
            bgMusicRef.current.pause();
          }
          
          // Start dark music with custom loop point (0-26 seconds)
          const darkMusic = new Audio('/KIRO_ASSETS/Voices/404 door/bg music dark.mp3');
          darkMusic.volume = 0.3;
          
          // Custom loop: restart at 26 seconds
          darkMusic.addEventListener('timeupdate', () => {
            if (darkMusic.currentTime >= 26) {
              darkMusic.currentTime = 0;
            }
          });
          
          darkMusic.play();
          bgMusicRef.current = darkMusic;
        }
      }, 100);
    }
  }, [allBlueBooksFound]);
  
  const handleReturnToHallway = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    router.push('/');
  };
  
  const clueTexts = [
    "I'm so proud of you, kiddo. I can still see you standing there in your cap, smiling at me. I wish I'd taken more pictures… I can't seem to find any now. Maybe I misplaced the album again.",
    "You ran so fast today. I almost missed your goal because I blinked. Or… maybe you didn't score? I don't remember the cheering… But I remember you looking at me from the field. You always looked at me.",
    "Your teacher said you were doing well. She said you were bright. But when I try to picture her face, I can't. I look at the desks and I… I can't remember which one was yours. I don't want to forget you.",
    "I've been looking for you everywhere. The nurses keep telling me I'm alone, but I swear I hear your footsteps. I loved you. Even if you were only in my head.",
    "He's graduating with his Master's in Computer Science from TMU next week. I've never been prouder. He said he wants me in the front row.",
    "He played his heart out today. Scored the winning goal. I cheered so loud he covered his face, embarrassed… but I saw him smile.",
    "His teacher told me he's gifted. Said he asks questions nobody else thinks of. I always knew he was meant for something great.",
    "He visited me today. Said I needed rest. I didn't want him to see me like this, but he held my hand and said he wasn't going anywhere."
  ];
  
  const medicalStamps = [
    "MEDICAL OBSERVATION LOG\nDay 23 - Patient exhibits confabulation\nMemory construction: graduation event\nNo corroborating evidence found\nReality orientation: FAILED",
    "NEUROLOGICAL ASSESSMENT\nPatient uncertain about event chronology\nTemporal lobe activity: abnormal\nFalse memory formation detected\nFamily verification: NO RECORDS",
    "PSYCHIATRIC EVALUATION\nPatient distressed by memory gaps\nNo school records found for described child\nDelusion persistence: HIGH\nRecommendation: Continue observation"
  ];
  
  const getCurrentScene = () => {
    if (scrollZ > -5) return 0;
    if (scrollZ > -25) return 1;
    if (scrollZ > -50) return 2;
    return 3;
  };
  
  const currentScene = getCurrentScene();
  const sceneNames = ['Graduation', 'Soccer', 'School', 'Hospital'];
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      <Scene3D cameraPosition={[0, 1, 5]} cameraFov={75}>
        <color attach="background" args={[allBlueBooksFound ? '#2a2a3a' : '#d4c5e8']} />
        <fog attach="fog" args={[allBlueBooksFound ? '#2a2a3a' : '#d4c5e8', 8, 25]} />
        <ForwardScrollContent 
          scrollZ={scrollZ} 
          mousePos={mousePos}
          onReadClue={(index) => {
            setCurrentClue(clueTexts[index]);
            setCluesFound(prev => new Set(prev).add(index));
          }}
          clueTexts={clueTexts}
          showWhiteNotes={allBlueBooksFound}
        />
      </Scene3D>

      <div className="absolute top-4 left-4 text-white text-sm font-mono bg-black bg-opacity-70 p-3 rounded">
        <div>Memory {currentScene + 1}/4: {sceneNames[currentScene]}</div>
        <div className="mt-1">🖱️ Scroll to move forward</div>
        <div className="mt-1">📄 Clues found: {cluesFound.size}/8</div>
      </div>
      
      {/* Clue display overlay */}
      {currentClue && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
             onClick={() => setCurrentClue(null)}>
          <div className="bg-gray-100 p-8 rounded-lg max-w-2xl mx-4 font-mono text-sm"
               onClick={(e) => e.stopPropagation()}>
            <div className="whitespace-pre-line text-gray-900 leading-relaxed">
              {currentClue}
            </div>
            <button 
              onClick={() => setCurrentClue(null)}
              className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((MIN_Z - scrollZ) / (MIN_Z - MAX_Z)) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="Truth Revealed">
          <p className="text-center mb-4 text-green-400">
            You've uncovered all the memories... and the devastating truth behind them.
          </p>
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
