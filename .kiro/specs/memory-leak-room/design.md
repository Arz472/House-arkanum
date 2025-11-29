# Memory Leak Room - Technical Design

## Architecture Overview

This room uses a phase-based state machine where each phase introduces a unique interaction mechanic in a different spatial location. All phases share the same 3D environment but activate different objects and behaviors.

## State Management

### Phase State Machine

```typescript
type Phase = 'intro' | 'phase1_seal' | 'phase2_drag' | 'phase3_simon' | 'phase4_rotate' | 'phase5_ram' | 'complete';

interface MemoryLeakState {
  currentPhase: Phase;
  memoryUsage: number; // 0-100
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  phase4Complete: boolean;
  phase5Complete: boolean;
}
```

### Phase 1 State (Seal the Rift)

```typescript
interface Phase1State {
  crackPosition: Vector3;
  isSealing: boolean;
  sealProgress: number; // 0-1
  holdStartTime: number | null;
  nearbyObjects: Array<{
    id: string;
    position: Vector3;
    flickerOffset: Vector3;
  }>;
}
```

### Phase 2 State (Drag Components)

```typescript
interface Component {
  id: string;
  position: Vector3;
  isDragging: boolean;
  isLocked: boolean;
}

interface Phase2State {
  holePosition: Vector3;
  components: Component[];
  componentsLocked: number;
  totalComponents: number;
}
```

### Phase 3 State (Simon Pattern)

```typescript
interface Orb {
  id: string;
  position: Vector3;
  color: string;
  tone: number; // Hz for audio
}

interface Phase3State {
  orbs: Orb[];
  pattern: string[]; // array of orb IDs
  playerInput: string[];
  isPlaying: boolean;
  currentFlashIndex: number;
}
```

### Phase 4 State (Rotate & Align)

```typescript
interface MemoryBlock {
  id: string;
  position: Vector3;
  rotation: Euler;
  targetRotation: Euler;
  isAligned: boolean;
  isDragging: boolean;
}

interface Phase4State {
  blocks: MemoryBlock[];
  alignedCount: number;
}
```

### Phase 5 State (RAM Overflow)

```typescript
interface RAMBlock {
  id: string;
  position: Vector3;
  isDragging: boolean;
  isInserted: boolean;
}

interface Phase5State {
  ramBlocks: RAMBlock[];
  coreSlots: Vector3[];
  insertedCount: number;
  spawnRate: number; // blocks per second
  lastSpawnTime: number;
}
```

## 3D Primitives and Geometry

### Memory Core (Center)
```typescript
// Main pillar
<cylinder args={[1, 1, 6, 8]} position={[0, 3, 0]}>
  <meshStandardMaterial color="#1a4d6d" emissive="#0088cc" emissiveIntensity={0.3} />
</cylinder>

// Rotating rings (3 levels)
{[0, 1, 2].map(i => (
  <torus 
    key={i}
    args={[1.2 + i * 0.2, 0.1, 8, 16]} 
    position={[0, 1 + i * 2, 0]}
    rotation={[Math.PI / 2, 0, 0]}
  >
    <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0.5} />
  </torus>
))}

// Data strips (emissive lines)
{Array.from({length: 8}).map((_, i) => (
  <box 
    key={i}
    args={[0.05, 5, 0.05]}
    position={[
      Math.cos(i * Math.PI / 4) * 1.1,
      3,
      Math.sin(i * Math.PI / 4) * 1.1
    ]}
  >
    <meshStandardMaterial emissive="#00ff88" emissiveIntensity={0.8} />
  </box>
))}
```

### Floor
```typescript
// Main platform
<cylinder args={[8, 8, 0.2, 32]} position={[0, 0, 0]}>
  <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
</cylinder>

// Floor lights (ring)
{Array.from({length: 16}).map((_, i) => (
  <sphere
    key={i}
    args={[0.1, 8, 8]}
    position={[
      Math.cos(i * Math.PI / 8) * 7,
      0.15,
      Math.sin(i * Math.PI / 8) * 7
    ]}
  >
    <meshStandardMaterial emissive="#0088ff" emissiveIntensity={1} />
  </sphere>
))}

// Consoles (around edge)
{Array.from({length: 4}).map((_, i) => (
  <box
    key={i}
    args={[0.8, 1.2, 0.4]}
    position={[
      Math.cos(i * Math.PI / 2) * 6,
      0.6,
      Math.sin(i * Math.PI / 2) * 6
    ]}
  >
    <meshStandardMaterial color="#2a2a3e" />
  </box>
))}
```

