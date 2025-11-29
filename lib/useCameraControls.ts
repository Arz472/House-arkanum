import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControlsOptions {
  isMobile: boolean;
  isGyroEnabled?: boolean;
  mouseSensitivity?: number;
  gyroSensitivity?: number;
}

export function useCameraControls({
  isMobile,
  isGyroEnabled = false,
  mouseSensitivity = 0.1,
  gyroSensitivity = 0.02
}: CameraControlsOptions) {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const gyroRotation = useRef({ x: 0, y: 0 });

  // Desktop mouse tracking
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  const updateCameraRotation = (delta: number) => {
    if (isMobile && isGyroEnabled) {
      // Use gyroscope rotation (already set by handleGyroLook)
      camera.rotation.y = gyroRotation.current.y;
      camera.rotation.x = gyroRotation.current.x;
    } else if (!isMobile) {
      // Desktop: smooth parallax based on mouse position
      targetRotation.current.y = -mousePos.current.x * mouseSensitivity;
      targetRotation.current.x = mousePos.current.y * (mouseSensitivity * 0.5);

      camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.05;
      camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.05;
    }
    // If mobile without gyro, touch controls handle rotation via handleTouchLook
  };

  const handleTouchLook = (delta: { x: number; y: number }) => {
    if (isMobile && !isGyroEnabled) {
      targetRotation.current.y -= delta.x;
      targetRotation.current.x -= delta.y;
      
      // Clamp vertical rotation
      targetRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.current.x));
      
      camera.rotation.y = targetRotation.current.y;
      camera.rotation.x = targetRotation.current.x;
    }
  };

  const handleGyroLook = (orientation: { alpha: number; beta: number; gamma: number }) => {
    if (isMobile && isGyroEnabled) {
      // Convert device orientation to camera rotation
      // Beta: front-to-back tilt (-180 to 180) -> camera X rotation
      // Gamma: left-to-right tilt (-90 to 90) -> camera Y rotation
      // Alpha: compass direction (0-360) -> can be used for Y rotation
      
      // Convert degrees to radians
      const betaRad = (orientation.beta * Math.PI) / 180;
      const gammaRad = (orientation.gamma * Math.PI) / 180;
      const alphaRad = (orientation.alpha * Math.PI) / 180;
      
      // Map device orientation to camera rotation
      // Adjust these based on how you want the controls to feel
      gyroRotation.current.y = -gammaRad * gyroSensitivity * 50; // Left-right tilt
      gyroRotation.current.x = (betaRad - Math.PI / 2) * gyroSensitivity * 30; // Up-down tilt
      
      // Clamp vertical rotation
      gyroRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, gyroRotation.current.x));
    }
  };

  return {
    updateCameraRotation,
    handleTouchLook,
    handleGyroLook,
    mousePos: mousePos.current,
    targetRotation: targetRotation.current
  };
}
