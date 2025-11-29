---
inclusion: always
---

# House Arkanum Project Context

## Project Overview
This is a browser-based 3D horror experience built for the Kiroween hackathon. The game represents a haunted codebase where each room is a software bug that players must fix through interactive puzzles.

## Performance Requirements
- **Target FPS**: 60 FPS on mid-range laptops with integrated graphics
- **Triangle Budget**: Maximum 60,000 triangles per scene
- **Lighting Limit**: Maximum 2 lights per scene (1 ambient + 1 directional)
- **Asset Size**: Compressed 3D assets ≤ 10 MB per scene
- **Texture Resolution**: Maximum 1024x1024 pixels
- **DPR Cap**: Device pixel ratio capped at 1.5

## Code Standards

### 3D Scene Components
- Always use `dpr={[1, 1.5]}` on Canvas components
- Implement proper cleanup in useEffect (dispose geometries, materials, textures)
- Use shared geometries and materials from `lib/sharedGeometry.ts`
- Prefer emissive materials over point lights for glowing effects
- Use `useFrame` with delta time for frame-rate independent animations

### State Management
- Use Zustand store (`store/gameState.ts`) for room completion tracking
- Call `markRoomFixed(roomId)` when puzzle is solved
- Check `allRoomsFixed()` before allowing commit at altar

### Testing
- Write unit tests for all interactive logic
- Use property-based tests (fast-check) for universal behaviors
- Test format: `Feature: haunted-codebase, Property X: description`
- Run tests with `npm test`

### Navigation
- All rooms should have return navigation to "/" (Hallway Hub)
- Use Next.js router for navigation between scenes
- Lazy load scene components with `dynamic(() => import(), { ssr: false })`

## Visual Style
- Low-poly PS1-style aesthetic
- Dark muted color palette with cool tones
- High-contrast lighting with localized light pools
- Tailwind CSS for all UI overlays and HUD elements
- Monospace fonts for code/debug aesthetic

## Room Puzzle Mechanics
1. **Loop Room** (`/room/loop`): Click ghost 3 times to break infinite loop
2. **Null Candles** (`/room/null-candles`): Deduce real candle using shadow/flicker clues
3. **404 Room** (`/room/404`): Arrange runes in correct order to open door
4. **Memory Leak** (`/room/leak`): Collect GC orbs to shrink growing monster
5. **Mirror Room** (`/room/mirror`): Sync cursor with delayed reflection for 3 seconds

## File Organization
- Scene components: `components/scenes/`
- UI components: `components/ui/`
- Shared utilities: `lib/`
- State management: `store/`
- Route pages: `app/` (Next.js App Router)

## Development Workflow
1. Define requirements in `.kiro/specs/{feature}/requirements.md`
2. Design architecture in `.kiro/specs/{feature}/design.md`
3. Break down into tasks in `.kiro/specs/{feature}/tasks.md`
4. Implement features following steering guidelines
5. Write tests (unit + property-based)
6. Update task status as work progresses
7. Verify performance budgets before commit