### Walls
```typescript
// Octagonal walls
{Array.from({length: 8}).map((_, i) => {
  const angle = i * Math.PI / 4;
  const nextAngle = (i + 1) * Math.PI / 4;
  const radius = 10;
  
  return (
    <box
      key={i}
      args={[
        Math.sqrt(2 * radius * radius * (1 - Math.cos(Math.PI / 4))),
        8,
        0.5
      ]}
      position={[
        Math.cos(angle + Math.PI / 8) * radius,
        4,
        Math.sin(angle + Math.PI / 8) * radius
      ]}
      rotation={[0, angle + Math.PI / 8, 0]}
    >
      <meshStandardMaterial color="#16213e" />
    </box>
  );
})}

// Wall panels (with grates)
{Array.from({length: 8}).map((_, i) => (
  <group key={i}>
    {/* Vent grate */}
    <box
      args={[1, 1, 0.1]}
      position={[
        Math.cos(i * Math.PI / 4) * 9.5,
        3,
        Math.sin(i * Math.PI / 4) * 9.5
      ]}
    >
      <meshStandardMaterial color="#0f3460" />
    </box>
  </group>
))}
```

### Spawn Platform
```typescript
<box args={[2, 0.2, 2]} position={[0, 1.5, 8]}>
  <meshStandardMaterial color="#2a2a3e" metalness={0.6} />
</box>

// Railings
{[-1, 1].map(x => (
  <box key={x} args={[0.1, 0.8, 2]} position={[x, 2.3, 8]}>
    <meshStandardMaterial color="#4a4a5e" />
  </box>
))}
```

## Phase-Specific Objects

### Phase 1: Wall Crack
```typescript
// Crack geometry (custom shape)
<mesh position={crackPosition}>
  <planeGeometry args={[0.8, 1.2]} />
  <meshStandardMaterial 
    color="#ff0000"
    emissive="#ff4444"
    emissiveIntensity={0.8}
    transparent
    opacity={0.6}
  />
</mesh>

// Particle system
<Points>
  <bufferGeometry>
    <bufferAttribute
      attach="attributes-position"
      count={particleCount}
      array={particlePositions}
      itemSize={3}
    />
  </bufferGeometry>
  <pointsMaterial size={0.05} color="#ff8888" transparent opacity={0.8} />
</Points>

// Flickering objects
{nearbyObjects.map(obj => (
  <box
    key={obj.id}
    args={[0.5, 0.5, 0.5]}
    position={[
      obj.position.x + (isFlickering ? obj.flickerOffset.x : 0),
      obj.position.y + (isFlickering ? obj.flickerOffset.y : 0),
      obj.position.z + (isFlickering ? obj.flickerOffset.z : 0)
    ]}
  >
    <meshStandardMaterial color="#888888" />
  </box>
))}
```

### Phase 2: Floor Hole & Components
```typescript
// Hole (portal effect)
<mesh position={holePosition} rotation={[-Math.PI / 2, 0, 0]}>
  <circleGeometry args={[1, 32]} />
  <meshStandardMaterial
    color="#000000"
    emissive="#8800ff"
    emissiveIntensity={0.5}
  />
</mesh>

// Static effect (shader or particles)
<Points position={holePosition}>
  {/* Animated static particles */}
</Points>

// Components (draggable)
{components.map(comp => (
  <box
    key={comp.id}
    args={[0.4, 0.4, 0.4]}
    position={comp.position}
  >
    <meshStandardMaterial
      color={comp.isLocked ? "#00ff00" : "#ffaa00"}
      emissive={comp.isLocked ? "#00ff00" : "#ffaa00"}
      emissiveIntensity={0.5}
    />
  </box>
))}
```

### Phase 3: Simon Orbs
```typescript
// Secondary core housing
<box args={[1.5, 1.5, 0.3]} position={secondaryCorePosition}>
  <meshStandardMaterial color="#1a1a2e" />
</box>

// Orbs in semi-circle
{orbs.map((orb, i) => {
  const angle = -Math.PI / 2 + (i * Math.PI / (orbs.length - 1));
  const radius = 0.8;
  
  return (
    <sphere
      key={orb.id}
      args={[0.15, 16, 16]}
      position={[
        secondaryCorePosition.x + Math.cos(angle) * radius,
        secondaryCorePosition.y + Math.sin(angle) * radius,
        secondaryCorePosition.z + 0.3
      ]}
    >
      <meshStandardMaterial
        color={orb.color}
        emissive={orb.color}
        emissiveIntensity={isFlashing ? 1.5 : 0.5}
      />
    </sphere>
  );
})}

// Glitch halo
<mesh position={secondaryCorePosition}>
  <torusGeometry args={[1, 0.05, 8, 32]} />
  <meshStandardMaterial
    color="#ff00ff"
    emissive="#ff00ff"
    emissiveIntensity={glitchIntensity}
    transparent
    opacity={0.6}
  />
</mesh>
```

