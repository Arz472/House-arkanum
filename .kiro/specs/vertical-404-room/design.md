# Vertical 404 Room - Design

## Architecture

### Component Structure
```
Door404RoomScene (parent)
├── VerticalScrollContainer (handles scroll input)
├── ParallaxLayers (three groups with refs)
│   ├── BackgroundLayer (walls, shaft, windows)
│   ├── MidgroundLayer (props, hints, terminal)
│   └── ForegroundLayer (silhouettes, cables)
├── MemoryLevels (positioned groups)
│   ├── LevelTop (Y: 10)
│   ├── LevelMidHigh (Y: 5)
│   ├── LevelCenter (Y: 0)
│   ├── LevelMidLow (Y: -5)
│   └── LevelBottom (Y: -10)
├── MemoryHints (clickable objects)
├── Terminal (reveal object)
└── HUD (hint text display)
```

## Correctness Properties

### P1: Scroll Bounds (AC1)
**Property**: Camera Y position is always clamped between minY and maxY
**Verification**: `minY <= camera.position.y <= maxY` at all times
**Test**: Scroll beyond limits and verify camera stops at boundaries

### P2: Parallax Ratios (AC2)
**Property**: Layer positions scale correctly relative to camera Y
**Verification**: 
- `backgroundLayer.y = camera.y * 0.7`
- `midgroundLayer.y = camera.y * 1.0`
- `foregroundLayer.y = camera.y * 1.3`
**Test**: Move camera to known Y positions and verify layer positions

### P3: Hint Collection State (AC4)
**Property**: Each hint can only be collected once and updates global state
**Verification**: 
- `collectedHints.has(hintId)` after click
- Second click on same hint does nothing
- `collectedHints.size` increments correctly
**Test**: Click hints and verify state updates, try double-clicking

### P4: Terminal Activation Logic (AC5)
**Property**: Terminal is active if and only if required hints are collected
**Verification**: `terminal.active === (collectedHints.size >= requiredHints)`
**Test**: Collect hints one by one and verify terminal activates at threshold

### P5: Terminal Click Guard (AC5)
**Property**: Terminal only responds to clicks when active
**Verification**: Click handler returns early if `!active || clicked`
**Test**: Click inactive terminal (should do nothing), click active terminal (should trigger completion)

### P6: Smooth Camera Movement (AC1)
**Property**: Camera position lerps toward scroll target each frame
**Verification**: `camera.y += (scrollY - camera.y) * lerpFactor` in useFrame
**Test**: Rapid scroll changes should result in smooth camera motion, not jumps

### P7: Level Positioning (AC3)
**Property**: Memory levels are positioned at distinct Y coordinates
**Verification**: Each level group has unique `position.y` value
**Test**: Scroll through shaft and verify levels appear at expected positions

## State Management

### Component State
```typescript
// Scroll state
const [scrollY, setScrollY] = useState(0);
const minY = -10;
const maxY = 10;

// Hint collection
const [collectedHints, setCollectedHints] = useState<Set<string>>(new Set());
const [lastHintText, setLastHintText] = useState<string | null>(null);
const requiredHints = 5;

// Terminal
const canReveal = collectedHints.size >= requiredHints;
const [roomCompleted, setRoomCompleted] = useState(false);

// Parallax refs
const backgroundRef = useRef<Group>(null);
const midgroundRef = useRef<Group>(null);
const foregroundRef = useRef<Group>(null);
```

## Implementation Details

### Scroll Handler
```typescript
const handleWheel = (e: WheelEvent) => {
  setScrollY(prev => clamp(prev + e.deltaY * 0.01, minY, maxY));
};
```

### Parallax Update (useFrame)
```typescript
useFrame((state) => {
  const camera = state.camera;
  
  // Smooth camera Y
  camera.position.y += (scrollY - camera.position.y) * 0.1;
  
  // Parallax layers
  if (backgroundRef.current) {
    backgroundRef.current.position.y = camera.position.y * 0.7;
  }
  if (midgroundRef.current) {
    midgroundRef.current.position.y = camera.position.y * 1.0;
  }
  if (foregroundRef.current) {
    foregroundRef.current.position.y = camera.position.y * 1.3;
  }
});
```

### Memory Hint Component
```typescript
type HintProps = {
  id: string;
  position: [number, number, number];
  text: string;
  onCollect: (id: string, text: string) => void;
};

function MemoryHint({ id, position, text, onCollect }: HintProps) {
  const [collected, setCollected] = useState(false);
  
  const handleClick = () => {
    if (collected) return;
    setCollected(true);
    onCollect(id, text);
  };
  
  return (
    <mesh position={position} onClick={handleClick}>
      <planeGeometry args={[1, 0.6]} />
      <meshStandardMaterial color={collected ? "#333" : "#fff"} />
    </mesh>
  );
}
```

### Terminal Component
```typescript
function Terminal({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [clicked, setClicked] = useState(false);
  
  const handleClick = () => {
    if (!active || clicked) return;
    setClicked(true);
    onComplete();
  };
  
  return (
    <group position={[0, LEVELS.bottom, 0]} onClick={handleClick}>
      <mesh>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.6, 0.3]}>
        <planeGeometry args={[1.8, 0.7]} />
        <meshStandardMaterial
          color={active ? "#0f0" : "#030"}
          emissive={active ? "#0f0" : "#030"}
        />
      </mesh>
    </group>
  );
}
```

## Level Constants
```typescript
const LEVELS = {
  top: 10,      // Son figure, warm nursery
  midHigh: 5,   // Childhood toys, drawings
  center: 0,    // Calendar, height chart
  midLow: -5,   // Faded photos, forms
  bottom: -10,  // Terminal
};
```

## Asset Strategy
- Start with R3F primitives: `<boxGeometry>`, `<planeGeometry>`, `<cylinderGeometry>`
- Use `<meshStandardMaterial>` with colors and emissive properties
- Textures can be added via `map` property later
- GLB models can replace primitives without changing component structure
- Keep all geometry simple for performance

## Story Hints (Example)
1. "First steps... I remember the sound of laughter"
2. "Birthday candles, five of them. He was so proud."
3. "The height chart stopped at 4'2\". Why did it stop?"
4. "School forms, never submitted. Doctor appointments, never kept."
5. "The last photo is dated three years ago. But I see him every day."

## Completion Sequence
1. Player collects 5th hint
2. Terminal screen glows bright green
3. Player scrolls to bottom and clicks terminal
4. Screen fades to black
5. Text appears: "ERROR 404: Son Not Found"
6. Button appears: "Return to Hallway"
7. Click returns to `/hallway`
