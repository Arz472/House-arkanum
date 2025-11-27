# Loop Room - Circular Patrol with Dynamic Lighting

## Updated Mechanic Overview

The ghost now follows a **smooth circular patrol path** that passes through all three lantern safe zones. The ghost's visibility changes dramatically based on proximity to lanterns:

- **Outside lanterns**: Ghost is **completely dark** (almost invisible)
- **Inside lanterns**: Ghost is **bright and glowing** (clearly visible)

## Circular Patrol Path

### Path Visualization (Top-Down)
```
                    BACK
         🕯️                    🕯️
       Lantern 1            Lantern 2
       (-10, -10)           (10, -10)
           ╲                    ╱
            ╲                  ╱
             ╲    ⭕ Center   ╱
              ╲   (0, -5)   ╱
               ╲           ╱
                ╲         ╱
                 ╲       ╱
                  ╲     ╱
                   ╲   ╱
                    ╲ ╱
                     🕯️
                  Lantern 3
                   (0, 8)
                   
         Ghost Path: ⟲ (Circular)
         Radius: 10 units
         Speed: 0.3 rad/sec (~17 sec per loop)
```

### Path Details
- **Center**: (0, 0, -5)
- **Radius**: 10 units
- **Speed**: 0.3 radians/second
- **Full Loop Time**: ~21 seconds
- **Direction**: Counter-clockwise

### Lantern Coverage
Each lantern has a 4-unit safe zone radius:
- Ghost enters **Lantern 1** zone at ~3 seconds
- Ghost enters **Lantern 2** zone at ~10 seconds  
- Ghost enters **Lantern 3** zone at ~17 seconds
- Total vulnerability time: ~40% of patrol

## Dynamic Lighting System

### Ghost Appearance States

#### 🌑 DARK (Outside Lanterns)
```
Ghost Properties:
- Emissive: #000000 (black)
- Opacity: 0.3 (barely visible)
- Light Intensity: 5
- Light Color: #001111 (very dark blue)

Visual Effect:
- Ghost is almost invisible
- Only a faint silhouette
- Hard to track in darkness
- Creates tension
```

#### 🔆 BRIGHT (Inside Lanterns)
```
Ghost Properties:
- Emissive: #ffaa00 (warm orange)
- Opacity: 1.0 (fully visible)
- Light Intensity: 80
- Light Color: #ffaa00 (bright orange)

Visual Effect:
- Ghost is clearly visible
- Warm glow illuminates it
- Easy to see and click
- Vulnerability is obvious
```

### Transition Behavior
The lighting changes **instantly** when ghost crosses lantern boundary:
- No fade transition (clear feedback)
- Immediate visual cue for vulnerability
- Makes timing windows obvious

## Gameplay Flow

### 1. Observation Phase
```
Player spawns → Ghost is dark → Track movement
                    ↓
            Ghost enters lantern zone
                    ↓
            Ghost becomes BRIGHT ✨
```

### 2. Attack Window
```
Ghost in lantern → BRIGHT & vulnerable
                        ↓
                   Click ghost!
                        ↓
              Correct hit registered
                        ↓
            Ghost continues patrol
```

### 3. Timing Challenge
```
Ghost exits lantern → Becomes DARK again
                           ↓
                  Wait for next zone
                           ↓
                Ghost enters next lantern
                           ↓
                    BRIGHT again!
```

## Strategic Implications

### For Players:

**Advantages of Circular Path:**
- ✅ Predictable movement (easier to anticipate)
- ✅ Regular vulnerability windows (every ~7 seconds)
- ✅ Can position yourself optimally
- ✅ Clear visual feedback (dark vs bright)

**Challenges:**
- ⚠️ Must track ghost in darkness between lanterns
- ⚠️ Limited time window in each lantern zone (~3 seconds)
- ⚠️ Ghost is hard to see when dark (creates tension)
- ⚠️ Must be ready when ghost enters light

### Optimal Strategy:

1. **Position centrally** - See all three lanterns
2. **Track the dark ghost** - Follow its silhouette
3. **Anticipate entry** - Know which lantern is next
4. **Click immediately** - When ghost lights up
5. **Don't panic click** - Wait for brightness

## Visual Comparison

### Before (Random Waypoints)
```
Ghost movement: Unpredictable
Visibility: Always glowing cyan
Difficulty: Hard to predict position
Strategy: Chase and click
```

### After (Circular Patrol)
```
Ghost movement: Smooth circle
Visibility: Dark → Bright → Dark
Difficulty: Timing-based challenge
Strategy: Wait and strike
```

## Technical Details

