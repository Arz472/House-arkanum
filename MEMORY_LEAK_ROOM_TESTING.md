# Memory Leak Room - Testing Checklist

## 🧪 Manual Testing Guide

### Pre-Test Setup
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to: `http://localhost:3000/room/leak`
- [ ] Open browser console for errors
- [ ] Check FPS counter (if available)

---

## Phase 0: Initial Load

### Rendering
- [ ] Scene loads without errors
- [ ] "Loading Memory Leak Room..." appears briefly
- [ ] 3D scene renders correctly
- [ ] Camera positioned correctly (elevated view)
- [ ] Room is visible and well-lit

### Environment
- [ ] Central core visible with rotating rings
- [ ] Floor platform with blue lights
- [ ] Octagonal walls surrounding room
- [ ] Spawn platform under player
- [ ] Ceiling particles falling slowly
- [ ] Fog creates depth

### HUD
- [ ] Memory usage bar visible at top
- [ ] Shows "MEMORY USAGE: 08%" in green
- [ ] Bar is 8% filled

---

## Phase 1: Intro (0-3 seconds)

### Text Display
- [ ] "THE MEMORY LEAK" title appears
- [ ] Subtitle text visible and readable
- [ ] Text fades in smoothly
- [ ] Text fades out after 3 seconds

### Transition
- [ ] After 3 seconds, Phase 1 begins
- [ ] "NEW LEAK DETECTED. SEAL IT." appears

---

## Phase 2: Seal the Rift (3-15 seconds)

### Visual Elements
- [ ] Red crack appears on wall
- [ ] Crack pulses/glows
- [ ] 250 red particles stream from crack
- [ ] 3 boxes flicker near crack
- [ ] Boxes jump between positions

### Interaction
- [ ] Hover over crack - outline glows brighter
- [ ] Click crack - nothing happens (need to hold)
- [ ] Click and hold crack - progress ring appears
- [ ] Progress ring fills over 2 seconds
- [ ] Release early - progress resets

### Completion
- [ ] Hold for 2 seconds - crack seals
- [ ] Crack shrinks and disappears
- [ ] Particles stop
- [ ] Boxes stop flickering and stabilize
- [ ] Memory drops from 8% to 0%
- [ ] "LEAK SEALED" message appears briefly
- [ ] Phase 2 starts after 1 second

---

## Phase 3: Drag Components (15-45 seconds)

### Visual Elements
- [ ] Purple hole appears on floor
- [ ] Hole has static/noise particles
- [ ] 4 orange cubes spawn near hole
- [ ] Cubes pulse/breathe
- [ ] "SEGMENT CORRUPTED. RESTORE COMPONENTS." appears

### Drift Mechanic
- [ ] Cubes slowly drift away from hole
- [ ] Drift is continuous and smooth
- [ ] Cubes stay within room bounds

### Interaction
- [ ] Click cube - can drag it
- [ ] Cube turns yellow while dragging
- [ ] Cube follows mouse on floor plane
- [ ] Release far from hole - cube stays there
- [ ] Drag near hole (< 0.5 units) - cube snaps
- [ ] Snapped cube turns green
- [ ] Snapped cube locks at hole position
- [ ] Locked cube doesn't drift

### Completion
- [ ] All 4 cubes locked - hole starts sealing
- [ ] Hole shrinks over 1 second
- [ ] "SEGMENT REPAIRED" message appears
- [ ] Memory stays at 0%
- [ ] Phase 3 starts after 0.5 seconds

---

## Phase 4: Simon Pattern (45-90 seconds)

### Visual Elements
- [ ] Secondary core appears on wall
- [ ] Purple glitchy halo around core
- [ ] 5 colored orbs in semi-circle
- [ ] Colors: red, blue, green, yellow, purple
- [ ] "LOGIC CORE UNSTABLE. REPEAT PATTERN." appears

### Pattern Playback
- [ ] After 1 second, pattern plays
- [ ] Orbs flash in sequence
- [ ] Each flash lasts ~600ms
- [ ] Gap between flashes ~200ms
- [ ] Musical tone plays with each flash
- [ ] Cannot click during playback

