# Design Document

## Overview

The Haunted Codebase of House Arkanum is a browser-based 3D interactive experience built with Next.js, React Three Fiber, and TypeScript. The application presents a retro PS1-style low-poly haunted house where each room represents a software bug that players must fix through interactive puzzles. The design prioritizes performance optimization for mid-range hardware while maintaining atmospheric visuals and smooth interactions.

The application follows a hub-and-spoke navigation pattern with a central Hallway Hub connecting to five bug rooms and a final Commit Altar scene. Global state management tracks player progress, and all 3D scenes are optimized for 60 FPS performance on integrated graphics.

## Architecture

### High-Level Structure

```
Next.js App Router
├── Route Handlers (/, /room/*, /altar)
├── Scene Components (lazy-loaded)
│   ├── HallwayScene
│   ├── Bug Room Scenes (5)
│   └── CommitAltarScene
├── UI Components (Tailwind overlays)
│   ├── Overlay
│   ├── Button
│   └── HUD components
└── State Management (Zustand)
    └── Game State Store
```

### Technology Stack

- **Framework**: Next.js 14+ with App Router, React 18+, TypeScript 5+
- **3D Rendering**: React Three Fiber (@react-three/fiber) with Three.js
- **3D Utilities**: @react-three/drei for GLTF loading, text, and common helpers
- **Styling**: Tailwind CSS for all 2D UI elements
- **State Management**: Zustand for lightweight global state
- **Asset Format**: GLB/GLTF with Draco compression

### Routing Architecture

Each route maps to a dedicated scene component that is dynamically imported with SSR disabled:

- `/` → HallwayScene (hub)
- `/room/loop` → LoopRoom
- `/room/null-candles` → NullCandlesRoom
- `/room/404` → Door404Room
- `/room/leak` → MemoryLeakRoom
- `/room/mirror` → MirrorRoom
- `/altar` → CommitAltarScene

Dynamic imports ensure that only the current scene's assets are loaded, reducing initial bundle size and memory usage.

## Components and Interfaces

### Core Scene Component Pattern

Each scene follows a consistent structure:

```typescript
interface SceneProps {
  onComplete?: () => void;
}

// Scene component structure
const SceneComponent: React.FC<SceneProps> = ({ onComplete }) => {
  return (
    <>
      <Canvas dpr={[1, 1.5]} camera={{ position: [x, y, z], fov: 60 }}>
        <SceneContent onComplete={onComplete} />
      </Canvas>
      <UIOverlay />
    </>
  );
};
```

### Game State Store (Zustand)

```typescript
interface GameState {
  fixedRooms: {
    loop: boolean;
    nullCandles: boolean;
    door404: boolean;
    leak: boolean;
    mirror: boolean;
  };
  markRoomFixed: (room: keyof GameState['fixedRooms']) => void;
  resetProgress: () => void;
  allRoomsFixed: () => boolean;
}
```

### UI Component Interfaces

```typescript
interface OverlayProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface HUDProps {
  label: string;
  current: number;
  total: number;
}
```

### 3D Interaction Patterns

**Clickable Objects:**
```typescript
interface ClickableProps {
  onClick: () => void;
  hoverScale?: number;
}
```

**Draggable Objects:**
```typescript
interface DraggableProps {
  position: [number, number, number];
  onDrag: (position: [number, number, number]) => void;
  constraints?: {
    axis?: 'x' | 'y' | 'z';
    min?: number;
    max?: number;
  };
}
```

## Data Models

### Room Completion State

```typescript
type RoomId = 'loop' | 'nullCandles' | 'door404' | 'leak' | 'mirror';

interface RoomState {
  id: RoomId;
  isFixed: boolean;
  displayName: string;
  route: string;
}
```

### Interactive Object State

```typescript
interface InteractiveObject {
  id: string;
  position: Vector3;
  isActive: boolean;
  interactionCount?: number;
}

// Candle state for Null Candles room
interface Candle {
  id: string;
  position: Vector3;
  isLit: boolean;
}

// Rune state for 404 room
interface Rune {
  id: string;
  symbol: string;
  position: number; // position along track
  targetPosition: number;
}

// GC Orb state for Memory Leak room
interface GCOrb {
  id: string;
  position: Vector3;
  spawnTime: number;
}
```

### Monster State (Memory Leak Room)

```typescript
interface MonsterState {
  scale: number;
  growthRate: number;
  targetScale: number;
  maxScale: number;
  minScale: number;
}
```

### Mirror Sync State

