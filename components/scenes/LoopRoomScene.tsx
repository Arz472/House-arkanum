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
}

function Ghost({ onClick, clickCount, isVisible }: GhostProps) {
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
    // Trigger disappear effect
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

      // Handle disappear/reappear animation
      if (isDisappearing) {
        disappearTimer.current += delta;
        
        let targetOpacity = 1;
        if (disappearTimer.current < 0.3) {
          // Fade out quickly
          targetOpacity = 1 - (disappearTimer.current / 0.3);
          ghostRef.current.scale.set(1.5, 1.5, 1.5);
        } else if (disappearTimer.current < 0.8) {
          // Stay invisible
          targetOpacity = 0;
        } else if (disappearTimer.current < 1.1) {
          // Fade back in at new position
          const fadeIn = (disappearTimer.current - 0.8) / 0.3;
          targetOpacity = fadeIn;
          ghostRef.current.scale.set(1.5 * fadeIn, 1.5 * fadeIn, 1.5 * fadeIn);
        } else {
          // Reset to normal
          setIsDisappearing(false);
          targetOpacity = 1;
        }
        
        // Apply opacity to all materials in the model
        ghostModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.opacity = targetOpacity;
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
        // Creative spiral path around the room
        const radius = 6;
        const speed = 0.5;
        const verticalSpeed = 1.5;
        
        // Circular motion around the room
        ghostRef.current.position.x = Math.cos(time * speed) * radius;
        ghostRef.current.position.z = Math.sin(time * speed) * radius;
        
        // Figure-8 vertical motion
        ghostRef.current.position.y = 2 + Math.sin(time * verticalSpeed) * 2;
        
        // Slight wobble for organic feel
        const wobble = Math.sin(time * 3) * 0.3;
        ghostRef.current.scale.set(1.5 + wobble, 1.5 + wobble, 1.5 + wobble);
      }

      // Make ghost face the camera (player)
      ghostRef.current.lookAt(state.camera.position);

      // Update light position to follow ghost
      if (lightRef.current) {
        lightRef.current.position.copy(ghostRef.current.position);
      }
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
    // Calculate target rotation based on mouse position - full 360 horizontal
    targetRotation.current.y = -mousePos.current.x * Math.PI;
    targetRotation.current.x = mousePos.current.y * (Math.PI / 4);

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
  
  // Load the textured GLB model
  const { scene } = useGLTF('/KIRO_ASSETS/Rooms/looproomtex.glb');

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
      <Ghost onClick={handleGhostClick} clickCount={clickCount} isVisible={isGhostVisible} />

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
  const router = useRouter();

  const handleReturnToHallway = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen relative">
      <Scene3D cameraPosition={[0, 0, 0]} cameraFov={75}>
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 15, 40]} />
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
