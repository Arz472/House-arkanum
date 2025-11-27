'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import Scene3D from '@/components/Scene3D';
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import { useGameState } from '@/store/gameState';
import * as THREE from 'three';



interface GhostProps {
  onClick: () => void;
  clickCount: number;
  isVisible: boolean;
  positionRef: React.MutableRefObject<THREE.Vector3>;
}

function Ghost({ onClick, clickCount, isVisible, positionRef }: GhostProps) {
  const ghostRef = useRef<THREE.Group>(null);
  const screamGhostRef = useRef<THREE.Group>(null);
  const deadGhostRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [glitchPhase, setGlitchPhase] = useState(0);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const disappearTimer = useRef<number>(0);
  const [isJumpScaring, setIsJumpScaring] = useState(false);
  const jumpScareTimer = useRef<number>(0);
  const jumpScareTriggered = useRef(false);
  const lookAwayTimer = useRef<number>(0);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const targetPosition = useRef(new THREE.Vector3(6, 2, 0));
  const nextTargetTime = useRef(0);
  
  // Load all ghost models
  const { scene: ghostModel } = useGLTF('/KIRO_ASSETS/entities/loopghost.glb');
  const { scene: screamModel, animations: screamAnimations } = useGLTF('/KIRO_ASSETS/entities/ghostscream.glb');
  const { scene: deadModel, animations: deadAnimations } = useGLTF('/KIRO_ASSETS/entities/ghostdead.glb');
  
  // Animation mixers
  const screamMixer = useRef<THREE.AnimationMixer | null>(null);
  const screamAction = useRef<THREE.AnimationAction | null>(null);
  const deadMixer = useRef<THREE.AnimationMixer | null>(null);
  const deadAction = useRef<THREE.AnimationAction | null>(null);
  
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
    
    deadModel.traverse((child) => {
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
    
    // Set up animation mixer for death
    if (deadAnimations && deadAnimations.length > 0) {
      deadMixer.current = new THREE.AnimationMixer(deadModel);
      deadAction.current = deadMixer.current.clipAction(deadAnimations[0]);
      deadAction.current.setLoop(THREE.LoopOnce, 1);
      deadAction.current.clampWhenFinished = true;
    }
    
    return () => {
      if (screamMixer.current) {
        screamMixer.current.stopAllAction();
      }
      if (deadMixer.current) {
        deadMixer.current.stopAllAction();
      }
    };
  }, [ghostModel, screamModel, deadModel, screamAnimations, deadAnimations]);

  // Trigger flash effect
  useEffect(() => {
    if (triggerFlash) {
      const timer = setTimeout(() => setTriggerFlash(false), 100);
      return () => clearTimeout(timer);
    }
  }, [triggerFlash]);

  const handleClick = () => {
    // Teleport ghost to random location
    const waypoints = [
      new THREE.Vector3(-10, 2, -12),
      new THREE.Vector3(10, 2, -12),
      new THREE.Vector3(12, 3, -5),
      new THREE.Vector3(12, 2, 5),
      new THREE.Vector3(-12, 2, 5),
      new THREE.Vector3(-12, 3, -5),
      new THREE.Vector3(0, 3, -15),
      new THREE.Vector3(8, 2, -10),
      new THREE.Vector3(-8, 2, -10),
    ];
    
    const randomWaypoint = waypoints[Math.floor(Math.random() * waypoints.length)];
    if (ghostRef.current) {
      ghostRef.current.position.copy(randomWaypoint);
    }
    
    // Trigger disappear effect for visual feedback
    setIsDisappearing(true);
    disappearTimer.current = 0;
    onClick();
  };

  useFrame((state, delta) => {
    if (ghostRef.current && screamGhostRef.current && isVisible) {
      const time = state.clock.getElapsedTime();

      // Update animation mixers
      if (screamMixer.current && isJumpScaring) {
        screamMixer.current.update(delta);
      }
      if (deadMixer.current && clickCount >= 3) {
        deadMixer.current.update(delta);
      }

      // Simple timer-based jump scare after 10 seconds
      if (!jumpScareTriggered.current && !isJumpScaring && clickCount < 3 && time > 10) {
        jumpScareTriggered.current = true;
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
        // Apply darkening when not disappearing
        const darkenAmount = clickCount * 0.25;
        ghostModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.emissive = new THREE.Color(0x00ffff).multiplyScalar(Math.max(0.1, 1 - darkenAmount));
            }
          }
        });
      }

      if (clickCount >= 3 && deadGhostRef.current) {
        // Show death animation
        ghostRef.current.visible = false;
        deadGhostRef.current.visible = true;
        
        // Play death animation once
        if (deadAction.current && glitchPhase === 0) {
          deadAction.current.reset();
          deadAction.current.play();
          setGlitchPhase(0.1); // Mark as started
        }
        
        // Position death ghost at same location as normal ghost
        deadGhostRef.current.position.copy(ghostRef.current.position);
        deadGhostRef.current.scale.set(1.5, 1.5, 1.5);
        deadGhostRef.current.lookAt(state.camera.position);
      } else if (!isDisappearing && !isJumpScaring) {
        // Designed path that keeps ghost at distance
        const currentPos = ghostRef.current.position;
        const playerPos = state.camera.position;
        
        // Pick new waypoint every 3-5 seconds
        if (time > nextTargetTime.current) {
          // Define waypoints around the graveyard perimeter (further from player)
          const waypoints = [
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
          
          // Pick a random waypoint that's far from player
          let attempts = 0;
          do {
            const randomWaypoint = waypoints[Math.floor(Math.random() * waypoints.length)];
            targetPosition.current.copy(randomWaypoint);
            attempts++;
          } while (targetPosition.current.distanceTo(playerPos) < 8 && attempts < 5);
          
          nextTargetTime.current = time + 3 + Math.random() * 2;
        }
        
        // Move toward target position
        const direction = new THREE.Vector3()
          .subVectors(targetPosition.current, currentPos)
          .normalize();
        
        const distanceToTarget = currentPos.distanceTo(targetPosition.current);
        const moveSpeed = 2.5;
        
        if (distanceToTarget > 0.5) {
          currentPos.add(direction.multiplyScalar(moveSpeed * delta));
          
          // Make ghost look in direction of movement (more 3D feel)
          const lookAtPos = currentPos.clone().add(direction);
          ghostRef.current.lookAt(lookAtPos);
        } else {
          // When at waypoint, occasionally glance at player
          if (Math.random() < 0.3) {
            ghostRef.current.lookAt(state.camera.position);
          }
        }
        
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
      {/* Normal ghost */}
      <group ref={ghostRef} position={[6, 2, 0]} onClick={handleClick}>
        <primitive object={ghostModel} scale={[1.5, 1.5, 1.5]} />
      </group>
      
      {/* Scream ghost (hidden until jump scare) */}
      <group ref={screamGhostRef} visible={false}>
        <primitive object={screamModel} />
        <pointLight position={[0, 0, 0]} intensity={300} distance={20} color="#1e3a8a" />
      </group>
      
      {/* Death ghost (hidden until defeated) */}
      <group ref={deadGhostRef} visible={false}>
        <primitive object={deadModel} />
      </group>
      
      {/* Eerie glow around ghost */}
      <pointLight ref={lightRef} position={[6, 2, 0]} intensity={50} distance={15} color="#00ffff" decay={2} />
      
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
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(({ camera }) => {
    // Calculate target rotation based on mouse position - full 360 horizontal only
    targetRotation.current.y = -mousePos.current.x * Math.PI;
    // Reduce vertical tilt significantly for smoother feel
    targetRotation.current.x = mousePos.current.y * 0.1;

    // Much smoother interpolation
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.08;
    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.08;
    
    // Lock Z rotation to prevent any roll/tilt
    camera.rotation.z = 0;
  });

  return null;
}



interface LoopRoomContentProps {
  onSuccess: () => void;
  onGlitchChange: (intensity: number) => void;
}

function LoopRoomContent({ onSuccess, onGlitchChange }: LoopRoomContentProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isGhostVisible, setIsGhostVisible] = useState(true);
  const markRoomFixed = useGameState((state) => state.markRoomFixed);
  const ghostPositionRef = useRef(new THREE.Vector3());
  
  // Load the textured GLB model
  const { scene } = useGLTF('/KIRO_ASSETS/Rooms/looproomtex.glb');
  
  // Track ghost distance and update glitch effect (intensifies as ghost gets closer)
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
  });

  const handleGhostClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      // Wait 3 seconds for death animation to play out
      setTimeout(() => {
        setIsGhostVisible(false);
        markRoomFixed('loop');
        onSuccess();
      }, 3000);
    }
  };

  return (
    <>
      {/* Camera parallax controller */}
      <CameraController />

      {/* Ghost */}
      <Ghost onClick={handleGhostClick} clickCount={clickCount} isVisible={isGhostVisible} positionRef={ghostPositionRef} />

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
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const router = useRouter();

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
      
      <Scene3D cameraPosition={[0, 0, 0]} cameraFov={75}>
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 15, 40]} />
        <LoopRoomContent onSuccess={() => setShowSuccess(true)} onGlitchChange={setGlitchIntensity} />
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