```typescript
interface MirrorState {
  realPosition: Vector2;
  reflectionPosition: Vector2;
  syncThreshold: number;
  syncDuration: number;
  syncTimer: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Scene triangle budget compliance
*For any* rendered scene, the total triangle count across all meshes should be less than or equal to 60,000 triangles.
**Validates: Requirements 2.2**

### Property 2: Scene lighting limit compliance
*For any* rendered scene, the total number of light objects should be less than or equal to 2.
**Validates: Requirements 2.4**

### Property 3: Scene asset size compliance
*For any* scene's loaded assets, the total compressed file size should be less than or equal to 10 MB.
**Validates: Requirements 2.5**

### Property 4: Texture resolution compliance
*For any* loaded texture, both width and height dimensions should be less than or equal to 1024 pixels.
**Validates: Requirements 3.2**

### Property 5: Door navigation consistency
*For any* door in the Hallway Hub, clicking that door should navigate to its corresponding room route.
**Validates: Requirements 4.4, 5.6**

### Property 6: Room completion return navigation
*For any* completed room puzzle, a return button should be present that navigates back to the Hallway Hub route.
**Validates: Requirements 4.5**

### Property 7: Door hover feedback
*For any* door in the Hallway Hub, hovering over that door should trigger a visual change in scale or material properties.
**Validates: Requirements 5.5**

### Property 8: Camera parallax responsiveness
*For any* mouse position change in the Hallway Hub, the camera rotation should update proportionally to the mouse movement.
**Validates: Requirements 5.7**

### Property 9: Fixed room visual indicators
*For any* room marked as fixed in game state, the corresponding door in the Hallway Hub should display a visual marker.
**Validates: Requirements 5.10, 14.4**

### Property 10: Ghost click counter increment
*For any* click on the ghost entity in the Loop Room, the internal counter should increase by exactly 1.
**Validates: Requirements 6.3**

### Property 11: Flame drag updates position
*For any* drag event on the flame orb in the Null Candles Room, the flame's position should update to follow the drag coordinates.
**Validates: Requirements 7.4**

### Property 12: Candle lighting by proximity
*For any* unlit candle in the Null Candles Room, when the flame orb position is within the threshold distance of that candle, the candle should change to lit state.
**Validates: Requirements 7.5**

### Property 13: Candle count HUD accuracy
*For any* candle state in the Null Candles Room, the HUD should display a count that exactly matches the number of lit candles.
**Validates: Requirements 7.7**

### Property 14: Rune horizontal drag constraint
*For any* rune in the 404 Room, dragging that rune should update only its x-position within the defined track constraints.
**Validates: Requirements 8.4**

### Property 15: Monster growth over time
*For any* time interval in the Memory Leak Room, the monster's scale should increase monotonically (never decrease without player interaction).
**Validates: Requirements 9.2**

### Property 16: GC orb count limit
*For any* point in time in the Memory Leak Room, the number of active GC orbs should be less than or equal to 5.
**Validates: Requirements 9.3**

### Property 17: Orb collection reduces monster
*For any* GC orb click in the Memory Leak Room, the orb count should decrease by 1 and the monster's scale should decrease.
**Validates: Requirements 9.4**

### Property 18: Memory HUD proportional to monster
*For any* monster scale value in the Memory Leak Room, the HUD memory bar value should be proportional to the monster's current scale.
**Validates: Requirements 9.6**

### Property 19: Real orb follows mouse
*For any* mouse position change in the Mirror Room, the real orb position should update to correspond to the mouse coordinates.
**Validates: Requirements 10.4**

### Property 20: Mirror sync threshold and duration
*For any* state in the Mirror Room where the distance between real orb and reflection orb is less than the threshold for 3 seconds or more, the success state should become true.
**Validates: Requirements 10.5**

### Property 21: Altar checkmarks match game state
*For any* room marked as fixed in game state, the Commit Altar should display a corresponding checkmark.
**Validates: Requirements 11.3**

### Property 22: Audio file size compliance
*For any* loaded audio file, the file size should be below a reasonable threshold (e.g., 500 KB for ambient loops, 100 KB for SFX).
**Validates: Requirements 12.3**

### Property 23: Room completion updates game state
*For any* room puzzle completion event, the game state should update to mark that specific room as fixed (isFixed = true).
**Validates: Requirements 6.6, 7.8, 8.8, 9.7, 10.7, 14.2**

### Property 24: Game state persistence across navigation
*For any* navigation event between routes, all game state values should remain unchanged after the navigation completes.
**Validates: Requirements 14.3**

### Property 25: Commit requires all rooms fixed
*For any* attempt to commit at the Altar, the commit action should only be allowed when all five rooms in game state are marked as fixed.
**Validates: Requirements 14.5**

## Error Handling

### 3D Asset Loading Errors

**Strategy**: Graceful degradation with fallback geometry

- When a GLB model fails to load, render a placeholder primitive (box or sphere) with a distinct color
- Log the error to console for debugging
- Display a subtle notification to the user if in development mode
- Continue scene rendering without blocking

**Implementation**:
```typescript
const ModelWithFallback = ({ url, fallback }) => {
  const { scene, error } = useGLTF(url);
  
  if (error) {
    console.error(`Failed to load model: ${url}`, error);
    return fallback;
  }
  
  return <primitive object={scene} />;
};
```

### Navigation Errors

**Strategy**: Defensive routing with fallback

- Validate room IDs before navigation
- Redirect to Hallway Hub if invalid route is accessed
- Maintain game state integrity even with navigation errors

### State Management Errors

**Strategy**: State validation and recovery

- Validate game state structure on load
- Provide default state if corrupted or missing
- Use Zustand's persist middleware with error handling
- Never allow partial state updates that could corrupt game progress

### Performance Degradation

**Strategy**: Adaptive quality settings

- Monitor frame rate using `useFrame` with throttled checks
- If FPS drops below threshold (e.g., 30 FPS) for sustained period:
  - Reduce particle effects
  - Simplify fog settings
  - Reduce shadow quality or disable shadows
- Provide manual quality toggle in settings if needed

### User Input Errors

**Strategy**: Input validation and constraints

- Validate all drag operations stay within bounds
- Prevent rapid-fire clicks that could break state
- Debounce or throttle expensive interactions
- Validate click targets before processing interactions

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and integration points:

**Component Rendering Tests**:
- Test that each scene component renders without crashing
- Test that UI overlays display correct text and buttons
- Test that game state store initializes with correct default values

**Navigation Tests**:
- Test that clicking each door navigates to the correct route
- Test that return buttons navigate back to Hallway Hub
- Test that invalid routes redirect appropriately

**State Management Tests**:
- Test that marking a room as fixed updates the correct state property
- Test that resetting progress clears all room states
- Test that `allRoomsFixed()` returns true only when all 5 rooms are fixed

**Interaction Logic Tests**:
- Test ghost counter increments correctly on clicks
- Test candle lighting logic with specific distance values
- Test rune ordering validation with known correct/incorrect sequences
- Test monster scale calculations with specific orb collection counts
- Test mirror sync timer with specific distance and duration values

**Edge Cases**:
- Test behavior when all candles start lit
- Test behavior when monster scale reaches maximum
- Test behavior when attempting to commit with incomplete rooms
- Test behavior with rapid repeated clicks on interactive objects

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library).

**Configuration**:
- Each property test should run a minimum of 100 iterations
- Use appropriate generators for 3D vectors, positions, scales, and game states
- Tag each test with the format: `**Feature: haunted-codebase, Property {number}: {property_text}**`

**Test Categories**:

**Performance Properties** (Properties 1-4):
- Generate random scene configurations and verify triangle counts, light counts, asset sizes, and texture dimensions stay within limits
- Use generators that create realistic scene compositions

**Navigation Properties** (Properties 5-6):
- Generate random door selections and verify navigation behavior
- Generate random room completion states and verify return button presence

**Interaction Properties** (Properties 7-22):
- Generate random mouse positions and verify camera/orb responses
- Generate random candle configurations and verify lighting logic
- Generate random rune positions and verify drag constraints
- Generate random monster states and verify growth/shrinkage behavior
- Generate random mirror sync scenarios and verify success conditions

**State Management Properties** (Properties 23-25):
- Generate random room completion sequences and verify state updates
- Generate random navigation sequences and verify state persistence
- Generate random game states and verify commit validation

**Generator Examples**:
```typescript
// Vector3 generator for positions
const vector3Gen = fc.record({
  x: fc.float({ min: -10, max: 10 }),
  y: fc.float({ min: 0, max: 5 }),
  z: fc.float({ min: -10, max: 10 })
});

