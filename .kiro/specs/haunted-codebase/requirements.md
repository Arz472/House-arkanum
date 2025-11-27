# Requirements Document

## Introduction

The Haunted Codebase of House Arkanum is a browser-based interactive 3D experience where users explore a retro low-poly haunted house representing a cursed codebase. Each room metaphorically represents a software bug that the player must fix through spooky interactions. The project targets the Kiroween hackathon Costume Contest category, emphasizing haunting UI/UX, strong atmosphere, smooth performance, and clever metaphor.

## Glossary

- **System**: The Haunted Codebase application
- **Player**: The user interacting with the 3D experience
- **Room**: A 3D scene representing a specific bug type
- **Bug**: A software defect metaphorically represented as an interactive puzzle in a room
- **Hallway Hub**: The central navigation area connecting all rooms
- **Commit Altar**: The final scene where all fixes are applied
- **Game State**: The persistent tracking of which rooms have been fixed
- **HUD**: Heads-up display showing game information overlaid on the 3D scene
- **GLB Model**: A 3D model file format used for low-poly assets
- **Emissive Material**: A material that appears to emit light without requiring actual light sources
- **DPR**: Device Pixel Ratio, controlling rendering resolution

## Requirements

### Requirement 1: Project Setup and Architecture

**User Story:** As a developer, I want a properly configured Next.js project with React Three Fiber, so that I can build performant 3D scenes with modern tooling.

#### Acceptance Criteria

1. THE System SHALL use Next.js with App Router, React, and TypeScript as the core framework
2. THE System SHALL use React Three Fiber and Three.js for all 3D rendering
3. THE System SHALL use @react-three/drei for common 3D utilities including GLTF loading and text rendering
4. THE System SHALL use Tailwind CSS for all 2D overlays, HUD elements, buttons, and text styling
5. THE System SHALL use Zustand for global game state management to track room completion status

### Requirement 2: Performance Optimization

**User Story:** As a player, I want smooth performance on mid-range hardware, so that I can enjoy the experience without frame drops or lag.

#### Acceptance Criteria

1. THE System SHALL maintain a target frame rate of 60 FPS on mid-range laptops with integrated graphics
2. THE System SHALL limit total triangle count to 60,000 triangles or less per scene
3. THE System SHALL cap device pixel ratio to a maximum of 1.5 using Canvas dpr configuration
4. THE System SHALL use a maximum of 2 lights per scene combining directional and ambient lighting
5. THE System SHALL keep compressed 3D asset size per scene to 10 MB or less
6. THE System SHALL lazy-load scene components using dynamic imports with SSR disabled
7. THE System SHALL reuse materials and geometries across multiple instances where possible

### Requirement 3: Visual Style and Aesthetics

**User Story:** As a player, I want a retro PS1-style low-poly horror aesthetic with modern UI, so that I experience a nostalgic yet polished haunted atmosphere.

#### Acceptance Criteria

1. THE System SHALL render all 3D geometry using low-poly chunky meshes with visible edges
2. THE System SHALL use textures with maximum resolution of 1024 pixels
3. THE System SHALL apply a dark muted color palette with cool tones and occasional accent colors for glows
4. THE System SHALL implement high-contrast lighting with dark environments and localized light pools
5. THE System SHALL use light fog and simple screen-space effects without expensive postprocessing
6. THE System SHALL style UI overlays to resemble a modern IDE or debug HUD using Tailwind CSS
7. THE System SHALL display text using monospace or clean sans-serif fonts with high contrast

### Requirement 4: Navigation and Routing

**User Story:** As a player, I want to navigate between different rooms and the hallway hub, so that I can choose which bugs to fix and return to the main area.

#### Acceptance Criteria

1. THE System SHALL provide a root route at "/" for the Hallway Hub scene
2. THE System SHALL provide routes at "/room/loop", "/room/null-candles", "/room/404", "/room/leak", and "/room/mirror" for bug rooms
3. THE System SHALL provide a route at "/altar" for the Commit Altar scene
4. WHEN a player clicks a door in the Hallway Hub THEN the System SHALL navigate to the corresponding room route
5. WHEN a player completes a room puzzle THEN the System SHALL provide a button to navigate back to the Hallway Hub

### Requirement 5: Hallway Hub Scene

**User Story:** As a player, I want a central hallway hub with five doors, so that I can choose which bug to fix and see my progress.

#### Acceptance Criteria

