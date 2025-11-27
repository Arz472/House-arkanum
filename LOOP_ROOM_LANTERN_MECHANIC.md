# Loop Room - Lantern Safe Zone Mechanic

## Overview
The Loop Room features a lantern safe zone mechanic where the ghost can only be banished when it's near one of three lanterns placed around the graveyard.

## Core Mechanic

### Win Condition
- Land **3 correct hits** on the ghost (when it's near a lantern)
- Ghost is banished, loop is broken

### Lose Condition
- Make **5 wrong hits** (clicking ghost when NOT near a lantern)
- Sanity depleted, you fail

## Game Elements

### 1. Three Lanterns
Strategically placed around the ghost's patrol path:
- **Left Back**: (-10, 0, -10)
- **Right Back**: (10, 0, -10)
- **Front Center**: (0, 0, 8)

Each lantern has:
- Wooden post (2 units tall)
- Glowing lantern top with flame
- Warm orange light (radius: 8 units)
- **Safe zone ring** on ground (4 unit radius, yellow)

### 2. Ghost Patrol
- Ghost moves through waypoints around the graveyard
- Patrol path passes near all three lanterns
- Ghost is vulnerable ~30-40% of the time (when near lanterns)

### 3. Vulnerability System
**Ghost is VULNERABLE when:**
- Within 4 units of any lantern
- Yellow sphere appears around ghost
- Ghost material glows warm orange
- Safe zone ring lights up brighter

**Ghost is INVULNERABLE when:**
- Outside all lantern safe zones
- Normal cyan/blue glow
- No vulnerability indicator

## Click Mechanics

### ✅ Correct Click (Ghost Near Lantern)
**Effects:**
- Ghost takes damage (banish progress +1)
- White flash effect
- Ghost teleports to new location
- Banish progress bar updates (green)
- Ghost becomes visually weaker (less glow)

**After 3 Correct Hits:**
- Death animation plays (3 seconds)
- Victory screen appears
- "Loop Broken! The lanterns held the light."

### ❌ Wrong Click (Ghost Away from Lantern)
**Effects:**
- Red flicker overlay (500ms)
- Screen glitch intensifies
- Stability bar decreases (red)
- Ghost grows slightly stronger
- No teleport (ghost continues patrol)

**After 5 Wrong Hits:**
- Failure screen appears
- "The loop consumes you. Darkness prevails."

## UI Elements

### Health Bars (Top Center)
```
┌─────────────────────────────┐
│    Banish Progress          │
│    ▓▓▓ □□                   │ ← 3 squares (green)
│                             │
│    Stability                │
│    □□□□□                    │ ← 5 squares (red when filled)
│                             │
│  Click ghost near lanterns! │
└─────────────────────────────┘
```

**Banish Progress (Green):**
- 3 squares total
- Fills with each correct hit
- 0/3 → 1/3 → 2/3 → 3/3 (Victory!)

**Stability (Red):**
- 5 squares total
- Fills with each wrong hit
- 0/5 → 1/5 → ... → 5/5 (Failure!)

## Visual Feedback

### Lantern Glow States
**Normal State:**
- Steady warm glow
- Yellow ring visible on ground
- Light radius: 8 units

**Ghost Near State:**
- Brighter glow
- Safe zone fills with yellow light
- Pulsing effect

### Ghost Visual States
**Normal (Invulnerable):**
- Cyan/blue ethereal glow
- Standard size (1.5 scale)
- Spectral appearance

**Vulnerable (Near Lantern):**
- Warm orange glow
- Yellow sphere indicator
- Slightly more solid appearance

**Weakening (After Hits):**
- Glow intensity decreases 33% per hit
- Becomes more transparent
- Less threatening appearance

**Strengthening (After Misses):**
- Glitch effect intensifies
- Slightly larger scale
- More aggressive movement

## Strategy Tips

### For Players:
1. **Track the patrol pattern** - Ghost follows predictable waypoints
2. **Wait for vulnerability** - Don't panic-click
3. **Watch for yellow indicator** - Only click when sphere appears
4. **Position yourself** - Stay where you can see both ghost and lanterns
5. **Count your hits** - 3 correct needed, 5 mistakes allowed

### Optimal Play:
- Wait near center of room for good visibility
- Track which lantern ghost is approaching
- Click immediately when yellow indicator appears
- Ghost teleports after correct hit, so be ready to track again

## Technical Details

### Distance Calculation
```typescript
// Check if ghost is near any lantern
for (const lanternPos of lanternPositions) {
  const distance = ghostPosition.distanceTo(lanternPos);
  if (distance <= 4) { // lanternRadius
    isVulnerable = true;
    break;
  }
}
```

### State Variables
```typescript
const [correctHits, setCorrectHits] = useState(0);  // 0 → 3
const [wrongHits, setWrongHits] = useState(0);      // 0 → 5
const [isNearLantern, setIsNearLantern] = useState(false);
```

### Click Handler Logic
```typescript
function handleGhostClick() {
  if (isNearLantern) {
    // Correct hit
    correctHits++;
    if (correctHits >= 3) {
      victory();
    }
  } else {
    // Wrong hit
    wrongHits++;
    triggerFlicker();
    if (wrongHits >= 5) {
      failure();
    }
  }
}
```

## Difficulty Balance

### Current Settings:
- **Lantern Radius**: 4 units (moderate coverage)
- **Lantern Count**: 3 (good coverage of patrol path)
- **Correct Hits Needed**: 3 (reasonable challenge)
- **Wrong Hits Allowed**: 5 (forgiving but not too easy)
- **Ghost Speed**: 2.5 units/sec (trackable)

### Tuning Options:
**Make Easier:**
- Increase lantern radius (4 → 5)
- Add more lanterns (3 → 4)
- Increase wrong hits allowed (5 → 7)

**Make Harder:**
- Decrease lantern radius (4 → 3)
- Reduce lanterns (3 → 2)
- Decrease wrong hits allowed (5 → 3)
- Increase ghost speed

## Comparison to Other Rooms

### vs. Null Candles Room (Light Radius):
- **Similar**: Both use light-based vulnerability
- **Different**: 
  - Loop Room has multiple static light sources
  - Null Candles has single mobile light source
  - Loop Room is more forgiving (5 mistakes vs ~5)

### vs. Original Loop Room:
- **Before**: Simple click counter (3 clicks to win)
- **After**: Strategic timing required (click only near lanterns)
- **Improvement**: More engaging, requires observation and timing

## Testing Checklist

When testing, verify:
- [ ] 3 lanterns visible in scene
- [ ] Yellow rings visible on ground
- [ ] Ghost patrols through lantern zones
- [ ] Yellow sphere appears when ghost enters zone
- [ ] Correct clicks increase banish progress
- [ ] Wrong clicks increase stability loss
- [ ] Flicker effect on wrong clicks
- [ ] Victory after 3 correct hits
- [ ] Failure after 5 wrong hits
- [ ] Health bars update correctly
- [ ] Ghost teleports after correct hits
- [ ] Death animation plays on victory

## Known Behaviors

1. **Ghost Teleport**: After correct hit, ghost teleports to random waypoint (may or may not be near a lantern)

2. **Patrol Timing**: Ghost spends roughly 30-40% of time in lantern zones, giving regular opportunities

3. **Visual Priority**: Lantern glow and safe zones are always visible, even in fog

4. **Jump Scare**: Original 10-second jump scare still occurs if player doesn't engage

5. **Glitch Effect**: Proximity-based glitch effect still active (intensifies when ghost is close)

## Future Enhancements (Optional)

1. **Sound Effects**: 
   - Chime when ghost enters safe zone
   - Bell toll on correct hit
   - Crack/shatter on wrong hit

2. **Particle Effects**:
   - Sparks from lanterns on correct hit
   - Dark smoke on wrong hit

3. **Dynamic Difficulty**:
   - Lantern radius shrinks with each correct hit
   - Ghost speed increases with each wrong hit

4. **Combo System**:
   - Bonus for consecutive correct hits
   - Penalty for consecutive wrong hits

5. **Multiple Ghosts**:
   - Add second ghost at higher difficulty
   - Must banish both (6 correct hits total)
