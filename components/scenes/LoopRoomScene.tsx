'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import { useMobileControls } from '@/lib/MobileControlsContext';
import * as THREE from 'three';



interface GhostProps {
  onClick: () => void;
  clickCount: number;
  isVisible: boolean;
  positionRef: React.MutableRefObject<THREE.Vector3>;
  isNearLantern: boolean;
  correctHits: number;
}

function Ghost({ onClick, clickCount, isVisible, positionRef, isNearLantern, correctHits }: GhostProps) {
  const ghostRef = useRef<THREE.Group>(null);
  const screamGhostRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const disappearTimer = useRef<number>(0);
  const [isJumpScaring, setIsJumpScaring] = useState(false);
  const jumpScareTimer = useRef<number>(0);
  const lastJumpScareTime = useRef<number>(0);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeOutTimer = useRef<number>(0);
  
  // Load ghost models
  const { scene: ghostModel } = useGLTF('/KIRO_ASSETS/entities/loopghost.glb');
  const { scene: screamModel, animations: screamAnimations } = useGLTF('/KIRO_ASSETS/entities/ghostscream.glb');
  
  // Animation mixers
  const screamMixer = useRef<THREE.AnimationMixer | null>(null);
  const screamAction = useRef<THREE.AnimationAction | null>(null);
  
  // Set up material opacity control and animation
  useEffect(() => {
    ghostModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.transparent = true;
        }
      }
    });
    
    screamModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.transparent = true;
        }
      }
    });
    
    // Set up animation mixer for scream
    if (screamAnimations && screamAnimations.length > 0) {
      screamMixer.current = new THREE.AnimationMixer(screamModel);
      screamAction.current = screamMixer.current.clipAction(screamAnimations[0]);
      screamAction.current.setLoop(THREE.LoopOnce, 1);
      screamAction.current.clampWhenFinished = true;
    }
    
    return () => {
      if (screamMixer.current) {
        screamMixer.current.stopAllAction();
      }
    };
  }, [ghostModel, screamModel, screamAnimations]);

  // Trigger flash effect
  useEffect(() => {
    if (triggerFlash) {
      const timer = setTimeout(() => setTriggerFlash(false), 100);
      return () => clearTimeout(timer);
    }
  }, [triggerFlash]);

  const handleClick = () => {
    // Trigger disappear effect for visual feedback
    setIsDisappearing(true);
    disappearTimer.current = 0;
    
    // Trigger flash on correct hit
    if (isNearLantern) {
      setTriggerFlash(true);
    }
    
    onClick();
  };

  useFrame((state, delta) => {
    if (ghostRef.current && screamGhostRef.current && isVisible) {
      const time = state.clock.getElapsedTime();

      // Update animation mixer
      if (screamMixer.current && isJumpScaring) {
        screamMixer.current.update(delta);
      }

      // Repeating jump scare every 10 seconds
      if (!isJumpScaring && correctHits < 3 && time - lastJumpScareTime.current >= 10) {
        lastJumpScareTime.current = time;
        setIsJumpScaring(true);
        jumpScareTimer.current = 0;
        setTriggerFlash(true);
        
        // Play scream animation
        if (screamAction.current) {
          screamAction.current.reset();
          screamAction.current.play();
        }
      }

      // Jump scare with scream animation
      if (isJumpScaring) {
        jumpScareTimer.current += delta;
        
        // Hide normal ghost, show scream ghost
        ghostRef.current.visible = false;
        screamGhostRef.current.visible = true;
        
        // Position ghost in the direction the camera is facing
        const cameraDirection = new THREE.Vector3();
        state.camera.getWorldDirection(cameraDirection);
        
        // Place ghost 2.5 units in front of where camera is looking (closer!)
        const ghostPos = state.camera.position.clone();
        ghostPos.add(cameraDirection.multiplyScalar(2.5));
        
        // Lower the ghost position (reduce Y)
        ghostPos.y -= 0.5;
        
        screamGhostRef.current.position.copy(ghostPos);
        
        // Make ghost face the camera
        screamGhostRef.current.lookAt(state.camera.position);
        
        // Slightly bigger than original
        screamGhostRef.current.scale.set(1.5, 1.5, 1.5);
        
        if (lightRef.current && jumpScareTimer.current < 2) {
          lightRef.current.intensity = 100;
        } else if (jumpScareTimer.current < 4) {
          // Fade out (longer duration)
          const fadeProgress = (jumpScareTimer.current - 2) / 2;
          const opacity = 1 - fadeProgress;
          
          screamModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const material = mesh.material as THREE.MeshStandardMaterial;
                material.opacity = opacity;
              }
            }
          });
          
          if (lightRef.current) {
            lightRef.current.intensity = 400 * opacity;
          }
        } else if (jumpScareTimer.current >= 4) {
          // Reset
          setIsJumpScaring(false);
          ghostRef.current.visible = true;
          screamGhostRef.current.visible = false;
          
          screamModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const material = mesh.material as THREE.MeshStandardMaterial;
                material.opacity = 1;
              }
            }
          });
          
          if (lightRef.current) {
            lightRef.current.intensity = 50;
          }
        }
        return;
      }

      // Handle disappear/reappear animation with darkening
      if (isDisappearing) {
        disappearTimer.current += delta;
        
        let targetOpacity = 1;
        if (disappearTimer.current < 0.2) {
          // Quick fade out
          targetOpacity = 1 - (disappearTimer.current / 0.2);
        } else if (disappearTimer.current < 0.4) {
          // Stay invisible briefly
          targetOpacity = 0;
        } else if (disappearTimer.current < 0.6) {
          // Fade back in
          const fadeIn = (disappearTimer.current - 0.4) / 0.2;
          targetOpacity = fadeIn;
        } else {
          // Reset to normal
          setIsDisappearing(false);
          targetOpacity = 1;
        }
        
        // Apply opacity and darkening based on click count
        const darkenAmount = clickCount * 0.25; // Gets darker with each click
        ghostModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.opacity = targetOpacity;
              // Darken the emissive color
              material.emissive = new THREE.Color(0x00ffff).multiplyScalar(Math.max(0.1, 1 - darkenAmount));
            }
          }
        });
      } else {
        // Apply lighting based on lantern proximity
        const weakenAmount = correctHits * 0.33;
        
        if (isNearLantern) {
          // BRIGHT when in lantern range
          ghostModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const material = mesh.material as THREE.MeshStandardMaterial;
                // Bright warm glow when vulnerable
                material.emissive = new THREE.Color(0xffaa00).multiplyScalar(1.5 * (1 - weakenAmount));
                material.opacity = 1;
              }
            }
          });
          
          // Bright light when vulnerable
          if (lightRef.current) {
            lightRef.current.intensity = 80;
            lightRef.current.color.setHex(0xffaa00);
          }
        } else {
          // COMPLETELY DARK when outside lantern range
          ghostModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const material = mesh.material as THREE.MeshStandardMaterial;
                // Almost black - barely visible silhouette
                material.emissive = new THREE.Color(0x000000);
                material.opacity = 0.3; // Very faint
              }
            }
          });
          
          // Very dim light when invulnerable
          if (lightRef.current) {
            lightRef.current.intensity = 5;
            lightRef.current.color.setHex(0x001111);
          }
        }
      }

      if (correctHits >= 3) {
        // Fade out ghost on 3rd hit
        if (!isFadingOut) {
          setIsFadingOut(true);
          fadeOutTimer.current = 0;
        }
        
        fadeOutTimer.current += delta;
        const fadeProgress = Math.min(fadeOutTimer.current / 2, 1); // 2 second fade
        const opacity = 1 - fadeProgress;
        
        ghostModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.opacity = opacity;
              material.emissive = new THREE.Color(0xffaa00).multiplyScalar(opacity);
            }
          }
        });
        
        if (lightRef.current) {
          lightRef.current.intensity = 80 * opacity;
        }
        
        // Continue circular movement while fading
        const patrolRadius = 10;
        const patrolSpeed = 0.3;
        const patrolCenterX = 0;
        const patrolCenterZ = -5;
        
        const angle = time * patrolSpeed;
        const x = patrolCenterX + Math.cos(angle) * patrolRadius;
        const z = patrolCenterZ + Math.sin(angle) * patrolRadius;
        
        ghostRef.current.position.x = x;
        ghostRef.current.position.z = z;
        
        // Floating animation
        const floatSpeed = 0.8;
        const floatHeight = 0.4;
        const baseY = 2;
        const primaryFloat = Math.sin(time * floatSpeed) * floatHeight;
        const secondaryFloat = Math.sin(time * floatSpeed * 1.3 + 1) * (floatHeight * 0.3);
        ghostRef.current.position.y = baseY + primaryFloat + secondaryFloat;
      } else if (!isDisappearing && !isJumpScaring) {
        // Smooth circular patrol path
        const patrolRadius = 10; // Radius of circular path
        const patrolSpeed = 0.3; // Speed of rotation (radians per second)
        const patrolCenterX = 0;
        const patrolCenterZ = -5;
        
        // Calculate position on circle
        const angle = time * patrolSpeed;
        const x = patrolCenterX + Math.cos(angle) * patrolRadius;
        const z = patrolCenterZ + Math.sin(angle) * patrolRadius;
        
        // Update ghost position
        ghostRef.current.position.x = x;
        ghostRef.current.position.z = z;
        
        // Make ghost look in direction of movement (tangent to circle)
        const tangentX = -Math.sin(angle);
        const tangentZ = Math.cos(angle);
        const lookAtPos = new THREE.Vector3(
          x + tangentX,
          ghostRef.current.position.y,
          z + tangentZ
        );
        ghostRef.current.lookAt(lookAtPos);
        
        // Realistic floating animation - slow sine wave with offset phases
        const floatSpeed = 0.8;
        const floatHeight = 0.4;
        const baseY = 2;
        
        // Primary vertical float
        const primaryFloat = Math.sin(time * floatSpeed) * floatHeight;
        
        // Secondary float for more natural movement (different frequency)
        const secondaryFloat = Math.sin(time * floatSpeed * 1.3 + 1) * (floatHeight * 0.3);
        
        // Combine for smooth, organic floating
        ghostRef.current.position.y = baseY + primaryFloat + secondaryFloat;
        
        // Very subtle scale breathing effect (no tilt)
        const breathe = Math.sin(time * 0.6) * 0.05;
        ghostRef.current.scale.set(
          1.5 + breathe, 
          1.5 + breathe,
          1.5 + breathe
        );
      }

      // Update light position to follow ghost
      if (lightRef.current) {
        lightRef.current.position.copy(ghostRef.current.position);
      }
      
      // Update position ref for glitch effect
      positionRef.current.copy(ghostRef.current.position);
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Normal ghost - starts on circular path */}
      <group ref={ghostRef} position={[10, 2, -5]} onClick={handleClick}>
        <primitive object={ghostModel} scale={[1.5, 1.5, 1.5]} />
      </group>
      
      {/* Scream ghost (hidden until jump scare) */}
      <group ref={screamGhostRef} visible={false}>
        <primitive object={screamModel} />
        <pointLight position={[0, 0, 0]} intensity={300} distance={20} color="#1e3a8a" />
      </group>
      
      {/* Dynamic glow around ghost - changes based on lantern proximity */}
      <pointLight ref={lightRef} position={[10, 2, -5]} intensity={5} distance={15} color="#001111" decay={2} />
      
      {/* Flash overlay */}
      {triggerFlash && (
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="white" transparent opacity={0.8} />
        </mesh>
      )}
    </>
  );
}