### Phase 4: Memory Blocks
```typescript
{blocks.map(block => (
  <group key={block.id} position={block.position}>
    {/* Main block */}
    <box args={[0.6, 0.6, 0.6]} rotation={block.rotation}>
      <meshStandardMaterial
        color="#00aaff"
        emissive="#00aaff"
        emissiveIntensity={0.3}
      />
    </box>
    
    {/* Glowing lines */}
    {!block.isAligned && (
      <>
        <box args={[0.65, 0.05, 0.05]} rotation={block.rotation}>
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
        </box>
        <box args={[0.05, 0.65, 0.05]} rotation={block.rotation}>
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
        </box>
        <box args={[0.05, 0.05, 0.65]} rotation={block.rotation}>
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
        </box>
      </>
    )}
    
    {/* Ghost outline */}
    {!block.isAligned && (
      <box args={[0.65, 0.65, 0.65]} rotation={block.targetRotation}>
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.3}
        />
      </box>
    )}
  </group>
))}
```

### Phase 5: RAM Blocks & Core Slots
```typescript
// Pulsing core (enhanced)
<mesh position={[0, 3, 0]}>
  <cylinderGeometry args={[1, 1, 6, 8]} />
  <meshStandardMaterial
    color="#ff0000"
    emissive="#ff0000"
    emissiveIntensity={pulseIntensity} // 0.5 - 2.0
  />
</mesh>

// RAM blocks (many)
{ramBlocks.map(block => (
  <box
    key={block.id}
    args={[0.3, 0.3, 0.3]}
    position={block.position}
  >
    <meshStandardMaterial
      color={block.isInserted ? "#00ff00" : "#ffff00"}
      emissive={block.isInserted ? "#00ff00" : "#ffff00"}
      emissiveIntensity={0.8}
    />
  </box>
))}

// Core slots (target positions)
{coreSlots.map((slot, i) => (
  <mesh key={i} position={slot}>
    <boxGeometry args={[0.35, 0.35, 0.35]} />
    <meshBasicMaterial
      color="#00ff00"
      wireframe
      transparent
      opacity={0.5}
    />
  </mesh>
))}
```

## Interaction Systems

### Click & Hold (Phase 1)

```typescript
function useClickAndHold(targetRef: RefObject<Mesh>, duration: number) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    if (isHolding && startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      
      if (newProgress >= 1) {
        onComplete();
        setIsHolding(false);
      }
    }
  });

  const handlePointerDown = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
  };

  const handlePointerUp = () => {
    setIsHolding(false);
    startTimeRef.current = null;
    setProgress(0);
  };

  return { progress, handlePointerDown, handlePointerUp };
}
```

### Drag System (Phase 2 & 5)

```typescript
function useDragObject() {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const planeRef = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const intersectionPoint = useRef(new Vector3());

  const handlePointerDown = (id: string) => {
    setIsDragging(true);
    setDraggedId(id);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !draggedId) return;
    
    const raycaster = new Raycaster();
    raycaster.setFromCamera(event.pointer, event.camera);
    raycaster.ray.intersectPlane(planeRef.current, intersectionPoint.current);
    
    // Update object position
    updateObjectPosition(draggedId, intersectionPoint.current);
  };

  const handlePointerUp = () => {
    if (draggedId) {
      checkSnapToTarget(draggedId);
    }
    setIsDragging(false);
    setDraggedId(null);
  };

  return { isDragging, draggedId, handlePointerDown, handlePointerMove, handlePointerUp };
}
```

### Simon Pattern (Phase 3)

```typescript
function useSimonPattern(orbs: Orb[]) {
  const [pattern, setPattern] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFlash, setCurrentFlash] = useState(-1);

  const generatePattern = (length: number) => {
    const newPattern = Array.from({ length }, () => 
      orbs[Math.floor(Math.random() * orbs.length)].id
    );
    setPattern(newPattern);
    playPattern(newPattern);
  };

  const playPattern = async (pattern: string[]) => {
    setIsPlaying(true);
    for (let i = 0; i < pattern.length; i++) {
      setCurrentFlash(i);
      playTone(orbs.find(o => o.id === pattern[i])!.tone);
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentFlash(-1);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsPlaying(false);
  };

  const handleOrbClick = (orbId: string) => {
    if (isPlaying) return;
    
    const newInput = [...playerInput, orbId];
    setPlayerInput(newInput);
    playTone(orbs.find(o => o.id === orbId)!.tone);

    if (newInput[newInput.length - 1] !== pattern[newInput.length - 1]) {
      // Wrong!
      onMistake();
      setPlayerInput([]);
    } else if (newInput.length === pattern.length) {
      // Complete!
      onSuccess();
      setPlayerInput([]);
    }
  };

  return { pattern, playerInput, currentFlash, isPlaying, generatePattern, handleOrbClick };
}
```