1. THE System SHALL render a retro low-poly corridor with walls, floor, and ceiling
2. THE System SHALL display five doors representing Infinite Loop, Null Candles, 404, Memory Leak, and Mirror rooms
3. THE System SHALL reuse the same low-poly door model for all five doors
4. THE System SHALL distinguish doors using glyphs, colors, or icons above each door
5. WHEN a player hovers over a door THEN the System SHALL apply a subtle glow or scale-up effect
6. WHEN a player clicks a door THEN the System SHALL navigate to the corresponding room route
7. THE System SHALL implement a fixed camera position with slight parallax rotation based on mouse position
8. THE System SHALL apply dim lighting and fog down the hallway
9. THE System SHALL display an overlay with title "House Arkanum: Haunted Codebase" and subtitle "Choose a bug to fix"
10. THE System SHALL indicate which rooms have been fixed using visual markers on doors

### Requirement 6: Infinite Loop Ghost Room

**User Story:** As a player, I want to break an infinite loop by clicking a ghost three times, so that I can fix this bug metaphor through interaction.

#### Acceptance Criteria

1. THE System SHALL render a small low-poly room with stone walls and simple floor
2. THE System SHALL display a ghost entity that floats in a looping animation
3. WHEN a player clicks the ghost THEN the System SHALL increment an internal counter
4. WHEN the counter reaches 3 THEN the System SHALL play a glitch animation and make the ghost disappear
5. WHEN the ghost disappears THEN the System SHALL display overlay text "Infinite loop broken" with a return button
6. WHEN the ghost disappears THEN the System SHALL mark this room as fixed in global game state

### Requirement 7: Null Pointer Candles Room

**User Story:** As a player, I want to deduce which candle is real using environmental clues and test them with a flame orb, so that I can resolve null references through a logic puzzle with consequences for wrong choices.

#### Acceptance Criteria

1. THE System SHALL render a dark low-poly room with muted grey or brown walls, floor, and ceiling
2. THE System SHALL display exactly three interactive candles arranged in an arc at equal distances from center
3. THE System SHALL designate one candle as real and two candles as fake null references
4. THE System SHALL provide a draggable flame orb that the player can control in screen space
5. THE System SHALL display intro text "The Null Candles" with subtitle "Three candles flicker in the darkness. One holds the truth, but which one is real?"
6. WHEN the flame orb is dragged THEN the System SHALL update the orb position constrained to a plane in front of the camera
7. THE System SHALL render the real candle with stable physically plausible shadows matching the main light direction
8. THE System SHALL render fake candles with incorrect shadow behavior including no shadow or wrong direction shadows
9. THE System SHALL apply natural random flicker to the real candle light intensity
10. THE System SHALL apply unnatural flicker patterns to fake candles including perfect loops or reversed curves
11. WHEN the flame orb is near the real candle THEN the System SHALL brighten the candle and increase its light radius
12. WHEN the flame orb is near a fake candle THEN the System SHALL dim the candle or reduce the orb brightness
13. WHEN the player releases the flame orb overlapping the real candle THEN the System SHALL trigger success sequence
14. WHEN success is triggered THEN the System SHALL brighten the room and fade out fake candles
15. WHEN success is triggered THEN the System SHALL display overlay text "Reference restored" or "Null resolved" with a return button
16. WHEN the player releases the flame orb overlapping a fake candle THEN the System SHALL trigger jumpscare sequence
17. WHEN jumpscare is triggered THEN the System SHALL flash the candle white and fade room to blackout for 0.15 to 0.25 seconds
18. WHEN jumpscare is triggered THEN the System SHALL spawn a jumpscare entity GLB model in front of camera with intense lighting for 0.5 to 1.0 seconds
19. WHEN jumpscare is triggered THEN the System SHALL apply camera shake or jitter effect
20. WHEN jumpscare sequence completes THEN the System SHALL reset the flame orb to starting position and restore room lighting
21. WHEN jumpscare sequence completes THEN the System SHALL turn the chosen fake candle black temporarily before restoring its fake behavior
22. WHEN success is triggered THEN the System SHALL mark this room as fixed in global game state

### Requirement 8: 404 Door Room

**User Story:** As a player, I want to arrange runes in the correct order to open a 404 door, so that I can restore broken routes through a puzzle.

#### Acceptance Criteria