### Player Input
- [ ] After playback, can click orbs
- [ ] Click plays tone
- [ ] Correct click - continue
- [ ] Wrong click - red screen flash
- [ ] Wrong click - memory spikes +5%
- [ ] Wrong click - glitch noise plays
- [ ] Wrong click - pattern replays after 1s

### Completion
- [ ] All correct - orbs turn cyan
- [ ] Halo disappears
- [ ] Success chime plays
- [ ] Memory drops by 10%
- [ ] "LOGIC CORE STABILIZED" appears
- [ ] Phase 4 starts after 1.5 seconds

---

## Phase 5: Rotate & Align (90-180 seconds)

### Visual Elements
- [ ] 3 cyan blocks appear at different heights
- [ ] Blocks have glowing edge lines
- [ ] Blocks jitter/shake continuously
- [ ] White wireframe ghosts show targets
- [ ] "MEMORY BLOCKS MISALIGNED. CORRECT ORIENTATION." appears

### Rotation Mechanic
- [ ] Click block - can rotate it
- [ ] Block emissive brightens when rotating
- [ ] Drag mouse - block rotates
- [ ] Horizontal drag - Y axis rotation
- [ ] Vertical drag - X axis rotation
- [ ] Rotation is smooth and responsive

### Alignment
- [ ] Release near target - block snaps
- [ ] Snap sound plays (D5 note)
- [ ] Block stops jittering
- [ ] Edge lines disappear
- [ ] Ghost outline disappears
- [ ] Release far from target - keep trying

### Completion
- [ ] All 3 blocks aligned
- [ ] Blocks slide toward core center
- [ ] Blocks shrink and disappear
- [ ] Success sound plays (E5 note)
- [ ] Memory drops by 15%
- [ ] "MEMORY BLOCKS ALIGNED" appears
- [ ] Phase 5 starts after 0.5 seconds

---

## Phase 6: RAM Overflow Finale (180-360 seconds)

### Core Transformation
- [ ] Core turns red
- [ ] Core pulses violently
- [ ] Core shakes/vibrates
- [ ] Rings spin faster
- [ ] "CRITICAL MEMORY LEAK. STABILIZE CORE." appears

### RAM Block Spawning
- [ ] Small yellow blocks spawn every 1.5s
- [ ] Blocks eject from core
- [ ] Blocks land on floor
- [ ] Max 30 blocks on floor
- [ ] Eject sound plays (200 Hz)

### Core Slots
- [ ] 10 green wireframe slots around core
- [ ] Slots at varying heights
- [ ] Slots clearly visible

### Memory Increase
- [ ] Memory increases ~2% per second
- [ ] Memory bar fills continuously
- [ ] Bar color changes: green → yellow → red

### Drag Mechanic
- [ ] Click RAM block - can drag it
- [ ] Block turns yellow while dragging
- [ ] Drag to slot - block snaps when close
- [ ] Snapped block turns green
- [ ] Insert sound plays (440 Hz)
- [ ] Each insert reduces memory rate

### Block Duplication
- [ ] At 70% memory, blocks start duplicating
- [ ] Duplicates appear every 2 seconds
- [ ] Duplicates spawn near existing blocks
- [ ] Max 30 blocks enforced

### Critical State (70%+)
- [ ] Vignette appears at edges
- [ ] Vignette darkens as memory increases
- [ ] At 95%, "CRITICAL MEMORY LEAK" warning

### Stabilization
- [ ] Enough blocks inserted - rate hits 0
- [ ] Memory stops increasing
- [ ] Memory starts decreasing
- [ ] Core stops ejecting blocks
- [ ] Duplicate blocks dissolve
- [ ] Core turns blue
- [ ] Core pulse calms
- [ ] Calm resolution sound plays
- [ ] Vignette fades away

### Completion
- [ ] Memory drops to safe level (~15%)
- [ ] "MEMORY STABILIZED" overlay appears
- [ ] "EXIT UNLOCKED" subtitle
- [ ] Exit door appears on wall
- [ ] Transition to complete phase

---

## Phase 7: Exit (360+ seconds)

### Exit Door
- [ ] Door visible on wall
- [ ] Glowing cyan outline
- [ ] 50 particles around door
- [ ] Door pulses gently
- [ ] Particles drift upward