function CameraController() {
  const { isMobile, gyroRotationRef } = useMobileControls();
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isMobile) return; // Skip mouse tracking on mobile

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useFrame(({ camera }) => {
    if (isMobile) {
      // Mobile: Use gyroscope for 360 degree rotation
      const gyroRot = gyroRotationRef.current;
      camera.rotation.y = gyroRot.y;
      camera.rotation.x = gyroRot.x;
    } else {
      // Desktop: Calculate target rotation based on mouse position - full 360 horizontal only
      targetRotation.current.y = -mousePos.current.x * Math.PI;
      // Reduce vertical tilt significantly for smoother feel
      targetRotation.current.x = mousePos.current.y * 0.1;

      // Much smoother interpolation
      camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.08;
      camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.08;
    }
    
    // Lock Z rotation to prevent any roll/tilt
    camera.rotation.z = 0;
  });

  return null;
}



interface LoopRoomContentProps {
  onSuccess: () => void;
  onGlitchChange: (intensity: number) => void;
  onFlickerChange: (intensity: number) => void;
  correctHits: number;
  wrongHits: number;
  onCorrectHit: () => void;
  onWrongHit: () => void;
}

function LoopRoomContent({ 
  onSuccess, 
  onGlitchChange, 
  onFlickerChange,
  correctHits,
  wrongHits,
  onCorrectHit,
  onWrongHit
}: LoopRoomContentProps) {
  const [isGhostVisible, setIsGhostVisible] = useState(true);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  const ghostPositionRef = useRef(new THREE.Vector3());
  const [isNearLantern, setIsNearLantern] = useState(false);
  
  // Lantern positions - strategically placed around patrol path
  const lanternPositions = [
    new THREE.Vector3(-10, 0, -10),  // Left back
    new THREE.Vector3(10, 0, -10),   // Right back
    new THREE.Vector3(0, 0, 8),      // Front center
  ];
  const lanternRadius = 4; // Safe zone radius
  
  // Load the textured GLB model
  const { scene } = useGLTF('/KIRO_ASSETS/Rooms/looproomtex.glb');
  
  // Track ghost distance and check lantern proximity
  useFrame(({ camera }) => {
    const distance = camera.position.distanceTo(ghostPositionRef.current);
    const maxDistance = 15;
    const minDistance = 2;
    
    if (distance < maxDistance) {
      // Exponential intensity increase as ghost gets closer
      const normalizedDistance = (distance - minDistance) / (maxDistance - minDistance);
      const intensity = Math.pow(1 - Math.max(0, Math.min(1, normalizedDistance)), 2);
      onGlitchChange(intensity);
    } else {
      onGlitchChange(0);
    }
    
    // Check if ghost is near any lantern
    let nearLantern = false;
    for (const lanternPos of lanternPositions) {
      const distToLantern = ghostPositionRef.current.distanceTo(lanternPos);
      if (distToLantern <= lanternRadius) {
        nearLantern = true;
        break;
      }
    }
    setIsNearLantern(nearLantern);
  });

  const handleGhostClick = () => {
    if (isNearLantern) {
      // Correct hit!
      onCorrectHit();
      
      if (correctHits + 1 >= 3) {
        // Wait 3 seconds for death animation to play out
        setTimeout(() => {
          setIsGhostVisible(false);
          markRoomFixed('loop');
          onSuccess();
        }, 3000);
      }
    } else {
      // Wrong hit!
      onWrongHit();
      
      // Trigger flicker effect
      onFlickerChange(1);
      setTimeout(() => onFlickerChange(0), 500);
    }
  };

  return (
    <>
      {/* Camera parallax controller */}
      <CameraController />

      {/* Ghost */}
      <Ghost 
        onClick={handleGhostClick} 
        clickCount={wrongHits} 
        isVisible={isGhostVisible} 
        positionRef={ghostPositionRef}
        isNearLantern={isNearLantern}
        correctHits={correctHits}
      />
      
      {/* Lanterns with safe zone visualization */}
      {lanternPositions.map((pos, i) => (
        <group key={`lantern-${i}`} position={[pos.x, pos.y, pos.z]}>
          {/* Lantern post */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
          </mesh>
          
          {/* Lantern top */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[0.4, 0.6, 0.4]} />
            <meshStandardMaterial 
              color="#4a3a2a" 
              roughness={0.6} 
              metalness={0.4} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
          
          {/* Flame */}
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ffaa00" 
              emissiveIntensity={2} 
            />
          </mesh>
          
          {/* Lantern light */}
          <pointLight position={[0, 2.2, 0]} intensity={3} distance={8} color="#ffaa66" />
          
          {/* Safe zone ring on ground */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[lanternRadius - 0.2, lanternRadius, 32]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          
          {/* Glow when ghost is near this lantern */}
          {isNearLantern && ghostPositionRef.current.distanceTo(pos) <= lanternRadius && (
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[lanternRadius, 32]} />
              <meshBasicMaterial color="#ffaa00" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}

      {/* Dim, atmospheric lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="#4a5568" />

      {/* GLB Room Model - scaled up to fit camera inside */}
      <primitive object={scene} scale={[20, 20, 20]} />

      {/* Larger enclosed space for graveyard */}
      {/* Floor - extended */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Ceiling - higher and larger */}
      <mesh position={[0, 15, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>

      {/* Back wall - taller and wider */}
      <mesh position={[0, 6, -30]} receiveShadow>
        <planeGeometry args={[60, 18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 6, 30]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[60, 18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-30, 6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[30, 6, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </>
  );
}

export default function LoopRoomScene() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [flickerIntensity, setFlickerIntensity] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const router = useRouter();
  
  const handleCorrectHit = () => {
    const newCorrect = correctHits + 1;
    setCorrectHits(newCorrect);
  };
  
  const handleWrongHit = () => {
    const newWrong = wrongHits + 1;
    setWrongHits(newWrong);
    
    if (newWrong >= 5) {
      // Failure!
      setShowFailure(true);
    }
  };

  // Ghost radio audio
  useEffect(() => {
    const audio = new Audio('/KIRO_ASSETS/Music/ghostradio.wav');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Audio play error:', err));
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      {/* Camera glitch overlay */}
      {glitchIntensity > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              rgba(255, 0, 0, ${glitchIntensity * 0.1}) 0px,
              transparent 2px,
              transparent 4px,
              rgba(0, 255, 255, ${glitchIntensity * 0.1}) 4px,
              transparent 6px
            )`,
            animation: `glitch ${0.1 / glitchIntensity}s infinite`,
            mixBlendMode: 'screen'
          }}
        />
      )}
      
      {/* Flicker effect overlay */}
      {flickerIntensity > 0 && (
        <div 
          className="absolute inset-0 bg-red-900 pointer-events-none z-20"
          style={{ opacity: flickerIntensity * 0.5 }}
        />
      )}
      
      {/* Health bars UI */}
      {!showSuccess && !showFailure && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 p-4 rounded z-30">
          {/* Correct hits (banish progress) */}
          <div className="mb-3">
            <div className="text-green-400 text-center mb-2 text-sm">Banish Progress</div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 border-2 ${i < correctHits ? 'bg-green-600 border-green-400' : 'bg-gray-700 border-gray-500'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Wrong hits (sanity/stability) */}
          <div>
            <div className="text-red-400 text-center mb-2 text-sm">Stability</div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 border-2 ${i < wrongHits ? 'bg-red-600 border-red-400' : 'bg-gray-700 border-gray-500'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Scene3D cameraPosition={[0, 0, 0]} cameraFov={75}>
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 15, 40]} />
        <LoopRoomContent 
          onSuccess={() => setShowSuccess(true)} 
          onGlitchChange={setGlitchIntensity}
          onFlickerChange={setFlickerIntensity}
          correctHits={correctHits}
          wrongHits={wrongHits}
          onCorrectHit={handleCorrectHit}
          onWrongHit={handleWrongHit}
        />
      </Scene3D>

      {/* Success overlay */}
      {showSuccess && (
        <Overlay title="Loop Broken!">
          <p className="text-center mb-4 text-green-400">
            The ghost has been banished. The lanterns held the light.
          </p>
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
      
      {/* Failure overlay */}
      {showFailure && (
        <Overlay title="You Failed">
          <p className="text-center mb-4 text-red-400">
            The loop consumes you. Darkness prevails.
          </p>
          <div className="flex justify-center mt-4">
            <Button label="Return to Hallway" onClick={handleReturnToHallway} />
          </div>
        </Overlay>
      )}
    </div>
  );
}
