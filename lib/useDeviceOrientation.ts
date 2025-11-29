import { useEffect, useState, useRef } from 'react';

export interface OrientationData {
  alpha: number; // rotation around z-axis (0-360)
  beta: number;  // rotation around x-axis (-180 to 180)
  gamma: number; // rotation around y-axis (-90 to 90)
}

export function useDeviceOrientation() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isActive, setIsActive] = useState(false);
  const orientation = useRef<OrientationData>({ alpha: 0, beta: 0, gamma: 0 });
  const initialOrientation = useRef<OrientationData | null>(null);

  useEffect(() => {
    // Check if device orientation is supported
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      return false;
    }

    // iOS 13+ requires permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        setPermission(response);
        if (response === 'granted') {
          setIsActive(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        setPermission('denied');
        return false;
      }
    } else {
      // Non-iOS or older iOS - no permission needed
      setPermission('granted');
      setIsActive(true);
      return true;
    }
  };

  useEffect(() => {
    if (!isActive || !isSupported) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        // Store initial orientation on first read
        if (!initialOrientation.current) {
          initialOrientation.current = {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma
          };
        }

        orientation.current = {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isActive, isSupported]);

  const resetOrientation = () => {
    initialOrientation.current = null;
  };

  const getRelativeOrientation = (): OrientationData => {
    if (!initialOrientation.current) {
      return orientation.current;
    }

    return {
      alpha: orientation.current.alpha - initialOrientation.current.alpha,
      beta: orientation.current.beta - initialOrientation.current.beta,
      gamma: orientation.current.gamma - initialOrientation.current.gamma
    };
  };

  return {
    isSupported,
    permission,
    isActive,
    orientation: orientation.current,
    relativeOrientation: getRelativeOrientation(),
    requestPermission,
    resetOrientation,
    setIsActive
  };
}
