import { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function useMobileControls() {
  const [isMobile, setIsMobile] = useState(false);
  const { camera } = useThree();
  const moveDirection = useRef({ x: 0, z: 0 });
  const cameraRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMove = (direction: { x: number; z: number }) => {
    moveDirection.current = direction;
  };

  const handleLook = (delta: { x: number; y: number }) => {
    cameraRotation.current.y -= delta.x;
    cameraRotation.current.x -= delta.y;
    
    // Clamp vertical rotation
    cameraRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.current.x));
    
    camera.rotation.y = cameraRotation.current.y;
    camera.rotation.x = cameraRotation.current.x;
  };

  const handleInteract = () => {
    // Dispatch a click event at the center of the screen
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });
    document.dispatchEvent(event);
  };

  return {
    isMobile,
    moveDirection: moveDirection.current,
    handleMove,
    handleLook,
    handleInteract
  };
}
