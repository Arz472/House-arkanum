# Implementation Plan

- [x] 1. Set up project foundation and core infrastructure





- [x] 1.1 Initialize Next.js project with TypeScript and App Router


  - Create Next.js project with `create-next-app`
  - Configure TypeScript with strict mode
  - Set up App Router directory structure (`src/app/`)
  - _Requirements: 1.1_

- [x] 1.2 Install and configure dependencies


  - Install React Three Fiber (`@react-three/fiber`)
  - Install drei helpers (`@react-three/drei`)
  - Install Tailwind CSS and configure
  - Install Zustand for state management
  - Install fast-check for property-based testing
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 1.3 Configure Canvas and 3D rendering settings


  - Set up Canvas component with `dpr={[1, 1.5]}`
  - Configure default camera settings
  - Disable SSR for 3D components
  - _Requirements: 2.3_

- [x] 1.4 Create base UI component library


  - Create `Overlay` component with Tailwind styling
  - Create `Button` component with hover states
  - Create `HUD` component for displaying counters
  - Set up monospace font and high-contrast color scheme
  - _Requirements: 3.6, 3.7_

- [x] 1.5 Set up game state store with Zustand


  - Create `useGameState` store with room completion tracking
  - Implement `markRoomFixed` action
  - Implement `resetProgress` action
  - Implement `allRoomsFixed` selector
  - _Requirements: 1.5, 14.1_

- [x] 1.6 Write property test for game state structure


  - **Property 23: Room completion updates game state**
  - **Validates: Requirements 6.6, 7.8, 8.8, 9.7, 10.7, 14.2**

- [x] 1.7 Write unit tests for game state store


  - Test initial state has all rooms set to false
  - Test `markRoomFixed` updates correct room
  - Test `allRoomsFixed` returns true only when all 5 rooms are fixed
  - Test `resetProgress` clears all rooms
  - _Requirements: 14.1, 14.2_

- [x] 2. Implement routing structure




- [x] 2.1 Create all route pages


  - Create `/` page for Hallway Hub
  - Create `/room/loop` page for Loop Room
  - Create `/room/null-candles` page for Null Candles Room
  - Create `/room/404` page for 404 Room
  - Create `/room/leak` page for Memory Leak Room
  - Create `/room/mirror` page for Mirror Room
  - Create `/altar` page for Commit Altar
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2.2 Set up dynamic imports for scene components


  - Configure lazy loading with `dynamic()` and `ssr: false`
  - Create placeholder loading states
  - _Requirements: 2.6_

- [x] 2.3 Write unit tests for routing


  - Test each route renders without crashing
  - Test navigation between routes
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Build Hallway Hub scene





- [x] 3.1 Create HallwayScene component with placeholder geometry


  - Create corridor using box geometries for walls, floor, ceiling
  - Set up fixed camera position
  - Add dim lighting (1 ambient + 1 directional light)
  - Add fog effect
  - _Requirements: 5.1, 5.7, 5.8_

- [x] 3.2 Implement five door objects


  - Create door using placeholder box geometry
  - Position 5 doors along the hallway
  - Add distinguishing colors or simple text labels for each door
  - _Requirements: 5.2, 5.4_

- [x] 3.3 Add door hover interactions


  - Implement hover state detection
  - Add scale-up effect on hover
  - Add subtle glow using emissive material
  - _Requirements: 5.5_

- [x] 3.4 Write property test for door hover feedback


  - **Property 7: Door hover feedback**
  - **Validates: Requirements 5.5**

- [x] 3.5 Implement door click navigation


  - Add click handlers to each door
  - Navigate to corresponding room route on click
  - _Requirements: 4.4, 5.6_

- [x] 3.6 Write property test for door navigation


  - **Property 5: Door navigation consistency**
  - **Validates: Requirements 4.4, 5.6**

- [x] 3.7 Add camera parallax based on mouse movement


  - Track mouse position
  - Apply smooth rotation to camera based on mouse position
  - Use easing for smooth transitions
  - _Requirements: 5.7_