1. THE System SHALL render a small corridor or room with a central door
2. THE System SHALL display a "404" label or glitchy floating text above the door
3. THE System SHALL display three draggable rune objects in front of the door
4. THE System SHALL allow runes to be dragged horizontally along a track
5. WHEN runes are arranged in the correct predefined order THEN the System SHALL trigger a door opening animation
6. WHEN the door opens THEN the System SHALL display overlay text "Routes restored" with a return button
7. THE System SHALL apply a mild glitch effect to the "404" text
8. WHEN the door opens THEN the System SHALL mark this room as fixed in global game state

### Requirement 9: Memory Leak Monster Room

**User Story:** As a player, I want to shrink a growing monster by collecting garbage collection orbs, so that I can fix a memory leak through interactive cleanup.

#### Acceptance Criteria

1. THE System SHALL render a low-poly room with a central monster mesh
2. THE System SHALL gradually increase the monster's scale over time
3. THE System SHALL spawn small glowing orbs around the monster with a maximum of 5 concurrent orbs
4. WHEN a player clicks an orb THEN the System SHALL remove the orb and reduce the monster's scale
5. WHEN the monster's scale returns to a safe range THEN the System SHALL display overlay text "Memory leak fixed" with a return button
6. THE System SHALL display a HUD memory usage bar that increases with monster size
7. WHEN the monster is stabilized THEN the System SHALL mark this room as fixed in global game state

### Requirement 10: Possessed DOM Mirror Room

**User Story:** As a player, I want to align my cursor with its delayed reflection in a mirror, so that I can resync the UI and DOM through a coordination challenge.

#### Acceptance Criteria

1. THE System SHALL render a low-poly room with a wall dominated by a mirror plane
2. THE System SHALL display a glowing orb representing the player's cursor position
3. THE System SHALL display a second orb in the mirror as a delayed or offset reflection
4. THE System SHALL drive the real orb position based on mouse movement
5. WHEN the real orb and reflection orb remain within a small distance threshold for 3 seconds THEN the System SHALL trigger success
6. WHEN success is triggered THEN the System SHALL display overlay text "UI and DOM back in sync" with a return button
7. WHEN success is triggered THEN the System SHALL mark this room as fixed in global game state

### Requirement 11: Commit Altar Scene

**User Story:** As a player, I want to commit all my bug fixes at a final altar, so that I can complete the experience and see the resolution.

#### Acceptance Criteria

1. THE System SHALL render a simple atmospheric altar room with a central floating terminal or stone altar
2. THE System SHALL display a screen showing summary text "All bugs resolved. Commit fixes?"
3. THE System SHALL display checkmarks for all five completed rooms
4. WHEN a player clicks the commit button THEN the System SHALL trigger a brief glitch or flash effect
5. WHEN the commit is triggered THEN the System SHALL display ending text "Commit successful" and "Haunted codebase stabilized"
6. THE System SHALL provide a button to return to the Hallway Hub or restart

### Requirement 12: Audio Implementation

**User Story:** As a player, I want ambient sounds and sound effects, so that the atmosphere feels more immersive and responsive.

#### Acceptance Criteria

1. THE System SHALL play low-volume ambient audio loops for rooms and the hallway
2. THE System SHALL play short sound effects for events including door opening, ghost disappearing, and glitches
3. THE System SHALL keep audio file sizes small and lightweight
4. THE System SHALL ensure audio does not negatively impact performance

### Requirement 13: Asset Management

**User Story:** As a developer, I want to use properly licensed free assets, so that the project can be shared and distributed legally.

#### Acceptance Criteria

1. THE System SHALL use only 3D models, textures, and sounds that are free for commercial use and allow modification
2. THE System SHALL initially implement scenes using placeholder primitive geometry
3. THE System SHALL include comments indicating where GLB models should be loaded using useGLTF
4. THE System SHALL compress 3D models using Draco compression where possible
5. THE System SHALL source assets from approved providers including Kenney, Quaternius, Poly Haven, and Sketchfab CC0 content

### Requirement 14: Game State Persistence

**User Story:** As a player, I want my progress to be tracked across rooms, so that I can see which bugs I've fixed and complete the game systematically.

#### Acceptance Criteria

1. THE System SHALL maintain a global game state tracking completion status for all five bug rooms
2. WHEN a player completes a room puzzle THEN the System SHALL update the game state to mark that room as fixed
3. THE System SHALL persist game state across navigation between routes
4. THE System SHALL display visual indicators in the Hallway Hub showing which rooms are fixed
5. THE System SHALL check game state in the Commit Altar to verify all rooms are completed