### Circular Motion Math
```typescript
const patrolRadius = 10;
const patrolSpeed = 0.3; // radians per second
const angle = time * patrolSpeed;

// Position on circle
const x = centerX + Math.cos(angle) * patrolRadius;
const z = centerZ + Math.sin(angle) * patrolRadius;

// Direction (tangent to circle)
const tangentX = -Math.sin(angle);
const tangentZ = Math.cos(angle);
```

### Lighting Logic
```typescript
if (isNearLantern) {
  // BRIGHT
  material.emissive = new THREE.Color(0xffaa00).multiplyScalar(1.5);
  material.opacity = 1;
  light.intensity = 80;
  light.color.setHex(0xffaa00);
} else {
  // DARK
  material.emissive = new THREE.Color(0x000000);
  material.opacity = 0.3;
  light.intensity = 5;
  light.color.setHex(0x001111);
}
```

### Proximity Check (Every Frame)
```typescript
for (const lanternPos of lanternPositions) {
  const distance = ghostPosition.distanceTo(lanternPos);
  if (distance <= 4) { // lanternRadius
    isNearLantern = true;
    break;
  }
}
```

## Timing Breakdown

### Full Patrol Cycle (~21 seconds)
```
Time    Position        Lantern     State
────────────────────────────────────────────
0s      Right (10,-5)   None        DARK
3s      Right Back      Lantern 2   BRIGHT ✨
6s      Back (0,-15)    None        DARK
10s     Left Back       Lantern 1   BRIGHT ✨
13s     Left (-10,-5)   None        DARK
17s     Front (0,5)     Lantern 3   BRIGHT ✨
20s     Right (10,-5)   None        DARK
21s     [Loop repeats]
```

### Vulnerability Windows
- **3 windows per loop** (one per lantern)
- **~3 seconds each** (time in safe zone)
- **~7 seconds between** (time in darkness)
- **Total: ~9 seconds vulnerable** out of 21 seconds (~43%)

## Player Experience

### Tension Building
1. **Darkness Phase**: Ghost is barely visible, creates unease
2. **Anticipation**: Knowing ghost will enter light soon
3. **Opportunity**: Ghost lights up, clear shot available
4. **Pressure**: Limited time to click before darkness returns

### Skill Expression
- **Tracking**: Following dark ghost between lanterns
- **Timing**: Clicking during brief bright windows
- **Positioning**: Standing where you can see multiple lanterns
- **Patience**: Not panic-clicking in darkness

## Balance Notes

### Current Settings (Good Balance)
- Patrol Speed: 0.3 rad/sec (not too fast, not too slow)
- Lantern Radius: 4 units (generous safe zones)
- Dark Opacity: 0.3 (visible but challenging)
- Bright Intensity: 80 (very obvious)

### Tuning Options

**Make Easier:**
- Increase patrol speed (0.3 → 0.4) - more frequent windows
- Increase lantern radius (4 → 5) - longer vulnerability
- Increase dark opacity (0.3 → 0.5) - easier to track

**Make Harder:**
- Decrease patrol speed (0.3 → 0.2) - longer waits
- Decrease lantern radius (4 → 3) - shorter windows
- Decrease dark opacity (0.3 → 0.1) - harder to track

## Comparison to Null Candles Room

### Similarities:
- Both use light-based vulnerability
- Both have visual indicators (glow/brightness)
- Both require timing and observation

### Differences:
| Aspect | Loop Room | Null Candles |
|--------|-----------|--------------|
| Light Source | 3 static lanterns | 1 mobile flame orb |
| Ghost Movement | Circular patrol | Random patrol |
| Visibility | Dark/Bright toggle | Always visible |
| Strategy | Wait for light | Track proximity |
| Difficulty | Timing-based | Spatial-based |

## Testing Checklist

Verify these behaviors:
- [ ] Ghost follows smooth circular path
- [ ] Ghost is **very dark** outside lanterns (opacity 0.3)
- [ ] Ghost is **bright orange** inside lanterns
- [ ] Light intensity changes (5 → 80)
- [ ] Transition is instant (no fade)
- [ ] Ghost enters all 3 lantern zones
- [ ] Patrol takes ~21 seconds per loop
- [ ] Ghost faces direction of movement
- [ ] Correct clicks only work when bright
- [ ] Wrong clicks trigger when dark
- [ ] Health bars update correctly

## Visual Effects Summary

### Ghost States
```
DARK (Invulnerable):
  👻 ← Barely visible silhouette
  Color: Black (#000000)
  Opacity: 30%
  Light: 5 intensity, dark blue

BRIGHT (Vulnerable):
  ✨👻✨ ← Glowing orange
  Color: Orange (#ffaa00)
  Opacity: 100%
  Light: 80 intensity, bright orange
```

### Player Feedback
- **Visual**: Instant brightness change
- **Spatial**: Yellow sphere indicator
- **UI**: Health bars show progress
- **Audio**: Existing ghost radio ambience