// Game state generator
const gameStateGen = fc.record({
  loop: fc.boolean(),
  nullCandles: fc.boolean(),
  door404: fc.boolean(),
  leak: fc.boolean(),
  mirror: fc.boolean()
});

// Candle array generator
const candlesGen = fc.array(
  fc.record({
    id: fc.string(),
    position: vector3Gen,
    isLit: fc.boolean()
  }),
  { minLength: 3, maxLength: 10 }
);
```

### Integration Testing

Integration tests will verify that components work together correctly:

- Test complete room puzzle flows from start to completion
- Test navigation flow from Hallway → Room → Hallway → Altar
- Test game state updates propagate to UI correctly
- Test that completing all rooms enables commit functionality

### Testing Workflow

1. **Implementation-first approach**: Implement features before writing tests
2. **Unit tests first**: Write unit tests for core logic and specific examples
3. **Property tests second**: Write property-based tests for universal behaviors
4. **Integration tests last**: Verify end-to-end flows work correctly
5. **Continuous validation**: Run tests after each feature implementation

## Performance Optimization Strategies

### Geometry Optimization

**Instancing**: Use `<Instances>` from drei for repeated objects (doors, candles, orbs)
```typescript
<Instances limit={10} geometry={candleGeometry} material={candleMaterial}>
  {candles.map(candle => (
    <Instance key={candle.id} position={candle.position} />
  ))}