- [x] 3.8 Write property test for camera parallax


  - **Property 8: Camera parallax responsiveness**
  - **Validates: Requirements 5.7**

- [x] 3.9 Create Hallway UI overlay

  - Display title "House Arkanum: Haunted Codebase"
  - Display subtitle "Choose a bug to fix"
  - _Requirements: 5.9_

- [x] 3.10 Add visual indicators for fixed rooms


  - Read game state for each room
  - Display checkmark or "Fixed" label on completed room doors
  - _Requirements: 5.10, 14.4_

- [x] 3.11 Write property test for fixed room indicators


  - **Property 9: Fixed room visual indicators**
  - **Validates: Requirements 5.10, 14.4**


- [x] 3.12 Write unit tests for Hallway Hub

  - Test that exactly 5 doors are rendered
  - Test that overlay displays correct title and subtitle
  - _Requirements: 5.2, 5.9_

- [x] 4. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Infinite Loop Ghost Room
- [ ] 5.1 Create LoopRoom scene with placeholder geometry
  - Create small room using box geometries
  - Add stone wall textures or dark materials
  - Set up lighting (1 ambient + 1 dim directional)
  - _Requirements: 6.1_

- [ ] 5.2 Add ghost entity with looping animation
  - Create ghost using sphere placeholder
  - Implement floating animation (up-down, circular motion)
  - Use `useFrame` for animation loop
  - _Requirements: 6.2_

- [ ] 5.3 Implement ghost click counter
  - Add click handler to ghost
  - Track click count in local state
  - _Requirements: 6.3_

- [ ] 5.4 Write property test for ghost click counter
  - **Property 10: Ghost click counter increment**
  - **Validates: Requirements 6.3**

- [ ] 5.5 Implement ghost disappearance on third click
  - Check if counter reaches 3
  - Play glitch animation (scale/opacity jitter)
  - Set ghost visibility to false
  - _Requirements: 6.4_

- [ ] 5.6 Add success overlay and game state update
  - Display "Infinite loop broken" message
  - Add "Return to Hallway" button
  - Call `markRoomFixed('loop')`
  - _Requirements: 6.5, 6.6_

- [ ] 5.7 Write unit tests for Loop Room
  - Test ghost disappears after 3 clicks
  - Test success overlay appears when ghost disappears
  - Test game state updates when ghost disappears
  - _Requirements: 6.4, 6.5, 6.6_

- [ ] 6. Implement Null Pointer Candles Room
- [ ] 6.1 Create NullCandlesRoom scene with placeholder geometry
  - Create room using box geometries
  - Add stone/brick wall materials
  - Set up lighting
  - _Requirements: 7.1_

- [ ] 6.2 Create candle objects with lit/unlit states
  - Create candle using cylinder placeholder
  - Initialize array of 5-10 candles
  - Set some candles to lit (emissive material) and some to unlit
  - _Requirements: 7.2, 7.3_

- [ ] 6.3 Implement draggable flame orb
  - Create flame orb using sphere with emissive material
  - Implement drag controls using drei's `DragControls` or custom implementation
  - Update flame position on drag
  - _Requirements: 7.4_

- [ ] 6.4 Write property test for flame drag
  - **Property 11: Flame drag updates position**
  - **Validates: Requirements 7.4**

- [ ] 6.5 Implement candle lighting by proximity
  - Check distance between flame and each unlit candle in `useFrame`
  - When distance < threshold, change candle to lit state
  - Update candle material to emissive
  - _Requirements: 7.5_

- [ ] 6.6 Write property test for candle lighting
  - **Property 12: Candle lighting by proximity**
  - **Validates: Requirements 7.5**

- [ ] 6.7 Add candle count HUD
  - Display "Candles lit: X / Y" counter
  - Update count based on lit candles
  - _Requirements: 7.7_

- [ ] 6.8 Write property test for candle count HUD
  - **Property 13: Candle count HUD accuracy**
  - **Validates: Requirements 7.7**

