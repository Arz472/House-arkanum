# Light Radius Mechanic - Visual Guide

## Room Layout (Top-Down View)

```
                    BACK WALL
    ╔═══════════════════════════════════╗
    ║                                   ║
    ║    📚        📚        📚         ║
    ║  Shelf     Shelf     Shelf        ║
    ║                                   ║
    ║         🌀 Spiral Stairs          ║
    ║                                   ║
    ║    📚   [TABLE]  🕯️   📚         ║
    ║  Shelf   (Main)  Orb   Shelf      ║
    ║           ⭕                       ║
    ║        Light Ring                 ║
    ║                                   ║
    ║    📚        📚        📚         ║
    ║  Shelf     Shelf     Shelf        ║
    ║                                   ║
    ║            🚪                     ║
    ║         (Player)                  ║
    ╚═══════════════════════════════════╝
                  FRONT WALL
```

## Ghost Patrol Pattern

```
         Ghost Movement (Circular)
              
              ↑ (3)
              |
              |
    (2) ←─────⭕─────→ (4)
              |
              |
              ↓ (1)
              
    ⭕ = Flame Orb (Center)
    Numbers = Ghost position over time
```

## Light Radius Visualization

```
    Outside Light (INVULNERABLE)
         👻 ← Ghost (Red glow)
         
         
         
    ╔═══════════════════╗
    ║                   ║
    ║    Inside Light   ║
    ║   (VULNERABLE)    ║
    ║                   ║
    ║       👻 ⚠️       ║ ← Ghost (Yellow indicator)
    ║                   ║
    ║       🕯️          ║ ← Flame Orb
    ║    ⭕⭕⭕⭕⭕      ║ ← Light Ring
    ║                   ║
    ╚═══════════════════╝
         
         
         
    Outside Light (INVULNERABLE)
         👻 ← Ghost (Red glow)
```

## UI Elements

```
┌─────────────────────────────────────────┐
│         Ghost Vulnerability             │ ← Health Bar
│   ▓▓▓▓▓ □□□□□                          │   (Top Center)
│   Click ghost when in light radius!     │
└─────────────────────────────────────────┘


                [GAME VIEW]
                
                
┌─────────────────────────────────────────┐
│ 🖱️ Move mouse to look around           │ ← Instructions
│ 🌀 Approach glowing staircases          │   (Bottom Left)
│ 📚 Explore all three floors             │
└─────────────────────────────────────────┘
```

## Click Feedback

### ✅ Successful Hit (Ghost in Light)
```
Before:  ▓▓▓▓▓ □□□□□  (5 health)
         
         [CLICK!] 👻⚠️ ← Ghost in light
         
After:   ▓▓▓▓ □□□□□□  (4 health)
```

### ❌ Missed Click (Ghost Outside Light)
```
Before:  ▓▓▓▓▓ □□□□□  (5 health)
         
         [CLICK!] 👻 ← Ghost outside light
         
         🔴 FLASH! (Red screen)
         📺 GLITCH! (RGB distortion)
         
After:   ▓▓▓▓▓▓ □□□□  (6 health - ghost stronger!)
```

## Victory Sequence

```
Hit 1:  ▓▓▓▓ □□□□□□
Hit 2:  ▓▓▓ □□□□□□□
Hit 3:  ▓▓ □□□□□□□□
Hit 4:  ▓ □□□□□□□□□
Hit 5:  □□□□□□□□□□

╔═══════════════════════════════════╗
║          🎉 VICTORY! 🎉           ║
║                                   ║
║  You have banished the Null       ║
║  Wraith! The light has            ║
║  triumphed over darkness.         ║
║                                   ║
║  [Continue Exploring]             ║
║  [Return to Lobby]                ║
╚═══════════════════════════════════╝
```

## Failure Sequence

```
Miss 1:  ▓▓▓▓▓▓ □□□□
Miss 2:  ▓▓▓▓▓▓▓ □□□
Miss 3:  ▓▓▓▓▓▓▓▓ □□
Miss 4:  ▓▓▓▓▓▓▓▓▓ □
Miss 5:  ▓▓▓▓▓▓▓▓▓▓

╔═══════════════════════════════════╗
║          💀 YOU FAILED 💀         ║
║                                   ║
║  The Null Wraith has claimed      ║
║  another soul...                  ║
║                                   ║
║  [Return to Lobby]                ║
╚═══════════════════════════════════╝
```

## Timing & Distances

```
Light Radius:     2.5 units
Ghost Patrol:     3.0 unit radius
Patrol Speed:     0.3 (slow, predictable)
Vulnerability:    ~30% of patrol time

Ghost Scale:
  - Invulnerable: 2.5x
  - Vulnerable:   2.8x (slightly larger)

Effects Duration:
  - Flicker:      500ms
  - Glitch:       300ms
  - Victory:      Permanent
  - Failure:      Fade to black (2s)
```

## Color Coding

```
🟡 Yellow = Light Radius / Vulnerability
🔴 Red    = Ghost / Danger / Invulnerable
🟢 Green  = Victory
⚫ Black  = Darkness / Failure
🟠 Orange = Flame Orb
```

## Key Interactions

```
1. Candle Click
   ┌─────────┐
   │ 🕯️ Orb  │ ← Click
   └─────────┘
        ↓
   Room goes dark
        ↓
   Ghost appears
        ↓
   Mechanic starts

2. Ghost Click (In Light)
   ┌─────────┐
   │ 👻⚠️    │ ← Click (Yellow indicator visible)
   └─────────┘
        ↓
   Ghost damaged
        ↓
   Health decreases

3. Ghost Click (Outside Light)
   ┌─────────┐
   │ 👻      │ ← Click (No indicator)
   └─────────┘
        ↓
   Effects trigger
        ↓
   Ghost stronger
```

## Strategy Tips

```
✓ Wait for yellow indicator before clicking
✓ Track ghost patrol pattern (predictable circle)
✓ Position camera to see both ghost and light ring
✓ Don't panic-click - timing is key
✓ 5 hits needed, ~5 mistakes allowed
✗ Don't click when ghost is outside light
✗ Don't spam clicks - each miss makes ghost stronger
```
