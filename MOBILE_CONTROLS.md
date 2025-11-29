# Mobile Controls Implementation

This document describes the mobile-friendly controls added to the Haunted Codebase game.

## Features

### 1. **Touch Controls** (All Mobile Devices)
- **Virtual Joystick** (Left side of screen)
  - Touch and drag on the left half of the screen to move
  - Joystick appears where you touch
  - Movement is proportional to how far you drag from center

- **Swipe to Look** (Right side of screen)
  - Touch and drag on the right half of the screen to look around
  - Works like mouse movement on desktop
  - Only active when gyroscope is disabled

- **Interact Button** (Bottom right)
  - Red button with ⚡ icon
  - Tap to interact with objects in the center of your view

### 2. **Gyroscope Controls** (Mobile Devices with Gyroscope)
- **Physical Phone Movement**
  - Move your phone in real life to look around in the game
  - Tilt left/right to pan the camera
  - Tilt up/down to look up/down
  - Creates an immersive AR-like experience

- **Toggle Button** (Top right)
  - 📱 icon button to enable/disable gyroscope
  - Green when active, gray when inactive
  - iOS requires permission on first use
  - Automatically disabled on desktop

### 3. **Performance Optimizations**
- Lower DPI rendering on mobile (1x vs 1.5x)
- Wider FOV on mobile for better visibility
- Disabled antialiasing on mobile for better performance
- Low-power GPU preference on mobile
- Touch-action: none to prevent browser gestures
- Disabled text selection and pull-to-refresh

## Usage

### For Players

1. **Desktop**: Use mouse to look around, click to interact
2. **Mobile (Touch)**: 
   - Left side: virtual joystick to move
   - Right side: swipe to look
   - Bottom right: tap ⚡ to interact
3. **Mobile (Gyro)**:
   - Tap 📱 button (top right) to enable
   - Move your phone to look around
   - Left side: virtual joystick to move
   - Bottom right: tap ⚡ to interact

### For Developers

#### Adding Mobile Controls to a Scene

```tsx
import { useCameraControls } from '@/lib/useCameraControls';
import { useState } from 'react';

function MyScene() {
  const [isMobile, setIsMobile] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  
  const {
    updateCameraRotation,
    handleTouchLook,
    handleGyroLook
  } = useCameraControls({
    isMobile,
    isGyroEnabled: gyroEnabled,
    mouseSensitivity: 0.1,
    gyroSensitivity: 0.02
  });

  useFrame((state, delta) => {
    updateCameraRotation(delta);
  });

  return (
    <>
      {/* Your scene content */}
      <TouchControls
        onLook={handleTouchLook}
        onGyroLook={handleGyroLook}
      />
    </>
  );
}
```

#### Device Detection

The mobile detection checks for:
- User agent strings (Android, iOS, etc.)
- Screen width < 768px
- Automatically updates on window resize

#### Gyroscope Support

- Automatically detects if device supports gyroscope
- Handles iOS 13+ permission requests
- Falls back to touch controls if denied or unsupported
- Only activates on mobile devices

## Files

- `components/ui/TouchControls.tsx` - Main touch controls UI component
- `components/ui/MobileWarning.tsx` - Mobile welcome screen with instructions
- `lib/useDeviceOrientation.ts` - Gyroscope/device orientation hook
- `lib/useCameraControls.ts` - Unified camera control hook
- `lib/useMobileControls.ts` - Mobile detection and input handling
- `lib/useInputControls.ts` - Input state management
- `app/globals.css` - Mobile-specific CSS optimizations
- `components/Scene3D.tsx` - Mobile performance optimizations

## Browser Compatibility

### Touch Controls
- ✅ All modern mobile browsers
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Android Firefox

### Gyroscope Controls
- ✅ iOS Safari (requires permission)
- ✅ Android Chrome
- ✅ Android Firefox
- ⚠️ Some browsers may require HTTPS
- ❌ Desktop browsers (intentionally disabled)

## Testing

### On Desktop
- Controls should work with mouse only
- No mobile UI elements should appear
- Gyroscope should not activate

### On Mobile (without gyro)
- Virtual joystick appears on left touch
- Right side swipe controls camera
- Interact button visible
- Gyro button hidden or disabled

### On Mobile (with gyro)
- Gyro button visible (top right)
- Tap to enable gyroscope
- Phone movement controls camera
- Touch swipe disabled when gyro active
- Virtual joystick still works for movement

## Future Enhancements

- [ ] Haptic feedback on interactions
- [ ] Customizable sensitivity settings
- [ ] Button remapping
- [ ] Landscape mode optimization
- [ ] Pinch to zoom
- [ ] Two-finger pan gesture