</Instances>
```

**Geometry Reuse**: Create geometries once and reuse across components
```typescript
const sharedGeometries = {
  box: new BoxGeometry(1, 1, 1),
  sphere: new SphereGeometry(0.5, 16, 16),
  cylinder: new CylinderGeometry(0.2, 0.2, 1, 8)
};
```

### Material Optimization

**Material Reuse**: Create materials once and share across meshes
```typescript
const sharedMaterials = {
  stone: new MeshStandardMaterial({ color: '#4a4a4a', roughness: 0.8 }),
  emissive: new MeshStandardMaterial({ emissive: '#00ff00', emissiveIntensity: 2 })
};
```

**Emissive Over Lights**: Prefer emissive materials for glowing objects instead of point lights

### Rendering Optimization

**Frustum Culling**: Ensure objects outside camera view are not rendered (Three.js default)

**Level of Detail**: Not needed for low-poly aesthetic, but consider for distant objects if performance issues arise

**Texture Optimization**: 
- Use power-of-two dimensions (256, 512, 1024)
- Enable mipmapping for textures
- Use compressed texture formats (Draco for geometry, KTX2 for textures)

### Animation Optimization

**useFrame Optimization**:
- Minimize calculations per frame
- Use delta time for frame-rate independent animations
- Throttle expensive calculations (e.g., distance checks every 3rd frame)

```typescript
useFrame((state, delta) => {
  // Frame-rate independent animation
  monsterRef.current.scale.x += growthRate * delta;
  
  // Throttled distance check
  if (state.clock.elapsedTime % 0.1 < delta) {
    checkProximity();
  }
});
```

### Memory Management

**Asset Disposal**: Properly dispose of geometries, materials, and textures when unmounting
```typescript
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, []);
```

**Lazy Loading**: Use dynamic imports for scene components to reduce initial bundle size

### State Management Optimization

**Selective Re-renders**: Use Zustand selectors to prevent unnecessary re-renders
```typescript
const isLoopFixed = useGameState(state => state.fixedRooms.loop);
```

**Memoization**: Use `useMemo` and `useCallback` for expensive calculations and callbacks

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)

1. Project setup with Next.js, TypeScript, React Three Fiber, Tailwind
2. Routing structure with all routes defined
3. Game state store with Zustand
4. Base scene component pattern with Canvas configuration
5. UI component library (Overlay, Button, HUD)

### Phase 2: Hallway Hub (Navigation Center)

1. Hallway scene with placeholder geometry
2. Five door objects with hover and click interactions
3. Camera parallax system
4. Navigation to room routes
5. Visual indicators for fixed rooms

### Phase 3: Bug Rooms (Core Gameplay)

Implement each room in sequence:

1. **Loop Room**: Ghost with click counter and disappearance
2. **Null Candles Room**: Draggable flame and candle lighting
3. **404 Room**: Draggable runes and door opening
4. **Memory Leak Room**: Growing monster and GC orbs
5. **Mirror Room**: Cursor tracking and sync challenge

Each room includes:
- Scene geometry (placeholder primitives)
- Interaction logic
- Success condition
- UI overlay with completion message
- Game state update

### Phase 4: Commit Altar (Completion)

1. Altar scene with terminal/altar object
2. Summary display with checkmarks
3. Commit button with validation
4. Ending sequence

### Phase 5: Polish and Optimization

1. Replace placeholder geometry with GLB models
2. Add ambient audio loops
3. Add sound effects for interactions
4. Optimize performance (instancing, material reuse)
5. Add fog and lighting refinements
6. Test on target hardware

### Phase 6: Testing

1. Write unit tests for all core logic
2. Write property-based tests for universal behaviors
3. Write integration tests for complete flows
4. Performance testing and optimization
5. Cross-browser testing

## Asset Integration Plan

### Placeholder to Model Workflow

1. **Start with primitives**: Implement all logic using boxes, spheres, cylinders
2. **Define model requirements**: Document size, poly count, and style for each asset
3. **Source models**: Find CC0/free models from approved sources
4. **Optimize models**: Reduce poly count if needed, apply Draco compression
5. **Swap in models**: Replace primitives with `useGLTF` hooks
6. **Test performance**: Verify triangle counts and load times stay within budget

### Asset Checklist

**Hallway Hub**:
- Corridor environment (walls, floor, ceiling) - ~10k triangles
- Door model (reused 5x) - ~2k triangles each
- Door icons/glyphs - simple planes with textures

**Loop Room**:
- Room environment - ~8k triangles
- Ghost model - ~3k triangles

**Null Candles Room**:
- Room environment - ~8k triangles
- Candle model (reused 5-10x) - ~1k triangles each
- Flame orb - sphere primitive with emissive material

**404 Room**:
- Corridor environment - ~8k triangles
- Door model (reused from hallway) - ~2k triangles
- Rune discs - cylinder primitives with textures

**Memory Leak Room**:
- Room environment - ~8k triangles
- Monster blob - ~5k triangles
- GC orbs - sphere primitives with emissive material

**Mirror Room**:
- Room environment - ~8k triangles
- Mirror frame - ~2k triangles
- Mirror plane - plane primitive with reflective texture
- Orbs - sphere primitives with emissive material

**Commit Altar**:
- Altar room environment - ~8k triangles
- Terminal/altar object - ~5k triangles

**Total Budget**: ~60k triangles per scene (within requirement)

## Technology Decisions and Rationale

### Why React Three Fiber over vanilla Three.js?

- Declarative component model fits React ecosystem
- Easier state management integration
- Better code organization and reusability
- Active community and ecosystem (drei helpers)
- Simpler cleanup and lifecycle management

### Why Zustand over Redux or Context?

- Minimal boilerplate for simple state needs
- Better performance than Context for frequent updates
- Easy to use selectors prevent unnecessary re-renders
- Small bundle size (~1KB)
- Simple persistence middleware available

### Why Tailwind over CSS Modules or styled-components?

- Rapid UI development with utility classes
- Consistent design system out of the box
- Smaller bundle size (purged unused styles)
- No runtime cost (unlike styled-components)
- Easy to maintain high-contrast, clean UI aesthetic

### Why fast-check for property-based testing?

- Mature JavaScript/TypeScript property testing library
- Rich set of built-in generators
- Good TypeScript support
- Active maintenance and community
- Integrates well with Jest/Vitest

### Why Next.js App Router over Pages Router?

- Modern React features (Server Components, Suspense)
- Better code splitting and lazy loading
- Improved performance characteristics
- Future-proof architecture
- Simpler data fetching patterns (though not heavily used here)

## Accessibility Considerations

While this is primarily a visual 3D experience, basic accessibility should be maintained:

- **Keyboard Navigation**: Ensure all interactive elements (doors, buttons) are keyboard accessible
- **Focus Indicators**: Visible focus states for all interactive UI elements
- **Screen Reader Support**: Provide aria-labels for buttons and interactive elements
- **Color Contrast**: Maintain WCAG AA contrast ratios for all text overlays
- **Motion Sensitivity**: Consider adding a "reduce motion" option that simplifies animations

## Browser Compatibility

**Target Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**WebGL Requirements**:
- WebGL 2.0 support required
- Detect WebGL support and show fallback message if unavailable

**Fallback Strategy**:
```typescript
if (!canvas.getContext('webgl2')) {
  return <div>WebGL 2.0 is required to run this experience.</div>;
}
```

## Deployment Considerations

**Build Optimization**:
- Enable Next.js production build optimizations
- Compress assets (Draco for models, WebP for textures)
- Enable gzip/brotli compression on server
- Use CDN for static assets

**Performance Monitoring**:
- Track FPS in production (optional analytics)
- Monitor asset load times
- Track completion rates for each room

**Hosting Requirements**:
- Static hosting sufficient (Vercel, Netlify, GitHub Pages)
- No server-side rendering needed for 3D scenes
- Minimal API requirements (none for MVP)
