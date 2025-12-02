# Light Radius Weakness Mechanic

## Overview
The ghost room (Null Candles Room) now features a Light Radius Weakness mechanic where the ghost is only vulnerable when inside the light radius cast by the flame orb.

## How It Works

### 1. **Flame Orb Light Radius**
- The flame orb on the main table casts a faint circle of light (2.5 unit radius)
- This light is visualized with a subtle yellow ring on the ground when the ghost appears
- The orb remains visible even after being "blown out" but with reduced intensity

### 2. **Ghost Patrol Pattern**
- When the candle is blown out, the ghost appears and begins patrolling
- The ghost moves in a circular pattern around the room
- It occasionally enters the light radius during its patrol (brief windows of vulnerability)

### 3. **Vulnerability System**
- **Ghost Health**: 5 hits required to defeat the ghost
- **In Light**: Ghost is vulnerable and can be damaged (yellow glow indicator appears)
- **Outside Light**: Ghost is invulnerable and grows stronger when clicked

### 4. **Click Mechanics**

#### Successful Click (Ghost in Light):
- Ghost takes 1 damage
- Ghost health indicator updates
- After 5 hits, victory screen appears

#### Failed Click (Ghost Outside Light):
- **Orb flickers violently** - Red flash effect for 500ms
- **Ghost grows stronger** - Ghost health increases by 1
- **Screen glitches** - RGB glitch effect for 300ms
- If ghost reaches 10 health, instant failure

### 5. **Visual Feedback**
- **Light Radius Ring**: Yellow ring on ground showing safe zone
- **Vulnerability Indicator**: Yellow sphere around ghost when in light
- **Hover Effect**: Yellow glow when hovering over vulnerable ghost
- **Health Bar**: Top of screen shows ghost health (5 red squares)
- **Flicker Effect**: Red overlay when clicking outside light
- **Glitch Effect**: RGB distortion when missing

### 6. **Victory Condition**
- Defeat the ghost by landing 5 successful hits while it's in the light
- Victory screen appears with options to continue or return to lobby
- Light is restored to the room

### 7. **Failure Condition**
- Ghost reaches 10 health from too many missed clicks
- Original failure animation plays (ghost appears behind camera)
- Fade to black and failure screen

## Technical Implementation

### Key State Variables:
- `ghostHealth`: Tracks ghost vulnerability (starts at 5, decreases on hit)
- `ghostPosition`: Current position during patrol
- `isGhostInLight`: Boolean indicating if ghost is in light radius
- `flickerIntensity`: Controls red flash effect
- `glitchEffect`: Controls RGB glitch effect

### Patrol Logic:
```typescript
// Circular patrol pattern
const radius = 3;
const speed = 0.3;
const x = Math.sin(ghostPatrolTime * speed) * radius;
const z = Math.cos(ghostPatrolTime * speed) * radius - 4;
```

### Distance Check:
```typescript
const distance = Math.sqrt(
  Math.pow(ghostX - flameOrbX, 2) + 
  Math.pow(ghostZ - flameOrbZ, 2)
);
const isVulnerable = distance < 2.5; // Light radius
```

## Player Strategy
1. Wait for the ghost to patrol into the light radius
2. Click quickly when the yellow vulnerability indicator appears
3. Avoid clicking when the ghost is outside the light (no indicator)
4. Track the ghost's patrol pattern to anticipate vulnerability windows
5. Land 5 successful hits before making 5 mistakes

## Difficulty Balance
- Light radius: 2.5 units (moderate coverage)
- Ghost patrol speed: 0.3 (allows reaction time)
- Required hits: 5 (reasonable challenge)
- Allowed mistakes: ~5 (before ghost becomes too strong)
- Vulnerability windows: Brief but predictable
