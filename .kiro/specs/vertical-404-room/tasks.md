# Vertical 404 Room - Implementation Tasks

## Phase 1: Core Scroll & Parallax

### Task 1.1: Setup scroll state and input handling
**Requirement**: AC1
**Property**: P1, P6
**Description**: 
- Add scrollY state with min/max bounds
- Implement handleWheel with clamping
- Attach wheel listener to canvas container
**Acceptance**: Scrolling updates scrollY state within bounds

### Task 1.2: Implement camera smooth follow
**Requirement**: AC1
**Property**: P6
**Description**:
- Add useFrame hook
- Lerp camera.position.y toward scrollY
- Use lerp factor of 0.1 for smooth motion
**Acceptance**: Camera follows scroll smoothly without jumps

### Task 1.3: Create parallax layer groups
**Requirement**: AC2
**Property**: P2
**Description**:
- Create three Group refs (background, midground, foreground)
- Add groups to scene with refs
- Update group positions in useFrame based on camera Y
**Acceptance**: Layers move at different speeds (0.7x, 1.0x, 1.3x)

## Phase 2: Memory Levels & Props

### Task 2.1: Define level constants and structure
**Requirement**: AC3
**Property**: P7
**Description**:
- Create LEVELS constant with Y positions
- Create level component functions (LevelTop, LevelCenter, etc.)
- Position level groups at correct Y coordinates
**Acceptance**: Five distinct levels positioned along Y axis

### Task 2.2: Add placeholder props to levels
**Requirement**: AC3, AC6
**Property**: P7
**Description**:
- Add primitive meshes to each level (boxes, planes, cylinders)
- Use simple colors to differentiate levels
- Place props in midground layer
**Acceptance**: Each level has recognizable placeholder props

### Task 2.3: Create shaft/walls background
**Requirement**: AC2, AC6
**Property**: P2
**Description**:
- Add tall cylinder or rectangular tube for shaft walls
- Add thin floor slice planes at key Y levels
- Place in background layer
**Acceptance**: Visible shaft structure with parallax effect

## Phase 3: Hint Collection Mechanic

### Task 3.1: Create MemoryHint component
**Requirement**: AC4
**Property**: P3
**Description**:
- Create MemoryHint component with id, position, text, onCollect props
- Add local collected state
- Implement onClick handler that calls onCollect once
- Change visual state when collected
**Acceptance**: Clicking hint changes appearance and triggers callback

### Task 3.2: Implement hint collection state
**Requirement**: AC4
**Property**: P3
**Description**:
- Add collectedHints Set state
- Add lastHintText state
- Create handleCollect function that updates both states
- Pass handleCollect to MemoryHint instances
**Acceptance**: Clicking hints updates global collection state

### Task 3.3: Place hints across levels
**Requirement**: AC4
**Property**: P3
**Description**:
- Add 5+ MemoryHint instances across different levels
- Assign unique IDs and story text to each
- Position hints at varied X/Z coordinates
**Acceptance**: Hints are distributed across vertical shaft

### Task 3.4: Create hint text HUD
**Requirement**: AC4
**Description**:
- Add HTML overlay div for hint text display
- Show lastHintText when not null
- Style appropriately (bottom of screen, readable)
**Acceptance**: Collected hint text appears in HUD

## Phase 4: Terminal Reveal

### Task 4.1: Create Terminal component
**Requirement**: AC5
**Property**: P4, P5
**Description**:
- Create Terminal component with active and onComplete props
- Add box mesh for terminal body
- Add plane mesh for screen with emissive material
- Screen color changes based on active prop
**Acceptance**: Terminal renders with inactive/active visual states

### Task 4.2: Implement terminal activation logic
**Requirement**: AC5
**Property**: P4
**Description**:
- Calculate canReveal from collectedHints.size >= requiredHints
- Pass canReveal as active prop to Terminal
**Acceptance**: Terminal activates when required hints collected