### Rotation System (Phase 4)

```typescript
function useRotateObject() {
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (id: string, event: ThreeEvent<PointerEvent>) => {
    setRotatingId(id);
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!rotatingId) return;

    const deltaX = event.clientX - lastMousePos.current.x;
    const deltaY = event.clientY - lastMousePos.current.y;
    
    rotateObject(rotatingId, deltaX * 0.01, deltaY * 0.01);
    
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = () => {
    if (rotatingId) {
      checkAlignment(rotatingId);
    }
    setRotatingId(null);
  };

  return { rotatingId, handlePointerDown, handlePointerMove, handlePointerUp };
}
```

## HUD System

### Memory Usage Bar

```typescript
function MemoryUsageHUD({ usage }: { usage: number }) {
  const getColor = (usage: number) => {
    if (usage < 40) return '#00ff88'; // Green
    if (usage < 70) return '#ffaa00'; // Yellow
    return '#ff0000'; // Red
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-96">
      <div className="font-mono text-sm mb-1" style={{ color: getColor(usage) }}>
        MEMORY USAGE: {usage.toFixed(0).padStart(2, '0')}%
      </div>
      <div className="w-full h-2 bg-gray-800 border border-gray-600">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${usage}%`,
            backgroundColor: getColor(usage)
          }}
        />
      </div>
    </div>
  );
}
```

### Phase Instructions

```typescript
function PhaseInstructions({ phase }: { phase: Phase }) {
  const messages = {
    intro: 'THE MEMORY LEAK\nSomething is consuming everything. Patch it before it fills the room.',
    phase1_seal: 'NEW LEAK DETECTED. SEAL IT.',
    phase2_drag: 'SEGMENT CORRUPTED. RESTORE COMPONENTS.',
    phase3_simon: 'LOGIC CORE UNSTABLE. REPEAT PATTERN.',
    phase4_rotate: 'MEMORY BLOCKS MISALIGNED. CORRECT ORIENTATION.',
    phase5_ram: 'CRITICAL MEMORY LEAK. STABILIZE CORE.',
    complete: 'MEMORY STABILIZED. EXIT UNLOCKED.'
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 text-center">
      <p className="font-mono text-red-400 text-lg whitespace-pre-line">
        {messages[phase]}
      </p>
    </div>
  );
}
```

## Audio System

```typescript
// Ambient breathing hum
const ambientSound = new Audio('/sounds/memory_ambient.mp3');
ambientSound.loop = true;
ambientSound.volume = 0.3;

// Phase sounds
const sounds = {
  crackSeal: new Audio('/sounds/seal.mp3'),
  componentLock: new Audio('/sounds/lock.mp3'),
  orbTone: (frequency: number) => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  },
  blockSnap: new Audio('/sounds/snap.mp3'),
  ramInsert: new Audio('/sounds/insert.mp3'),
  glitchNoise: new Audio('/sounds/glitch.mp3'),
  warning: new Audio('/sounds/warning.mp3')
};
```

## Performance Optimizations

1. **Instanced Geometry**: Use `<instancedMesh>` for RAM blocks in Phase 5
2. **Object Pooling**: Reuse RAM block objects instead of creating/destroying
3. **Particle Limits**: Cap particles at 500 per effect
4. **LOD**: Use lower poly models for distant wall panels
5. **Frustum Culling**: Let Three.js handle off-screen objects
6. **Texture Atlasing**: Combine small textures into single atlas

## Correctness Properties

### Property 1: Phase Progression
*For any* completed phase, the next phase should activate and memory usage should not exceed 100%.

### Property 2: Memory Usage Bounds
*For any* point in time, memory usage should be between 0 and 100.

### Property 3: Interaction Exclusivity
*For any* active phase, only that phase's interaction should be enabled.

### Property 4: Object Cleanup
*For any* completed phase, that phase's objects should be removed or hidden.

### Property 5: Exit Condition
*For all* phases completed, the exit door should be unlocked and visible.
