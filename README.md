# 🏚️ House Arkanum

A browser-based 3D horror puzzle game where you explore a haunted codebase. Each room represents a different software bug that you must fix through interactive puzzles.

Built for the **Kiroween Hackathon** using React, Three.js, and Next.js.

---

## 🎮 Game Overview

You are a developer trapped in a haunted codebase. Five rooms, each representing a critical bug, stand between you and freedom. Solve the puzzles, fix the bugs, and commit your changes at the altar to escape.

### The Rooms

1. **🔄 Loop Room** - Break an infinite loop by clicking a patrolling ghost 3 times within lantern light
2. **🕯️ Null Candles Room** - Find the real candle in a two-floor library using shadow and flicker clues
3. **🚪 404 Room** - Navigate through memory fragments and arrange runes to open the door
4. **💾 Memory Leak Room** - Complete 5 phases to patch a growing memory leak before it consumes everything
5. **🪞 Mirror Room** - Collect body parts and assemble them on a table to fix the reflection

### Victory Condition

Fix all 5 rooms, then proceed to the **Commit Altar** to push your changes and escape the haunted codebase.

---

## ✨ Features

### Gameplay
- 🎯 **5 Unique Puzzle Rooms** - Each with distinct mechanics and atmosphere
- 🎨 **PS1-Style Aesthetic** - Low-poly 3D graphics with a retro horror vibe
- 🎵 **Atmospheric Audio** - Background music and voice lines for immersion
- ⏸️ **Pause Menu** - Press ESC anytime to pause and return to hallway
- 📱 **Mobile Support** - Touch controls and gyroscope camera (experimental)

### Technical
- ⚡ **Performance Optimized** - 60 FPS target on mid-range hardware
- 🧪 **Property-Based Testing** - Fast-check tests for game logic
- 🎭 **State Management** - Zustand for room completion tracking
- 🎬 **Smooth Animations** - Frame-rate independent with delta time

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/house-arkanum.git
cd house-arkanum

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

---

## 🎮 How to Play

### Controls

**Desktop:**
- 🖱️ **Mouse** - Look around (camera parallax)
- 🖱️ **Left Click** - Interact with objects
- 🖱️ **Scroll Wheel** - Zoom (in some rooms)
- ⌨️ **ESC** - Pause menu

**Mobile:**
- 📱 **Gyroscope** - Look around (360° rotation)
- 👆 **Tap** - Interact with objects
- 🎮 **Touch Controls** - On-screen buttons (some rooms)

### Gameplay Tips

1. **Start in the Hallway** - Click on any door to enter a room
2. **Read Instructions** - Each room has on-screen hints
3. **Explore Thoroughly** - Some puzzles require finding hidden objects
4. **Use the Pause Menu** - Press ESC to take a break or return to hallway
5. **Fix All Rooms** - Complete all 5 puzzles before going to the altar
6. **Commit Your Changes** - Visit the altar when all rooms are fixed

---

## 🛠️ Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### 3D Graphics
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

### State & Testing
- **Zustand** - Lightweight state management
- **Vitest** - Unit testing framework
- **Fast-check** - Property-based testing
- **Testing Library** - React component testing

---

## 📁 Project Structure

```
house-arkanum/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Hallway hub
│   ├── room/                # Room routes
│   │   ├── loop/
│   │   ├── null-candles/
│   │   ├── 404/
│   │   ├── leak/
│   │   └── mirror/
│   └── altar/               # Commit altar
├── components/
│   ├── scenes/              # 3D scene components
│   │   ├── HallwayScene.tsx
│   │   ├── LoopRoomScene.tsx
│   │   ├── NullCandlesRoomScene.tsx
│   │   ├── Door404RoomScene.tsx
│   │   ├── MemoryLeakRoomScene.tsx
│   │   └── MirrorRoomScene.tsx
│   ├── ui/                  # UI components
│   │   ├── Button.tsx
│   │   ├── Overlay.tsx
│   │   ├── PauseMenu.tsx
│   │   └── TouchControls.tsx
│   └── Scene3D.tsx          # Base 3D canvas wrapper
├── lib/                     # Utilities
│   ├── sharedGeometry.ts    # Reusable 3D assets
│   ├── usePauseMenu.ts      # Pause menu hook
│   └── MobileControlsContext.tsx
├── store/
│   └── gameState.ts         # Zustand store
├── KIRO_ASSETS/             # Audio, models, textures
└── docs/                    # Documentation
```