### Task 4.3: Implement terminal click handler
**Requirement**: AC5
**Property**: P5
**Description**:
- Add onClick to Terminal group
- Guard against clicks when !active or already clicked
- Call onComplete when valid click occurs
**Acceptance**: Terminal only responds to clicks when active

### Task 4.4: Create completion overlay
**Requirement**: AC5
**Description**:
- Add roomCompleted state
- Create HTML overlay with "ERROR 404: Son Not Found" text
- Add "Return to Hallway" button that navigates to /hallway
- Show overlay when roomCompleted is true
**Acceptance**: Clicking active terminal shows completion overlay

## Phase 5: Visual Polish

### Task 5.1: Add lighting
**Requirement**: AC7
**Description**:
- Add ambient light (low intensity)
- Add directional or point lights for depth
- Consider colored lights for atmosphere
**Acceptance**: Scene is properly lit with mood

### Task 5.2: Add foreground elements
**Requirement**: AC2, AC7
**Property**: P2
**Description**:
- Add silhouette meshes to foreground layer
- Add cable/pipe primitives
- Add dust plane with transparent material
**Acceptance**: Foreground layer has depth elements with parallax

### Task 5.3: Add materials and textures
**Requirement**: AC6, AC7
**Description**:
- Add tiling texture to shaft walls (optional)
- Add emissive to hints and terminal screen
- Adjust material properties for visual consistency
**Acceptance**: Materials enhance visual quality

### Task 5.4: Add fog (optional)
**Requirement**: AC7
**Description**:
- Add fog to Canvas for depth effect
- Tune fog density and color
**Acceptance**: Fog adds atmospheric depth

## Phase 6: Story Content

### Task 6.1: Write final hint texts
**Requirement**: AC4
**Description**:
- Write 5+ story hint texts that build narrative
- Ensure texts hint at "son not found" revelation
- Add texts to MemoryHint instances
**Acceptance**: Hints tell coherent story

### Task 6.2: Add thematic props per level
**Requirement**: AC3
**Description**:
- Top level: crib, rocking horse, warm colors
- Mid levels: toys, drawings, calendar, height chart
- Bottom level: faded photos, forms, terminal
**Acceptance**: Each level has thematically appropriate props

## Phase 7: Integration & Testing

### Task 7.1: Test scroll bounds
**Requirement**: AC1
**Property**: P1
**Description**:
- Scroll beyond min/max limits
- Verify camera stops at boundaries
**Acceptance**: Camera never exceeds defined bounds

### Task 7.2: Test parallax ratios
**Requirement**: AC2
**Property**: P2
**Description**:
- Move camera to known Y positions
- Measure layer positions
- Verify ratios are correct (0.7x, 1.0x, 1.3x)
**Acceptance**: Parallax math is correct

### Task 7.3: Test hint collection
**Requirement**: AC4
**Property**: P3
**Description**:
- Click each hint once
- Verify state updates
- Try double-clicking (should do nothing)
**Acceptance**: Hint collection works correctly

### Task 7.4: Test terminal activation
**Requirement**: AC5
**Property**: P4, P5
**Description**:
- Click terminal before collecting hints (should do nothing)
- Collect required hints
- Verify terminal activates
- Click terminal (should trigger completion)
**Acceptance**: Terminal activation logic works correctly

### Task 7.5: Test completion flow
**Requirement**: AC5
**Description**:
- Complete full room sequence
- Verify overlay appears
- Click return button
- Verify navigation to hallway
**Acceptance**: Full completion flow works end-to-end

## Build Order Recommendation
1. Tasks 1.1 → 1.2 → 1.3 (get scroll + parallax working)
2. Tasks 2.1 → 2.2 → 2.3 (add levels and props)
3. Tasks 3.1 → 3.2 → 3.3 → 3.4 (hint mechanic)
4. Tasks 4.1 → 4.2 → 4.3 → 4.4 (terminal reveal)
5. Tasks 6.1 → 6.2 (story content)
6. Tasks 5.1 → 5.2 → 5.3 → 5.4 (polish)
7. Tasks 7.1 → 7.2 → 7.3 → 7.4 → 7.5 (testing)
