# Null Candles Room - Fixes Applied

## Issues Fixed

### 1. Health Bar Display
**Problem:** Generic "Ghost Vulnerability" text appearing in Candle Room

**Root Cause:** 
- Health bar was using generic naming
- Could be confused with Loop Room's health bar

**Solution Applied:**
- Changed title from "Ghost Vulnerability" to **"Null Wraith"**
- Changed text color to red (`text-red-300`) for distinction
- Changed instruction to "Click wraith when in light radius!"
- Made title bold for emphasis

**Code Location:** `components/scenes/NullCandlesRoomScene.tsx` line ~1583

### 2. Monster Position
**Problem:** Candle monster appearing too far to the right

**Solution Applied:**
- Changed initial ghost position from `[0, 0, -1]` to `[-2, 0, 1]`
- Monster now spawns more to the left and slightly behind player
- Better centered in player's view when candle is blown out

**Code Location:** `components/scenes/NullCandlesRoomScene.tsx` line ~199

## How to Test

### Clear Browser Cache:
1. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Cache**: 
   - Chrome: DevTools → Network tab → "Disable cache" checkbox
   - Or clear browser cache completely

### Restart Dev Server:
```bash
# Stop current server (Ctrl+C)
# Clean build
Remove-Item -Recurse -Force .next
# Start fresh
npm run dev
```

### Test Steps:
1. Navigate to Null Candles Room (Library)
2. Click the candle flame on main table
3. **Verify:**
   - Health bar shows "Null Wraith" (red text, bold)
   - Monster appears more to the left/center
   - No "Ghost Vulnerability" text
   - No Loop Room health bars

## Visual Comparison

### Health Bar
**Before:**
```
┌─────────────────────────────┐
│   Ghost Vulnerability       │ ← Generic, white
│   ▓▓▓▓▓ □□□□□              │
│   Click ghost when...       │
└─────────────────────────────┘
```

**After:**
```
┌─────────────────────────────┐
│   Null Wraith               │ ← Specific, red, bold
│   ▓▓▓▓▓ □□□□□              │
│   Click wraith when...      │
└─────────────────────────────┘
```

### Monster Position
**Before:**
```
        Player View
        ┌─────────┐
        │    👁️   │
        └─────────┘
             ↓
    [Too far right] →  👻
```

**After:**
```
        Player View
        ┌─────────┐
        │    👁️   │
        └─────────┘
             ↓
       👻  ← [Better centered]
```

## Technical Details

### Position Coordinates
```typescript
// Old position
const [ghostPosition, setGhostPosition] = useState<[number, number, number]>([0, 0, -1]);

// New position
const [ghostPosition, setGhostPosition] = useState<[number, number, number]>([-2, 0, 1]);

// Breakdown:
// X: -2 (left of center)
// Y: 0 (ground level)
// Z: 1 (slightly behind player start position)
```

### Health Bar Styling
```typescript
<div className="text-red-300 text-center mb-2 font-bold">
  Null Wraith
</div>
```

## If Issues Persist

### Browser Cache Issue:
If you still see "Ghost Vulnerability":
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Hard refresh (Ctrl+Shift+R)

### Dev Server Issue:
If monster position hasn't changed:
1. Stop dev server (Ctrl+C)
2. Delete `.next` folder
3. Restart: `npm run dev`
4. Navigate to room again

### Build Cache Issue:
```bash
# Full clean rebuild
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run build
npm run dev
```

## Room-Specific Identities

Each room now has distinct branding:

| Room | Health Bar Title | Color | Style |
|------|-----------------|-------|-------|
| Loop Room | "Banish Progress" | Green | Normal |
| Null Candles | "Null Wraith" | Red | Bold |

This prevents confusion when switching between rooms.

## Monster Spawn Behavior

### Trigger:
- Player clicks candle flame on main table
- `candleLit` state changes to `false`

### Spawn Location:
- Position: `[-2, 0, 1]`
- Rotation: `[0, Math.PI, 0]` (facing into room)
- Scale: 2.5 (invulnerable) or 2.8 (vulnerable)

### Patrol Pattern:
- Circular movement around room
- Radius: 3 units
- Speed: 0.3 rad/sec
- Passes through flame orb light radius periodically

## Verification Checklist

After applying fixes, verify:
- [ ] Health bar shows "Null Wraith" (not "Ghost Vulnerability")
- [ ] Text is red and bold
- [ ] Monster spawns to the left/center (not far right)
- [ ] Monster is visible when candle is blown out
- [ ] Light radius mechanic works correctly
- [ ] No Loop Room UI elements visible
- [ ] Victory/failure screens work properly
- [ ] Can return to hallway successfully

## Notes

- Build completed successfully
- No TypeScript errors
- No linting issues
- All routes compile correctly
- Changes are in production build