- [ ] 6.9 Implement success condition and game state update
  - Check if all candles are lit
  - Display "Null references resolved" overlay
  - Add return button
  - Call `markRoomFixed('nullCandles')`
  - _Requirements: 7.6, 7.8_

- [ ] 6.10 Write unit tests for Null Candles Room
  - Test initial state has both lit and unlit candles
  - Test all candles lit triggers success overlay
  - Test game state updates on success
  - _Requirements: 7.3, 7.6, 7.8_

- [ ] 7. Implement 404 Door Room
- [ ] 7.1 Create Door404Room scene with placeholder geometry
  - Create corridor using box geometries
  - Add door at the end (reuse door model from hallway)
  - Set up lighting
  - _Requirements: 8.1_

- [ ] 7.2 Add "404" label with glitch effect
  - Create floating text above door using drei's `Text`
  - Implement subtle glitch animation (scale jitter, flicker)
  - _Requirements: 8.2, 8.7_

- [ ] 7.3 Create three draggable rune objects
  - Create runes using cylinder or plane primitives
  - Add simple symbols or textures to distinguish them
  - Position runes in front of door
  - _Requirements: 8.3_

- [ ] 7.4 Implement horizontal drag constraints for runes
  - Add drag controls to each rune
  - Constrain movement to x-axis only
  - Define min/max bounds for track
  - _Requirements: 8.4_

- [ ] 7.5 Write property test for rune drag constraints
  - **Property 14: Rune horizontal drag constraint**
  - **Validates: Requirements 8.4**

- [ ] 7.6 Implement rune order validation and door opening
  - Define correct rune order
  - Check if runes are in correct positions
  - Trigger door opening animation (rotation)
  - _Requirements: 8.5_

- [ ] 7.7 Add success overlay and game state update
  - Display "Routes restored" message
  - Add return button
  - Call `markRoomFixed('door404')`
  - _Requirements: 8.6, 8.8_

- [ ] 7.8 Write unit tests for 404 Room
  - Test exactly 3 runes are present
  - Test door opens when runes in correct order
  - Test success overlay appears when door opens
  - Test game state updates on success
  - _Requirements: 8.3, 8.5, 8.6, 8.8_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Memory Leak Monster Room
- [ ] 9.1 Create MemoryLeakRoom scene with placeholder geometry
  - Create room using box geometries
  - Set up lighting
  - _Requirements: 9.1_

- [ ] 9.2 Create monster with growth behavior
  - Create monster using sphere or blob placeholder
  - Implement gradual scale increase over time in `useFrame`
  - Track monster scale in state
  - _Requirements: 9.2_

- [ ] 9.3 Write property test for monster growth
  - **Property 15: Monster growth over time**
  - **Validates: Requirements 9.2**

- [ ] 9.4 Implement GC orb spawning system
  - Spawn orbs around monster at intervals
  - Limit concurrent orbs to maximum of 5
  - Use sphere primitives with emissive material
  - _Requirements: 9.3_

- [ ] 9.5 Write property test for orb count limit
  - **Property 16: GC orb count limit**
  - **Validates: Requirements 9.3**

- [ ] 9.6 Implement orb collection and monster shrinking
  - Add click handlers to orbs
  - Remove orb on click
  - Reduce monster scale on orb collection
  - _Requirements: 9.4_

- [ ] 9.7 Write property test for orb collection
  - **Property 17: Orb collection reduces monster**
  - **Validates: Requirements 9.4**

- [ ] 9.8 Add memory usage HUD bar
  - Create bar component that visualizes monster scale
  - Update bar proportionally to monster size
  - Display "Memory Usage" label
  - _Requirements: 9.6_

- [ ] 9.9 Write property test for memory HUD
  - **Property 18: Memory HUD proportional to monster**
  - **Validates: Requirements 9.6**

- [ ] 9.10 Implement success condition and game state update
  - Check if monster scale returns to safe range
  - Display "Memory leak fixed" overlay
  - Add return button
  - Call `markRoomFixed('leak')`
  - _Requirements: 9.5, 9.7_

