# Memory Leak Room - Implementation Tasks

## Phase 0: Setup & Foundation

- [ ] 0.1 Create route page `/app/room/leak/page.tsx`
  - Dynamic import of MemoryLeakRoomScene
  - Loading state
  - _Requirements: Story 1_

- [ ] 0.2 Create base scene component `components/scenes/MemoryLeakRoomScene.tsx`
  - Scene3D wrapper with camera position [0, 2, 8]
  - Background color #222222
  - Basic lighting setup
  - _Requirements: Story 1_

- [ ] 0.3 Create phase state management
  - Phase enum type
  - MemoryLeakState interface
  - useState hooks for phase tracking
  - Memory usage state (starts at 8%)
  - _Requirements: All Stories_

## Phase 1: Room Environment

- [ ] 1.1 Build central Memory Core
  - Cylinder pillar (1 radius, 6 height, 8 segments)
  - 3 rotating torus rings at different heights
  - 8 emissive data strips around pillar
  - Rotation animation for rings
  - _Requirements: Story 1_

- [ ] 1.2 Build floor platform
  - Circular cylinder (8 radius, 0.2 height)
  - Metallic material (#1a1a2e)
  - 16 floor lights in ring pattern
  - 4 console boxes around edge
  - _Requirements: Story 1_

- [ ] 1.3 Build octagonal walls
  - 8 wall segments forming octagon
  - Height 8, thickness 0.5
  - Wall panels with vent grates
  - Glowing status panels
  - _Requirements: Story 1_

- [ ] 1.4 Build spawn platform
  - Elevated platform at [0, 1.5, 8]
  - 2x2 size with railings
  - Camera positioned looking at core
  - _Requirements: Story 1_

- [ ] 1.5 Add ambient effects
  - Dim bluish lighting (ambient + directional)
  - Subtle fog effect
  - Faint particle drift from ceiling
  - _Requirements: Story 1_

- [ ] 1.6 Create Memory Usage HUD
  - Top-center bar component
  - "MEMORY USAGE: XX%" text
  - Color coding: green < 40%, yellow < 70%, red >= 70%
  - Smooth transitions
  - _Requirements: Story 1_

- [ ] 1.7 Add intro text overlay
  - "THE MEMORY LEAK" title
  - Subtitle: "Something is consuming everything..."
  - Fade in on spawn, fade out after 3 seconds
  - _Requirements: Story 1_

## Phase 2: Phase 1 - Seal the Rift

- [ ] 2.1 Create wall crack geometry
  - Plane mesh with jagged shape
  - Position on wall at eye level
  - Red emissive material
  - Glowing outline when aimed at
  - _Requirements: Story 2_

- [ ] 2.2 Add crack particle system
  - Shimmering particles escaping from crack
  - 200-300 particles max
  - Drift outward from crack
  - Stop when crack sealed
  - _Requirements: Story 2_

- [ ] 2.3 Create flickering objects
  - 2-3 boxes near crack
  - Flicker between two positions
  - Random flicker timing
  - Stabilize when crack sealed
  - _Requirements: Story 2_

- [ ] 2.4 Implement click-and-hold mechanic
  - useClickAndHold custom hook
  - Raycasting to detect crack hover
  - Progress ring visual (0-1 over 2 seconds)
  - onPointerDown/Up handlers
  - _Requirements: Story 2_

- [ ] 2.5 Add seal completion logic
  - Crack shrinks and disappears
  - Particles stop emitting
  - Objects snap to stable position
  - Memory usage reduces by 5-10%
  - Transition to Phase 2
  - _Requirements: Story 2_

- [ ] 2.6 Add phase 1 audio
  - Crack hissing sound (looped)
  - Seal progress sound
  - Completion "seal" sound effect
  - _Requirements: Story 2_

## Phase 3: Phase 2 - Drag Components

- [ ] 3.1 Create floor hole portal
  - Circular mesh on floor near core
  - Black with purple emissive
  - Static/noise effect (particles or shader)
  - Position at [2, 0.1, -2]
  - _Requirements: Story 3_

- [ ] 3.2 Create draggable components
  - 3-4 small cubes (0.4 size)
  - Orange emissive material
  - Spawn near hole, drift slowly away
  - Each has unique ID
  - _Requirements: Story 3_

- [ ] 3.3 Implement drag system
  - useDragObject custom hook
  - Raycasting to floor plane
  - onPointerDown/Move/Up handlers
  - Visual feedback when dragging
  - _Requirements: Story 3_

- [ ] 3.4 Add snap-to-hole logic
  - Detect when component near hole (distance < 0.5)
  - Lock component in place
  - Play lock sound
  - Change component color to green
  - _Requirements: Story 3_

- [ ] 3.5 Add phase 2 completion
  - Check when all components locked
  - Hole seals (shrinks and disappears)
  - Display "SEGMENT REPAIRED" message
  - Memory usage reduces by 10-15%
  - Transition to Phase 3
  - _Requirements: Story 3_

- [ ] 3.6 Add phase 2 audio
  - Component drag sound (subtle)
  - Lock-in click sound
  - Hole seal sound
  - _Requirements: Story 3_

## Phase 4: Phase 3 - Simon Pattern

- [ ] 4.1 Create secondary core housing
  - Box mounted on wall at [6, 3, 0]
  - Dark material with tech details
  - Glitchy halo ring around it
  - _Requirements: Story 4_

- [ ] 4.2 Create Simon orbs
  - 4-5 spheres in semi-circle (0.15 radius)
  - Distinct colors: red, blue, green, yellow, purple
  - Each has unique tone frequency
  - Emissive materials
  - _Requirements: Story 4_

- [ ] 4.3 Implement pattern generation
  - useSimonPattern custom hook
  - Generate random sequence (start with 3, increase)
  - Store pattern and player input arrays
  - _Requirements: Story 4_

- [ ] 4.4 Implement pattern playback
  - Flash orbs in sequence
  - Play corresponding tone for each
  - 600ms flash, 200ms gap
  - Disable input during playback
  - _Requirements: Story 4_

- [ ] 4.5 Implement player input
  - Click orbs to repeat pattern
  - Play tone on click
  - Check if matches pattern
  - Handle mistakes vs success
  - _Requirements: Story 4_

- [ ] 4.6 Add mistake handling
  - Spike memory usage by 5%
  - Play glitch noise
  - Flash screen red briefly
  - Reset player input
  - Replay pattern
  - _Requirements: Story 4_

- [ ] 4.7 Add phase 3 completion
  - Orbs unify to single color
  - Halo stabilizes and dissolves
  - Memory usage reduces by 10%
  - Transition to Phase 4
  - _Requirements: Story 4_

- [ ] 4.8 Add phase 3 audio
  - Tone generation for each orb (Web Audio API)
  - Glitch noise for mistakes
  - Success chime
  - _Requirements: Story 4_

## Phase 5: Phase 4 - Rotate & Align

- [ ] 5.1 Create memory blocks
  - 3 cubes (0.6 size) at different heights
  - Positions: [3, 1, 3], [-3, 3, -2], [4, 5, -3]
  - Cyan emissive with glowing edge lines
  - Random initial rotations
  - Jitter animation
  - _Requirements: Story 5_

- [ ] 5.2 Create ghost outlines
  - Wireframe boxes at same positions
  - Show target rotation
  - White transparent material
  - Disappear when block aligned
  - _Requirements: Story 5_

- [ ] 5.3 Implement rotation system
  - useRotateObject custom hook
  - Click block to grab
  - Mouse movement rotates block
  - Smooth rotation with damping
  - _Requirements: Story 5_

- [ ] 5.4 Add alignment detection
  - Check rotation difference vs target
  - Threshold: within 0.1 radians on all axes
  - Snap to exact target when close
  - Stop jitter animation
  - Play snap sound
  - _Requirements: Story 5_

- [ ] 5.5 Add phase 4 completion
  - All 3 blocks aligned
  - Blocks slide toward core
  - Absorbed into core with particle effect
  - Memory usage reduces by 15%
  - Transition to Phase 5
  - _Requirements: Story 5_

- [ ] 5.6 Add phase 4 audio
  - Rotation sound (subtle mechanical)
  - Snap sound on alignment
  - Absorption sound
  - _Requirements: Story 5_

## Phase 6: Phase 5 - RAM Overflow Finale

- [ ] 6.1 Enhance core for finale
  - Increase emissive intensity
  - Violent pulsing animation (0.5-2.0 intensity)
  - Red color shift
  - Shake/vibration effect
  - _Requirements: Story 6_

- [ ] 6.2 Create RAM block spawning
  - Spawn blocks from core every 1-2 seconds
  - Small cubes (0.3 size)
  - Yellow/green emissive
  - Eject with physics (velocity outward)
  - Land on floor and scatter
  - _Requirements: Story 6_

- [ ] 6.3 Create core slots
  - 8-12 slot positions around core
  - Wireframe boxes showing targets
  - Green emissive outlines
  - _Requirements: Story 6_

- [ ] 6.4 Implement RAM drag system
  - Reuse drag hook from Phase 2
  - Drag blocks from floor to slots
  - Snap when near slot (distance < 0.4)
  - Block locks into slot
  - _Requirements: Story 6_

- [ ] 6.5 Add memory increase logic
  - Memory usage increases 2% per second
  - Each inserted block reduces rate by 0.3%
  - If rate reaches 0, usage starts decreasing
  - _Requirements: Story 6_

- [ ] 6.6 Add block duplication
  - If memory > 70%, blocks start duplicating
  - Duplicate existing floor blocks
  - Max 30 blocks on floor
  - _Requirements: Story 6_

- [ ] 6.7 Add critical state effects
  - Memory > 70%: vignette starts
  - Memory > 85%: audio distortion
  - Memory > 95%: screen shake
  - Display "CRITICAL MEMORY LEAK" warning
  - _Requirements: Story 6_

- [ ] 6.8 Add phase 5 completion
  - Detect when enough blocks inserted (rate <= 0)
  - Core stops ejecting blocks
  - Duplicate blocks dissolve into particles
  - Memory usage drops to 15%
  - Core calms (blue, slow pulse)
  - Lighting returns to calm state
  - _Requirements: Story 6_

- [ ] 6.9 Add phase 5 audio
  - Core pulse sound (heartbeat-like)
  - Block eject sound
  - Insert/lock sound
  - Warning alarm (when critical)
  - Distortion effect on all audio
  - Calm resolution sound
  - _Requirements: Story 6_

## Phase 7: Completion & Exit

- [ ] 7.1 Create exit door
  - Doorway-shaped gap in wall
  - Appears when all phases complete
  - Glowing blue outline
  - Particle effect around edges
  - _Requirements: Story 7_

- [ ] 7.2 Add completion overlay
  - "MEMORY STABILIZED" text
  - "EXIT UNLOCKED" subtitle
  - Fade in over 1 second
  - Stay visible until player exits
  - _Requirements: Story 7_

- [ ] 7.3 Implement exit interaction
  - Clickable door or auto-trigger on approach
  - Mark room as complete in game state
  - Navigate to hallway
  - _Requirements: Story 7_

- [ ] 7.4 Add completion audio
  - Success fanfare
  - Door unlock sound
  - Ambient fade out
  - _Requirements: Story 7_

## Phase 8: Polish & Testing

- [ ] 8.1 Add phase transition effects
  - Fade between phases
  - Brief pause with instruction text
  - Smooth memory bar transitions
  - _Requirements: All Stories_

- [ ] 8.2 Optimize performance
  - Use instanced mesh for RAM blocks
  - Implement object pooling
  - Limit particle counts
  - Test on lower-end hardware
  - Target 60 FPS
  - _Requirements: Technical Requirements_

- [ ] 8.3 Add accessibility features
  - Keyboard controls for all interactions
  - Screen reader announcements for phase changes
  - Colorblind-friendly colors
  - Adjustable difficulty (optional)
  - _Requirements: Technical Requirements_

- [ ] 8.4 Write unit tests
  - Phase state transitions
  - Memory usage calculations
  - Interaction detection
  - Completion conditions
  - _Requirements: All Stories_

- [ ] 8.5 Write integration tests
  - Full room playthrough
  - Phase progression
  - Exit unlocking
  - Game state updates
  - _Requirements: All Stories_

- [ ] 8.6 Manual testing checklist
  - Test each phase independently
  - Test full playthrough
  - Test edge cases (rapid clicking, etc.)
  - Test on different screen sizes
  - Test performance
  - _Requirements: All Stories_

## Phase 9: Audio Assets

- [ ] 9.1 Create/source ambient sound
  - Breathing hum loop (optional enhancement)
  - Low frequency, subtle
  - _Requirements: Story 1_

- [x] 9.2 Create/source phase sounds
  - [x] Crack seal sound (523.25 Hz tone)
  - [x] Crack start/release sounds (200/150 Hz)
  - [x] Component pickup/drop sounds (F4/D4 tones)
  - [x] Component lock sound (ascending pitch per block)
  - [x] Orb tones (Web Audio API - 5 distinct frequencies)
  - [x] Block snap sound (587.33 Hz)
  - [x] Block release sound (220 Hz)
  - [x] RAM spawn sound (200 Hz)
  - [x] RAM clear sound (523.25 Hz)
  - [x] Glitch noise (100/80/120 Hz triple tone)
  - [x] Warning alarm (implicit via critical warning UI)
  - _Requirements: All Stories_

- [x] 9.3 Create/source completion sounds
  - [x] Success fanfares (multi-note ascending sequences)
  - [x] Phase complete sounds (3-4 note fanfares)
  - [x] Round complete sounds (ascending tones)
  - [x] Door unlock (exit sounds with fanfare)
  - [x] Button click/confirmation (440/523.25 Hz)
  - _Requirements: Story 7_

## Notes

- Each phase should be independently testable
- Memory usage should always be visible and accurate
- All interactions should have clear visual feedback
- Audio should enhance but not be required for gameplay
- Performance target: 60 FPS on mid-range hardware
- Mobile support is optional but nice to have
