# Loop Room - Final Updates

## Changes Made

### 1. ✅ Ghost Fade Out on Victory (3rd Correct Hit)

**Before:**
- Ghost would play death animation and disappear instantly
- Abrupt transition to victory screen

**After:**
- Ghost **fades out smoothly** over 2 seconds
- Continues circular patrol while fading
- Opacity decreases: 100% → 0%
- Emissive glow fades with opacity
- Light intensity fades proportionally
- Creates elegant, satisfying victory moment

**Technical Details:**
```typescript
// 2 second fade out
fadeOutTimer += delta;
const fadeProgress = Math.min(fadeOutTimer / 2, 1);
const opacity = 1 - fadeProgress;

// Apply to material
material.opacity = opacity;
material.emissive = color.multiplyScalar(opacity);

// Apply to light
light.intensity = 80 * opacity;
```

### 2. ✅ Repeating Jumpscare Every 10 Seconds

**Before:**
- Jumpscare triggered once at 10 seconds
- Never repeated
- Used `jumpScareTriggered` flag to prevent repeats

**After:**
- Jumpscare **repeats every 10 seconds**
- Continues until player gets 3 correct hits
- Tracks last jumpscare time instead of boolean flag
- Creates ongoing pressure and tension

**Technical Details:**
```typescript
// Check if 10 seconds have passed since last jumpscare
if (time - lastJumpScareTime >= 10 && correctHits < 3) {
  lastJumpScareTime = time;
  triggerJumpscare();
}
```

**Jumpscare Timeline:**
```
0s   → Game starts
10s  → 1st jumpscare 🎃
20s  → 2nd jumpscare 🎃
30s  → 3rd jumpscare 🎃
40s  → 4th jumpscare 🎃
...continues until victory
```

## Visual Flow

### Victory Sequence (3rd Correct Hit)
```
Player clicks ghost (3rd time)
         ↓
Ghost starts fading
         ↓
[0.0s] Opacity: 100% (fully visible)
[0.5s] Opacity: 75%  (fading)
[1.0s] Opacity: 50%  (half transparent)
[1.5s] Opacity: 25%  (almost gone)
[2.0s] Opacity: 0%   (invisible)
         ↓
Victory screen appears
```

### Jumpscare Cycle
```
Time: 0s
  ↓
Player explores, tracks ghost
  ↓
Time: 10s → JUMPSCARE! 👻
  ↓ (4 second animation)
Time: 14s → Back to normal
  ↓
Player continues hunting
  ↓
Time: 20s → JUMPSCARE! 👻
  ↓ (4 second animation)
Time: 24s → Back to normal
  ↓
[Repeats every 10 seconds]
```

## Gameplay Impact

### Fade Out Effect:
**Benefits:**
- ✅ More satisfying victory moment
- ✅ Clear visual feedback of success
- ✅ Elegant transition (not abrupt)
- ✅ Ghost "dissolves" thematically
- ✅ Maintains circular motion (looks natural)

**Player Experience:**
- Feels rewarding and polished
- Clear indication that ghost is defeated
- Time to appreciate the victory before UI appears

### Repeating Jumpscare:
**Benefits:**
- ✅ Maintains tension throughout encounter
- ✅ Punishes slow/cautious players
- ✅ Creates urgency to complete objective
- ✅ More horror atmosphere
- ✅ Prevents camping/waiting strategies

**Player Experience:**
- Must balance caution with speed
- Can't just wait forever for perfect shots
- Jumpscares become expected but still startling
- Adds time pressure without explicit timer

## State Variables Added

```typescript
// For fade out
const [isFadingOut, setIsFadingOut] = useState(false);
const fadeOutTimer = useRef<number>(0);

// For repeating jumpscare
const lastJumpScareTime = useRef<number>(0);
// Removed: jumpScareTriggered (no longer needed)
```

## Timing Summary

### Victory Fade Out:
- **Duration**: 2 seconds
- **Start**: Immediately on 3rd correct hit
- **End**: Ghost fully invisible
- **Victory Screen**: Appears after fade completes

### Jumpscare Intervals:
- **First**: 10 seconds after game start
- **Repeat**: Every 10 seconds
- **Duration**: 4 seconds each (2s full intensity, 2s fade)
- **Stops**: When correctHits >= 3

## Testing Checklist

Verify these behaviors:
- [ ] Ghost fades out smoothly on 3rd correct hit
- [ ] Fade takes exactly 2 seconds
- [ ] Ghost continues circular motion while fading
- [ ] Light intensity fades with ghost
- [ ] Victory screen appears after fade completes
- [ ] First jumpscare at 10 seconds
- [ ] Second jumpscare at 20 seconds
- [ ] Third jumpscare at 30 seconds
- [ ] Jumpscares continue every 10 seconds
- [ ] Jumpscares stop after 3rd correct hit
- [ ] Jumpscare animation plays fully each time

## Balance Considerations

### Fade Out Duration (2 seconds):
- **Too Fast** (< 1s): Feels rushed, less satisfying
- **Current** (2s): Smooth, elegant, satisfying
- **Too Slow** (> 3s): Player waits too long

### Jumpscare Interval (10 seconds):
- **Too Frequent** (< 8s): Annoying, loses impact
- **Current** (10s): Good pressure, still scary
- **Too Rare** (> 15s): Not enough tension

## Code Quality

### Improvements Made:
- ✅ Removed unused `jumpScareTriggered` boolean
- ✅ Added proper fade out state management
- ✅ Cleaner jumpscare timing logic
- ✅ Maintains circular patrol during fade
- ✅ Proper opacity and emissive scaling

### Performance:
- No additional overhead
- Fade calculations are simple linear interpolation
- Time-based checks are efficient

## Player Strategy Impact

### Before Updates:
- Take your time, no rush
- One jumpscare to deal with
- Victory is instant

### After Updates:
- Must work efficiently (10s intervals)
- Multiple jumpscares create pressure
- Victory feels earned and satisfying

## Comparison to Other Rooms

### Null Candles Room:
- Instant failure on wrong action
- No repeating threats
- Binary outcome

### Loop Room (Updated):
- Repeating jumpscares create ongoing tension
- Smooth fade out on victory
- More forgiving but time-pressured

## Future Enhancement Ideas

1. **Fade Speed Based on Performance**:
   - Faster fade if no wrong hits
   - Slower fade if many mistakes

2. **Jumpscare Intensity Scaling**:
   - Each jumpscare gets slightly more intense
   - Ghost gets closer each time

3. **Victory Particle Effects**:
   - Sparkles during fade out
   - Light particles rising up

4. **Sound Design**:
   - Fading ghost whisper during fade out
   - Escalating music with each jumpscare

5. **Combo Bonus**:
   - Faster fade if all 3 hits were consecutive
   - Special effect for perfect run