- [ ] 9.11 Write unit tests for Memory Leak Room
  - Test monster scale increases over time
  - Test orb collection reduces monster scale
  - Test success overlay appears when monster stabilized
  - Test game state updates on success
  - _Requirements: 9.2, 9.4, 9.5, 9.7_

- [ ] 10. Implement Possessed DOM Mirror Room
- [ ] 10.1 Create MirrorRoom scene with placeholder geometry
  - Create room using box geometries
  - Add mirror plane on one wall
  - Add simple frame around mirror
  - Set up lighting
  - _Requirements: 10.1_

- [ ] 10.2 Create real orb that follows mouse
  - Create orb using sphere with emissive material
  - Track mouse position
  - Update orb position based on mouse coordinates
  - _Requirements: 10.2, 10.4_

- [ ] 10.3 Write property test for real orb mouse tracking
  - **Property 19: Real orb follows mouse**
  - **Validates: Requirements 10.4**

- [ ] 10.4 Create reflection orb with delay/offset
  - Create second orb for reflection
  - Apply position delay or offset relative to real orb
  - _Requirements: 10.3_

- [ ] 10.5 Implement sync detection logic
  - Calculate distance between real and reflection orbs
  - Track time when distance is below threshold
  - Trigger success when synced for 3 seconds
  - _Requirements: 10.5_

- [ ] 10.6 Write property test for mirror sync
  - **Property 20: Mirror sync threshold and duration**
  - **Validates: Requirements 10.5**

- [ ] 10.7 Add success overlay and game state update
  - Display "UI and DOM back in sync" message
  - Add return button
  - Call `markRoomFixed('mirror')`
  - _Requirements: 10.6, 10.7_

- [ ] 10.8 Write unit tests for Mirror Room
  - Test real orb position updates with mouse movement
  - Test success triggers after sustained sync
  - Test success overlay appears
  - Test game state updates on success
  - _Requirements: 10.4, 10.5, 10.6, 10.7_

- [ ] 11. Implement Commit Altar Scene
- [ ] 11.1 Create CommitAltarScene with placeholder geometry
  - Create altar room using box geometries
  - Add central altar or terminal object
  - Set up atmospheric lighting
  - _Requirements: 11.1_

- [ ] 11.2 Create summary screen display
  - Display "All bugs resolved. Commit fixes?" text
  - Show checkmarks for each fixed room from game state
  - _Requirements: 11.2, 11.3_

- [ ] 11.3 Write property test for altar checkmarks
  - **Property 21: Altar checkmarks match game state**
  - **Validates: Requirements 11.3**

- [ ] 11.4 Implement commit button with validation
  - Add commit button
  - Validate all rooms are fixed before allowing commit
  - Trigger glitch/flash effect on commit
  - _Requirements: 11.4, 14.5_

- [ ] 11.5 Write property test for commit validation
  - **Property 25: Commit requires all rooms fixed**
  - **Validates: Requirements 14.5**

- [ ] 11.6 Add ending sequence
  - Display "Commit successful" message
  - Display "Haunted codebase stabilized" message
  - Add return to hallway or restart button
  - _Requirements: 11.5, 11.6_

- [ ] 11.7 Write unit tests for Commit Altar
  - Test summary screen displays correct text
  - Test checkmarks appear for fixed rooms
  - Test commit button only works when all rooms fixed
  - Test ending sequence displays
  - _Requirements: 11.2, 11.3, 11.5, 11.6_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Add return navigation to all rooms
- [ ] 13.1 Implement return button functionality
  - Add return button to each room's success overlay
  - Navigate to "/" (Hallway Hub) on click
  - _Requirements: 4.5_

- [ ] 13.2 Write property test for return navigation
  - **Property 6: Room completion return navigation**
  - **Validates: Requirements 4.5**

- [ ] 14. Implement performance optimizations
- [ ] 14.1 Add geometry and material reuse
  - Create shared geometry objects
  - Create shared material objects
  - Use instances for repeated objects (doors, candles, orbs)
  - _Requirements: 2.7_

