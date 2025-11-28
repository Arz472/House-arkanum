# Vertical 404 Room - Requirements

## Overview
A vertical scrolling 3D memory shaft where the player descends through fragmented memories to discover "ERROR 404: Son Not Found". The room uses parallax layers, clickable memory hints, and a terminal reveal mechanic.

## Acceptance Criteria

### AC1: Vertical Scroll Navigation
- Player can scroll vertically through the memory shaft using mouse wheel
- Camera smoothly follows scroll position with easing
- Scroll is clamped between defined min/max Y boundaries
- Scrolling feels responsive and natural

### AC2: Parallax Layer System
- Three distinct parallax layers: background (0.7x), midground (1.0x), foreground (1.3x)
- Background contains walls, windows, distant stairs
- Midground contains main props (crib, toys, son figure, terminal, hints)
- Foreground contains silhouettes, cables, dust planes
- Layers move at different speeds relative to camera position

### AC3: Memory Level Structure
- At least 5 distinct vertical levels positioned along Y axis
- Each level represents a different time period/memory
- Levels contain thematically appropriate props (crib, toys, drawings, calendar, height chart, etc.)
- Top level shows son figure in warm nursery setting
- Bottom level contains the terminal

### AC4: Clickable Memory Hints
- 5+ clickable hint objects scattered across levels
- Each hint displays unique story text when clicked
- Clicked hints change visual state (color/opacity) to show collected
- Hint text appears in HUD at bottom of screen
- Collected hints are tracked in state

### AC5: Terminal Reveal Mechanic
- Terminal object positioned at bottom of shaft
- Terminal starts inactive (dim green screen)
- Terminal becomes active (bright green) only after collecting required number of hints
- Clicking active terminal triggers completion sequence
- Completion shows "ERROR 404: Son Not Found" overlay
- Overlay includes "Return to Hallway" button

### AC6: Low-Poly 3D Assets
- Initial implementation uses R3F primitives (boxes, planes, cylinders)
- Props are simple but recognizable (crib frame, picture frames, toys)
- Terminal is box + glowing screen plane
- Son figure can start as simple low-poly model or billboard sprite
- Assets can be swapped for GLB models later without changing logic

### AC7: Visual Polish
- Appropriate lighting for memory/abandoned aesthetic
- Optional fog for depth
- Emissive materials for terminal screen and hints
- Tiling textures on walls/shaft
- Smooth transitions and animations
