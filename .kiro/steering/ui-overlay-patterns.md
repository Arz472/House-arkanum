---
inclusion: fileMatch
fileMatchPattern: "components/ui/**/*.{ts,tsx}"
---

# UI Overlay and HUD Patterns

## Design System

All UI overlays use Tailwind CSS with a consistent dark horror aesthetic.

### Color Palette

```typescript
// Background overlays
bg-black/80          // Semi-transparent black backdrop
bg-gray-900/95       // Solid dark panels

// Text colors
text-gray-100        // Primary text (high contrast)
text-gray-400        // Secondary text
text-red-500         // Error/danger states
text-green-500       // Success states
text-yellow-400      // Warning/attention

// Accent colors
border-red-600       // Danger borders
border-green-600     // Success borders
```

### Typography

```typescript
// Headings
font-mono text-2xl font-bold

// Body text
font-sans text-base

// Code/debug aesthetic
font-mono text-sm tracking-wider
```

## Common Overlay Components

### Success Overlay Pattern

```typescript
{showSuccess && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
    <div className="bg-gray-900 border-2 border-green-600 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-green-500 mb-4">
        Bug Fixed!
      </h2>
      <p className="text-gray-300 mb-6">
        {successMessage}
      </p>
      <button
        onClick={() => router.push('/')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        Return to Hallway
      </button>
    </div>
  </div>
)}
```

### HUD Component Pattern

```typescript
<div className="absolute top-4 left-4 bg-black/60 p-4 rounded border border-gray-700">
  <div className="font-mono text-sm text-gray-300">
    <div className="mb-2">Health: {health}/5</div>
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-8 h-8 border-2 ${
            i < health ? 'bg-red-600 border-red-400' : 'bg-gray-800 border-gray-600'
          }`}
        />
      ))}
    </div>
  </div>
</div>
```

### Instruction Text Pattern

```typescript
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-3 rounded-full">
  <p className="font-mono text-sm text-gray-300 text-center">
    {instructionText}
  </p>
</div>
```

## Accessibility

Always include:
- High contrast text (WCAG AA minimum)
- Keyboard navigation support
- Focus indicators on interactive elements
- ARIA labels for screen readers

```typescript
<button
  aria-label="Return to hallway"
  className="focus:outline-none focus:ring-2 focus:ring-green-500"
>
  Return
</button>
```

## Animation

Use Tailwind transitions for smooth interactions:

```typescript
className="transition-all duration-300 hover:scale-105"
```

Avoid heavy CSS animations that could impact 3D performance.