- [ ] 14.2 Optimize useFrame usage
  - Review all useFrame hooks for efficiency
  - Throttle expensive calculations
  - Use delta time for frame-rate independent animations
  - _Requirements: 2.1_

- [ ] 14.3 Add asset disposal on unmount
  - Implement cleanup in useEffect for all geometries
  - Dispose materials and textures properly
  - _Requirements: 2.1_

- [ ] 14.4 Write property tests for performance constraints
  - **Property 1: Scene triangle budget compliance**
  - **Property 2: Scene lighting limit compliance**
  - **Property 3: Scene asset size compliance**
  - **Property 4: Texture resolution compliance**
  - **Validates: Requirements 2.2, 2.4, 2.5, 3.2**

- [ ] 15. Add audio implementation
- [ ] 15.1 Add ambient audio loops
  - Source CC0 ambient audio files
  - Implement audio playback for hallway
  - Implement audio playback for each room
  - Keep volume low
  - _Requirements: 12.1_

- [ ] 15.2 Add sound effects
  - Source CC0 sound effect files
  - Add door opening sound
  - Add ghost disappearing sound
  - Add glitch sounds
  - _Requirements: 12.2_

- [ ] 15.3 Write property test for audio file sizes
  - **Property 22: Audio file size compliance**
  - **Validates: Requirements 12.3**

- [ ] 16. Implement state persistence
- [ ] 16.1 Add Zustand persist middleware
  - Configure localStorage persistence for game state
  - Test state persists across page refreshes
  - _Requirements: 14.3_

- [ ] 16.2 Write property test for state persistence
  - **Property 24: Game state persistence across navigation**
  - **Validates: Requirements 14.3**

- [ ] 17. Replace placeholders with GLB models
- [ ] 17.1 Source and prepare 3D models
  - Find CC0 models for hallway, doors, rooms
  - Find CC0 models for ghost, candles, monster
  - Optimize models and apply Draco compression
  - Verify triangle counts and file sizes
  - _Requirements: 13.1, 13.4, 13.5_

- [ ] 17.2 Integrate models into scenes
  - Replace hallway placeholder geometry with GLB model
  - Replace door placeholders with GLB model
  - Replace ghost placeholder with GLB model
  - Replace candle placeholders with GLB model
  - Replace monster placeholder with GLB model
  - Use `useGLTF` from drei for loading
  - _Requirements: 2.2, 2.5_

- [ ] 17.3 Add model loading error handling
  - Implement fallback to placeholder geometry on load error
  - Add error logging
  - _Requirements: 2.2_

- [ ] 18. Polish and visual refinements
- [ ] 18.1 Refine lighting and fog
  - Adjust lighting intensity and colors
  - Fine-tune fog density and color
  - Ensure high contrast and dark atmosphere
  - _Requirements: 3.4, 3.5_

- [ ] 18.2 Add texture details
  - Source CC0 textures for walls, floors
  - Apply textures to room geometry
  - Verify texture resolutions <= 1024px
  - _Requirements: 3.2_

- [ ] 18.3 Refine UI styling
  - Polish overlay designs with Tailwind
  - Ensure high contrast text
  - Add subtle animations to buttons
  - _Requirements: 3.6, 3.7_

- [ ] 19. Final testing and validation
- [ ] 19.1 Run all unit tests
  - Execute full unit test suite
  - Fix any failing tests
  - Verify coverage of core functionality

- [ ] 19.2 Run all property-based tests
  - Execute full property test suite with 100+ iterations
  - Fix any failing properties
  - Verify all 25 properties pass

- [ ] 19.3 Manual testing on target hardware
  - Test on mid-range laptop with integrated graphics
  - Verify 60 FPS performance
  - Test all room puzzles end-to-end
  - Test navigation flow

- [ ] 19.4 Cross-browser testing
  - Test on Chrome/Edge 90+
  - Test on Firefox 88+
  - Test on Safari 14+
  - Verify WebGL 2.0 support detection

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