---

## 🎯 Performance Optimizations

The game is optimized for 60 FPS on mid-range hardware:

### Implemented Optimizations
1. ✅ **Door Model Caching** - Clone GLTF models once, reuse materials
2. ✅ **Imperative Mesh Updates** - Direct position updates without React re-renders
3. ✅ **Throttled HUD Updates** - 10 updates/sec instead of 60
4. ✅ **Particle Count Reduction** - Optimized particle systems (50-250 → 20-50)
5. ✅ **Shared Geometries** - Reuse geometries and materials across scenes

### Performance Targets
- **Hallway:** 60 FPS
- **Loop Room:** 60 FPS
- **Null Candles:** 60 FPS
- **404 Room:** 60 FPS
- **Memory Leak (Phase 1-4):** 60 FPS
- **Memory Leak (Phase 5):** 45-55 FPS (intensive)
- **Mirror Room:** 60 FPS

See `PERFORMANCE_OPTIMIZATIONS_APPLIED.md` for detailed analysis.

---

## 🧪 Testing

The project uses property-based testing with fast-check:

```bash
# Run all tests
npm test

# Run specific test file
npm test MemoryLeakRoomScene.test.tsx
```

### Test Coverage
- ✅ Room scene rendering
- ✅ Game state management
- ✅ Interaction logic
- ✅ Property-based tests for universal behaviors

Test format: `Feature: haunted-codebase, Property X: description`

---

## 🎨 Visual Style

### Aesthetic
- **PS1-Era Graphics** - Low-poly models, simple textures
- **Dark Color Palette** - Muted tones with cool colors
- **High-Contrast Lighting** - Localized light pools, deep shadows
- **Monospace Fonts** - Code/debug aesthetic for UI

### Color Scheme
- **Loop Room:** Red/Orange (infinite loop warning)
- **Null Candles:** Yellow/Amber (candlelight)
- **404 Room:** Green (terminal/matrix vibes)
- **Memory Leak:** Blue/Cyan (memory/data)
- **Mirror Room:** Purple/Magenta (glitch/corruption)

---

## 📝 Development Notes

### Performance Budget
- **Triangle Limit:** 60,000 per scene
- **Lighting Limit:** 2 lights per scene (1 ambient + 1 directional)
- **Texture Resolution:** Max 1024x1024
- **DPR Cap:** 1.5 (device pixel ratio)

### Code Standards
- Use `dpr={[1, 1.5]}` on Canvas components
- Dispose Three.js resources on unmount
- Use shared geometries from `lib/sharedGeometry.ts`
- Prefer emissive materials over point lights
- Frame-rate independent animations with delta time

### Adding a New Room
1. Create scene component in `components/scenes/`
2. Add route in `app/room/[name]/page.tsx`
3. Add door to `HallwayScene.tsx`
4. Register room ID in `store/gameState.ts`
5. Add pause menu with `usePauseMenu` hook
6. Write tests in `*.test.tsx`

---

## 🐛 Known Issues

- Mobile gyroscope controls may need calibration
- Some audio files may not load on first interaction (browser autoplay policy)
- Performance may vary on integrated graphics

---

## 🚧 Future Enhancements

### Potential Features
- 🎮 Gamepad support
- 💾 Save/load system
- 🏆 Achievement system
- 📊 Statistics tracking
- 🎵 Volume controls in pause menu
- 🌐 Multiplayer co-op mode

### Performance
- Instancing for repeated objects (fence posts, torches)
- Geometry merging for static meshes
- LOD (Level of Detail) system
- Texture atlasing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

### Development
- Built with [Next.js](https://nextjs.org/)
- 3D rendering by [Three.js](https://threejs.org/)
- React integration via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

### Assets
- Audio and voice lines: Custom recordings
- 3D models: Custom low-poly models
- Fonts: System monospace fonts

### Special Thanks
- Kiroween Hackathon organizers
- Three.js community
- React Three Fiber community

---

## 📞 Contact

For questions, feedback, or bug reports, please open an issue on GitHub.

---

**Made with 💀 for Kiroween Hackathon**

*"In code we trust, in bugs we debug."*
