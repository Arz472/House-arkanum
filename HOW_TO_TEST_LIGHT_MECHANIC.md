# How to Test the Light Radius Mechanic

## Step-by-Step Testing Guide

### 1. **Start the Development Server**
```bash
npm run dev
```

### 2. **Navigate to the Ghost Room**
- Open your browser to `http://localhost:3000`
- Click on the hallway to enter
- Find and click on the "Null Candles Room" door

### 3. **Trigger the Mechanic**
- Once in the library, look for the **main table** in the center
- Click on the **candle flame** (small glowing orb on the table)
- This will "blow out" the candle and trigger the ghost mechanic

### 4. **What You Should See**

#### Immediately After Blowing Out Candle:
- ✅ Room becomes **very dark** (almost pitch black)
- ✅ **Ghost appears** and starts patrolling in a circle
- ✅ **Yellow ring** appears on the ground (light radius indicator)
- ✅ **Health bar** appears at top of screen showing "Ghost Vulnerability" with 5 red squares
- ✅ **Instruction text**: "Click ghost when in light radius!"

#### During Ghost Patrol:
- ✅ Ghost **moves in a circular pattern** around the room
- ✅ When ghost enters the yellow ring:
  - Yellow sphere appears around the ghost (vulnerability indicator)
  - Ghost becomes slightly larger (2.8 scale vs 2.5)
  - Red lighting becomes less intense
- ✅ When ghost exits the yellow ring:
  - Yellow sphere disappears
  - Ghost returns to normal size
  - Red lighting intensifies

#### When You Click the Ghost:

**✅ CORRECT CLICK (Ghost in Light):**
- One red square in health bar turns gray
- Ghost takes damage
- After 5 hits: **VICTORY screen** appears
- Light is restored to the room

**❌ WRONG CLICK (Ghost Outside Light):**
- **Red flash** covers the screen (flicker effect)
- **RGB glitch** effect appears briefly
- One gray square in health bar turns red (ghost gets stronger)
- After ghost reaches 10 health: **FAILURE screen** appears

### 5. **Visual Indicators Checklist**

When testing, verify you can see:
- [ ] Yellow ring on ground (2.5 unit radius)
- [ ] Ghost patrolling in circular motion
- [ ] Yellow vulnerability sphere when ghost is in light
- [ ] Health bar with 5 squares at top center
- [ ] Red flash when clicking outside light
- [ ] RGB glitch effect when clicking outside light
- [ ] Victory screen after 5 successful hits
- [ ] Failure screen if ghost gets too strong

### 6. **Common Issues**

**If you don't see the ghost:**
- Make sure you clicked the candle flame on the main table
- Check browser console for errors
- Ensure the GLB model is loading correctly

**If you don't see the yellow ring:**
- The ring only appears when `candleLit` is false
- Check that the candle was successfully blown out
- Look at the ground near the center table

**If clicks don't register:**
- Make sure you're clicking directly on the ghost model
- The ghost must be visible and patrolling
- Check browser console for click events

**If the health bar doesn't update:**
- Verify the ghost is in the light radius when clicking
- Check that `isGhostInLight` is being calculated correctly
- Look for the yellow vulnerability indicator

### 7. **Debug Mode**

Add this to the browser console to check state:
```javascript
// Check if ghost is in light
console.log('Ghost in light:', isGhostInLight);

// Check ghost position
console.log('Ghost position:', ghostPosition);

// Check ghost health
console.log('Ghost health:', ghostHealth);
```

### 8. **Expected Gameplay Flow**

1. Enter room → Explore library
2. Click candle → Room goes dark, ghost appears
3. Wait for ghost to patrol into light radius
4. Click ghost when yellow indicator appears (5 times)
5. Victory! → Light restored

OR

1. Enter room → Explore library
2. Click candle → Room goes dark, ghost appears
3. Click ghost when outside light (5+ times)
4. Ghost grows too strong → Failure screen

### 9. **Performance Notes**

- Ghost patrol runs at 0.3 speed (smooth, predictable)
- Light radius check happens every frame
- Effects (flicker, glitch) are temporary (300-500ms)
- Victory/failure screens appear immediately after conditions met

### 10. **Browser Compatibility**

Tested on:
- Chrome/Edge (recommended)
- Firefox
- Safari (may have WebGL performance differences)

Make sure WebGL is enabled in your browser!
