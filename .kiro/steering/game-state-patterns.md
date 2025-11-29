---
inclusion: fileMatch
fileMatchPattern: "**/store/**/*.{ts,tsx}"
---

# Game State Management Patterns

## Zustand Store Usage

All game state is managed through the centralized Zustand store at `store/gameState.ts`.

### Room Completion Tracking

```typescript
interface GameState {
  fixedRooms: {
    loop: boolean;
    nullCandles: boolean;
    door404: boolean;
    leak: boolean;
    mirror: boolean;
  };
  markRoomFixed: (room: keyof GameState['fixedRooms']) => void;
  resetProgress: () => void;
  allRoomsFixed: () => boolean;
}
```

### Usage in Scene Components

When a puzzle is solved, always call `markRoomFixed`:

```typescript
import { useGameState } from '@/store/gameState';

const MyRoomScene = () => {
  const markRoomFixed = useGameState(state => state.markRoomFixed);
  
  const handlePuzzleSolved = () => {
    // Puzzle logic...
    markRoomFixed('roomId'); // 'loop', 'nullCandles', 'door404', 'leak', 'mirror'
    setShowSuccess(true);
  };
};
```

### Selective Re-renders

Use selectors to prevent unnecessary re-renders:

```typescript
// ❌ Bad: Re-renders on any state change
const gameState = useGameState();

// ✅ Good: Only re-renders when this specific room changes
const isLoopFixed = useGameState(state => state.fixedRooms.loop);
```

### Checking All Rooms Complete

In the Commit Altar scene:

```typescript
const allRoomsFixed = useGameState(state => state.allRoomsFixed());
const canCommit = allRoomsFixed;
```

## State Persistence

The store uses Zustand's persist middleware to save progress to localStorage:

```typescript
persist(
  (set, get) => ({ /* state */ }),
  { name: 'haunted-codebase-progress' }
)
```

This ensures player progress survives page refreshes.

## Testing State Management

Always test state updates in scene tests:

```typescript
it('should mark room as fixed when puzzle solved', () => {
  const { result } = renderHook(() => useGameState());
  
  act(() => {
    result.current.markRoomFixed('loop');
  });
  
  expect(result.current.fixedRooms.loop).toBe(true);
});
```
