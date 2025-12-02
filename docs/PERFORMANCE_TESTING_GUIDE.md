# Performance Testing Guide

## How to Measure Performance Improvements

### 1. Enable FPS Counter

Add this to your browser console while testing:

```javascript
// Simple FPS counter
let lastTime = performance.now();
let frames = 0;
let fps = 0;

function measureFPS() {
  frames++;
  const currentTime = performance.now();
  if (currentTime >= lastTime + 1000) {
    fps = Math.round((frames * 1000) / (currentTime - lastTime));
    console.log(`FPS: ${fps}`);
    frames = 0;
    lastTime = currentTime;
  }
  requestAnimationFrame(measureFPS);
}
measureFPS();
```

### 2. Chrome DevTools Performance Profiling

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to "Performance" tab
3. Click "Record" (circle icon)
4. Perform the action you want to test (e.g., hover over doors, play Phase 2)
5. Click "Stop" after 5-10 seconds
6. Analyze the flame graph

**What to Look For:**
- **Scripting (yellow):** Should be minimal during animations
- **Rendering (purple):** Should be consistent, not spiking
- **Painting (green):** Should be low
- **Long tasks (red bars):** Should be eliminated

### 3. React DevTools Profiler

**Steps:**
1. Install React DevTools extension
2. Open DevTools → "Profiler" tab
3. Click "Record"
4. Perform actions
5. Stop recording

**What to Look For:**
- **Render frequency:** Should be low during animations
- **Render duration:** Should be under 16ms (60 FPS)
- **Unnecessary re-renders:** Components that render without prop changes

### 4. Memory Profiling

**Steps:**
1. Open Chrome DevTools → "Memory" tab
2. Take a "Heap snapshot"
3. Play through a scene
4. Take another snapshot
5. Compare snapshots

**What to Look For:**
- **Detached DOM nodes:** Should be 0 after leaving a scene
- **Growing arrays:** Indicates potential memory leaks
- **Retained objects:** Three.js geometries/materials should be disposed

---

## Test Scenarios

### Scenario 1: Hallway Door Hover (Fixed ✅)

**Before Optimization:**
- Hover over each door rapidly
- Expected: FPS drops, lag, memory spikes

**After Optimization:**
- Hover over each door rapidly
- Expected: Smooth 60 FPS, no lag, stable memory

**How to Test:**
1. Navigate to Hallway (`/`)
2. Enable FPS counter
3. Move mouse rapidly over all 5 doors
4. Record FPS (should stay 55-60 FPS)

---

### Scenario 2: Memory Leak Room Phase 2 Drift (Needs Fix)

**Before Optimization:**
- Phase 2 blocks drift
- Expected: 60 state updates/second, FPS drops to 40-50

**After Optimization:**
- Phase 2 blocks drift smoothly
- Expected: 0 state updates, 60 FPS maintained

**How to Test:**
1. Navigate to Memory Leak Room (`/room/leak`)
2. Complete Phase 1 (seal cracks)
3. Enter Phase 2
4. Open React DevTools Profiler
5. Record for 10 seconds
6. Check render count (should be minimal, not 600+)

---

### Scenario 3: Memory Leak Room Phase 5 RAM Overflow

**Stress Test:**
- 20 RAM blocks spawning
- Memory bar updating
- Core pulsing
- Particles animating

**How to Test:**
1. Navigate to Phase 5 (complete Phases 1-4)
2. Enable FPS counter
3. Let memory reach 70% (accelerated spawning)
4. Record FPS (should stay above 45 FPS)
5. Clear blocks and verify FPS recovers

---

## Performance Targets

### Target FPS by Scene:

| Scene | Minimum FPS | Target FPS | Notes |
|-------|-------------|------------|-------|
| Hallway | 55 | 60 | With door hover |
| Loop Room | 50 | 60 | With ghost patrol |
| Null Candles | 55 | 60 | Static scene |
| 404 Room | 55 | 60 | Vertical layout |
| Memory Leak Phase 1-3 | 55 | 60 | Moderate complexity |
| Memory Leak Phase 5 | 45 | 55 | High particle count |
| Mirror Room | 50 | 60 | Reflection effects |
| Commit Altar | 55 | 60 | Static scene |

### Memory Targets:

- **Initial Load:** < 150 MB
- **Peak Usage:** < 300 MB
- **After Scene Exit:** Return to within 20 MB of initial
- **No Memory Leaks:** Heap size should stabilize after 5 minutes

---

## Automated Performance Test (Optional)

Create a test file to measure performance programmatically:

```typescript
// lib/performanceTest.ts
export function measureRenderTime(callback: () => void, iterations = 100) {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    callback();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);
  
  console.log(`Avg: ${avg.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
  
  return { avg, max, min };
}
```

---

## Regression Testing

After each optimization, verify:

1. ✅ All rooms still load correctly
2. ✅ All interactions work (click, drag, hover)
3. ✅ All animations play smoothly
4. ✅ No visual glitches or artifacts
5. ✅ Audio plays correctly
6. ✅ Navigation works between scenes
7. ✅ Game state persists correctly

---

## Performance Monitoring in Production

Consider adding a simple FPS monitor component:

```typescript
// components/ui/FPSMonitor.tsx
'use client';

import { useEffect, useState } from 'react';

export default function FPSMonitor() {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    function measure() {
      frames++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measure);
    }
    
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, []);
  
  const color = fps >= 55 ? 'text-green-400' : fps >= 40 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className={`fixed top-2 right-2 font-mono text-sm ${color} bg-black bg-opacity-70 px-2 py-1 rounded z-50`}>
      {fps} FPS
    </div>
  );
}
```

Add to `app/layout.tsx` during development:
```typescript
{process.env.NODE_ENV === 'development' && <FPSMonitor />}
```

---

## Troubleshooting Performance Issues

### Issue: FPS drops during specific animation

**Solution:**
1. Profile with Chrome DevTools
2. Identify the expensive function in flame graph
3. Check for:
   - State updates in useFrame
   - Object creation in loops
   - Unnecessary re-renders

### Issue: Memory keeps growing

**Solution:**
1. Take heap snapshots before/after scene
2. Look for detached DOM nodes
3. Check for:
   - Undisposed Three.js objects
   - Uncancelled intervals/timeouts
   - Event listeners not removed

### Issue: Stuttering/jank during gameplay

**Solution:**
1. Check for synchronous operations blocking main thread
2. Look for:
   - Large array operations
   - Heavy calculations in render
   - Blocking API calls

---

## Benchmark Results Template

Record your results here:

```
Date: ___________
Browser: Chrome/Firefox/Safari
Hardware: _____________

Hallway Scene:
- Idle FPS: ___
- Door Hover FPS: ___
- Memory Usage: ___ MB

Memory Leak Room:
- Phase 1 FPS: ___
- Phase 2 FPS: ___
- Phase 5 FPS: ___
- Peak Memory: ___ MB

Notes:
_______________________
```
