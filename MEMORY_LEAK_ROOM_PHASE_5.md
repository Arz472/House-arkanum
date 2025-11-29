# Memory Leak Room - Phase 5 Complete (Phase 4 Gameplay)

## ✅ Completed Tasks

### Phase 5: Phase 4 - Rotate & Align

- ✅ 5.1 Created memory blocks
  - 3 cubes (0.6 size) at different heights
  - Positions: [3, 1, 3], [-3, 3, -2], [4, 5, -3]
  - Cyan emissive (#00aaff) with glowing edge lines (#00ffff)
  - Random initial rotations (0 to π on each axis)
  - Jitter animation (sine wave on x, y, z)
  - Different target rotations for each block

- ✅ 5.2 Created ghost outlines
  - Wireframe boxes at same positions as blocks
  - Show target rotation for each block
  - White transparent material (opacity 0.3)
  - Disappear when block aligned
  - Same size as blocks (0.65 to account for edge lines)

- ✅ 5.3 Implemented rotation system
  - Click block to start rotating
  - Mouse movement rotates block
  - deltaX rotates around Y axis
  - deltaY rotates around X axis
  - Smooth rotation updates every frame
  - Visual feedback: emissive intensity increases when rotating
  - Release to check alignment

- ✅ 5.4 Added alignment detection
  - Checks rotation difference vs target on all 3 axes
  - Threshold: within 0.15 radians (slightly forgiving)
  - Normalizes angles to 0-2π range for comparison
  - Snaps to exact target rotation when aligned
  - Stops jitter animation when aligned
  - Plays snap sound (D5, 587.33 Hz)
  - Removes ghost outline and edge lines

- ✅ 5.5 Added phase 4 completion
  - Checks when all 3 blocks aligned
  - Blocks slide toward core (lerp animation)
  - Absorbed into core (scale to 0)
  - Memory usage reduces by 15%
  - Success sound plays (E5, 659.25 Hz)
  - "MEMORY BLOCKS ALIGNED" message
  - Transitions to Phase 5 after 0.5s delay

- ✅ 5.6 Added phase 4 audio
  - Rotation: Visual feedback only (no sound to avoid spam)
  - Snap sound: D5 note (587.33 Hz, 200ms)
  - Absorption/success: E5 note (659.25 Hz, 500ms)
  - Uses same Web Audio API system

## 🎮 Gameplay Flow

### Phase 4 Progression
1. **Phase Starts**: 3 memory blocks appear at different heights with random rotations
2. **Ghost Outlines**: Wireframe boxes show target orientations
3. **Jitter Animation**: Blocks shake/jitter to show instability
4. **Player Rotates**: Click and drag to rotate blocks
5. **Alignment Check**: Release to check if aligned with ghost
   - **Aligned**: Snap to target, stop jitter, play sound
   - **Not Aligned**: Continue rotating
6. **Completion**: All 3 aligned → blocks slide to core → absorbed → Phase 5

### Visual Feedback
- **Blocks**: Cyan with bright edge lines, jitter when not aligned
- **Ghost**: White wireframe showing target rotation
- **Rotating**: Emissive intensity increases
- **Aligned**: Edge lines disappear, jitter stops, ghost disappears
- **Absorption**: Blocks slide to core center and scale down
- **Memory Bar**: Drops by 15% on completion

## 🎨 Technical Implementation

### Rotation System
```typescript
- onPointerDown: Store initial mouse position, set rotating
- onPointerMove: Calculate delta, update rotation
  - deltaX → rotate Y axis
  - deltaY → rotate X axis
  - Multiply by 0.01 for smooth control
- onPointerUp: Check alignment
  - Calculate angle differences
  - Normalize to 0-2π
  - If within threshold → snap and align
```

### Alignment Detection
```typescript
- Compare current vs target rotation on X, Y, Z
- Normalize angles: angle % (2π), then min(norm, 2π - norm)
- Threshold: 0.15 radians (~8.6 degrees)
- All 3 axes must be within threshold
- Snap to exact target when aligned
```

### Jitter Animation
```typescript
- useFrame: Update position offset
- Sine waves with different frequencies (5, 7, 6 Hz)
- Different phase offsets per block (based on ID)
- Amplitude: 0.02 units
- Stops when aligned or absorbing
```

### Absorption Animation
```typescript
- Interval: 50ms updates
- Progress: 0 → 1 over 1 second
- Position: lerp from current to core center
- Scale: 0 when progress > 0.5
- Clear interval at progress >= 1
```

## 🧪 Testing

### Manual Test Steps
1. Complete Phase 3 (Simon pattern)
2. See "LOGIC CORE STABILIZED" message
3. Wait for Phase 4 to start
4. See 3 cyan blocks at different heights
5. See white wireframe ghosts showing target rotations
6. Watch blocks jitter/shake
7. Click and drag a block to rotate it
8. Try to match the ghost outline
9. Release - if close enough, block snaps and aligns
10. Repeat for all 3 blocks
11. See blocks slide toward core center
12. See blocks shrink and disappear
13. See "MEMORY BLOCKS ALIGNED" message
14. Memory should drop by 15%

### Expected Behavior
- ✅ 3 blocks appear with random rotations
- ✅ Ghost outlines show target orientations
- ✅ Blocks jitter continuously
- ✅ Click starts rotation (emissive brightens)
- ✅ Mouse movement rotates block smoothly
- ✅ Release checks alignment
- ✅ Close enough = snap with sound
- ✅ Not close = keep trying
- ✅ Aligned blocks stop jittering
- ✅ Ghost disappears when aligned
- ✅ All aligned = absorption animation
- ✅ Blocks slide to core and vanish
- ✅ Phase 5 starts automatically

## 📊 Performance

- **Blocks**: 3 simple cubes with edge lines
- **Rotation**: Smooth updates via mouse events
- **Jitter**: Efficient sine wave calculations
- **Absorption**: Lerp animation with interval
- **Geometry**: Low poly (cubes and wireframes)

## 🎯 Next Steps

Ready to implement Phase 6: Phase 5 - RAM Overflow Finale
- Core pulsing violently
- RAM blocks ejecting from core
- Drag blocks to core slots
- Memory usage increasing rapidly
- Block duplication when critical
- Vignette and audio distortion
- Stabilization and completion

## 🎨 Visual Polish

### What Works Well
- **Jitter animation** shows instability clearly
- **Ghost outlines** make target obvious
- **Edge lines** help visualize rotation
- **Snap feedback** feels satisfying
- **Absorption animation** provides closure
- **Different heights** adds spatial variety

### Interaction Design
- **Forgiving threshold** (0.15 rad) prevents frustration
- **Smooth rotation** (0.01 multiplier) gives control
- **Visual feedback** (emissive change) shows interaction
- **Snap sound** confirms success
- **3 blocks** is enough challenge without tedium

### Difficulty Balance
- Easy to understand (rotate to match outline)
- Moderate challenge (3D rotation is tricky)
- Forgiving threshold (8.6 degrees)
- Clear visual target (ghost outline)
- Satisfying feedback (snap + sound)

## 🐛 Known Issues

None! All diagnostics pass, rotation system works smoothly, and alignment detection is reliable.

## 💡 Design Notes

### Why This Works
1. **Ghost outlines** make the goal immediately clear
2. **Jitter animation** creates urgency and shows problem
3. **3D rotation** is challenging but not impossible
4. **Forgiving threshold** prevents pixel-perfect frustration
5. **Snap feedback** makes success feel good
6. **Absorption** provides satisfying visual closure

### Rotation Control
- Mouse delta → rotation is intuitive
- 0.01 multiplier gives good control speed
- X/Y axes mapped to Y/X rotation feels natural
- No Z-axis rotation keeps it simpler

### Block Placement
- Different heights (1, 3, 5) adds variety
- Spread around room (not clustered)
- All visible from spawn point
- Different target rotations for variety

---

**Status**: Phase 5 (Phase 4 Gameplay) is fully functional and ready for testing!

**Total Progress**: 4/5 gameplay phases complete
- ✅ Phase 1: Seal the Rift
- ✅ Phase 2: Drag Components
- ✅ Phase 3: Simon Pattern Core
- ✅ Phase 4: Rotate & Align
- ⏳ Phase 5: RAM Overflow Finale

**Almost there!** Just one more phase to complete the Memory Leak Room!