### Interaction
- [ ] Click door - exit triggered
- [ ] Success fanfare plays (C5→E5→G5)
- [ ] 800ms delay before navigation

### Navigation
- [ ] Room marked as complete in game state
- [ ] Returns to hallway
- [ ] No errors in console

---

## Edge Cases & Stress Tests

### Rapid Clicking
- [ ] Phase 1: Rapid click/release doesn't break
- [ ] Phase 2: Rapid drag doesn't cause errors
- [ ] Phase 3: Rapid orb clicks handled correctly
- [ ] Phase 4: Rapid rotation doesn't glitch
- [ ] Phase 5: Rapid RAM drag works smoothly

### Memory Bounds
- [ ] Memory never goes below 0%
- [ ] Memory never exceeds 100%
- [ ] Memory bar displays correctly at all values

### Phase Transitions
- [ ] All transitions are smooth
- [ ] No visual glitches between phases
- [ ] No audio overlap issues
- [ ] State resets properly

### Performance
- [ ] FPS stays at or near 60
- [ ] No frame drops during particle effects
- [ ] No lag during Phase 5 with 30 blocks
- [ ] Smooth throughout entire playthrough

---

## Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Audio plays correctly
- [ ] Performance is good

### Firefox
- [ ] All features work
- [ ] Audio plays correctly
- [ ] Performance is good

### Safari
- [ ] All features work
- [ ] Audio plays correctly
- [ ] Performance is good

### Edge
- [ ] All features work
- [ ] Audio plays correctly
- [ ] Performance is good

---

## Screen Sizes

### Desktop (1920x1080)
- [ ] Scene renders correctly
- [ ] HUD positioned properly
- [ ] Text readable
- [ ] Interactions work

### Laptop (1366x768)
- [ ] Scene renders correctly
- [ ] HUD positioned properly
- [ ] Text readable
- [ ] Interactions work

### Tablet (768x1024)
- [ ] Scene renders correctly
- [ ] HUD positioned properly
- [ ] Text readable
- [ ] Touch interactions work (if applicable)

---

## Accessibility

### Visual
- [ ] Colors are distinct
- [ ] Text is readable
- [ ] Contrast is sufficient
- [ ] Colorblind-friendly (mostly)

### Audio
- [ ] Audio enhances but not required
- [ ] Visual feedback for all audio cues
- [ ] Can complete without sound

---

## Performance Metrics

### Target Metrics
- [ ] 60 FPS maintained
- [ ] < 100MB memory usage
- [ ] < 1 second load time
- [ ] No memory leaks (ironic!)

### Actual Metrics
- FPS: _____ (target: 60)
- Memory: _____ MB (target: < 100)
- Load time: _____ s (target: < 1)
- Completion time: _____ min (expected: 5-8)

---

## Bug Report Template

If you find issues, document them:

```
**Bug**: [Brief description]
**Phase**: [Which phase]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Frequency**: [Always/Sometimes/Rare]
**Severity**: [Critical/High/Medium/Low]
**Browser**: [Chrome/Firefox/Safari/Edge]
**Console Errors**: [Any errors]
```

---

## Sign-Off

### Tester Information
- **Name**: _______________
- **Date**: _______________
- **Browser**: _______________
- **OS**: _______________

### Results
- **Total Tests**: _____
- **Passed**: _____
- **Failed**: _____
- **Blocked**: _____

### Overall Assessment
- [ ] Ready to ship
- [ ] Needs minor fixes
- [ ] Needs major fixes
- [ ] Not ready

### Notes
```
[Additional observations, suggestions, or comments]
```

---

## Quick Test (5 minutes)

For rapid verification:

1. [ ] Load room - no errors
2. [ ] Phase 1 - seal crack
3. [ ] Phase 2 - drag 1 component
4. [ ] Phase 3 - complete pattern
5. [ ] Phase 4 - align 1 block
6. [ ] Phase 5 - insert 5 RAM blocks
7. [ ] Exit - click door
8. [ ] Return to hallway

If all pass: ✅ Basic functionality works
If any fail: ❌ Needs investigation

---

## Full Test (30 minutes)

Complete all sections above for comprehensive validation.

**Good luck testing!** 🧪✨
