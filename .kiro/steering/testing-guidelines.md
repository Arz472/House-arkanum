---
inclusion: fileMatch
fileMatchPattern: "**/*.test.{ts,tsx}"
---

# Testing Guidelines for House Arkanum

## Test Structure

### Unit Tests
Test specific examples and edge cases for component behavior.

```typescript
describe('ComponentName', () => {
  it('should render without crashing', () => {
    render(<Component />);
  });
  
  it('should handle specific interaction', () => {
    // Test implementation
  });
});
```

### Property-Based Tests
Test universal properties across all inputs using fast-check.

```typescript
import fc from 'fast-check';

describe('Property Tests', () => {
  it('Feature: haunted-codebase, Property X: description', () => {
    fc.assert(
      fc.property(
        fc.record({ /* generators */ }),
        (input) => {
          // Property assertion
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Test Coverage Requirements

Each scene component should have tests for:
- ✅ Renders without crashing
- ✅ Interactive elements respond to clicks
- ✅ Success condition triggers correctly
- ✅ Game state updates on completion
- ✅ Return navigation works

## Property Test Format

Tag format: `Feature: haunted-codebase, Property {number}: {property_text}`

Example properties to test:
- Performance constraints (triangle count, light count)
- Navigation consistency
- State management persistence
- Interaction responses
- Puzzle logic correctness

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
```

## Mocking Three.js

Use these mocks for testing React Three Fiber components:

```typescript
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div>{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({ camera: {}, scene: {} }),
}));
```
