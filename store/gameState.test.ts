import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useGameState, RoomId } from './gameState';

/**
 * Unit Tests for Game State Store
 * Requirements: 14.1, 14.2
 */
describe('Game State Store - Unit Tests', () => {
  beforeEach(() => {
    useGameState.getState().resetProgress();
  });

  it('should initialize with all rooms set to false', () => {
    const state = useGameState.getState();
    expect(state.fixedRooms.loop).toBe(false);
    expect(state.fixedRooms.nullCandles).toBe(false);
    expect(state.fixedRooms.door404).toBe(false);
    expect(state.fixedRooms.leak).toBe(false);
    expect(state.fixedRooms.mirror).toBe(false);
  });

  it('should update the correct room when markRoomFixed is called', () => {
    useGameState.getState().markRoomFixed('loop');
    let state = useGameState.getState();
    expect(state.fixedRooms.loop).toBe(true);
    expect(state.fixedRooms.nullCandles).toBe(false);
    
    useGameState.getState().markRoomFixed('nullCandles');
    state = useGameState.getState();
    expect(state.fixedRooms.loop).toBe(true);
    expect(state.fixedRooms.nullCandles).toBe(true);
    expect(state.fixedRooms.door404).toBe(false);
  });

  it('should return true from allRoomsFixed only when all 5 rooms are fixed', () => {
    expect(useGameState.getState().allRoomsFixed()).toBe(false);
    
    useGameState.getState().markRoomFixed('loop');
    expect(useGameState.getState().allRoomsFixed()).toBe(false);
    
    useGameState.getState().markRoomFixed('nullCandles');
    expect(useGameState.getState().allRoomsFixed()).toBe(false);
    
    useGameState.getState().markRoomFixed('door404');
    expect(useGameState.getState().allRoomsFixed()).toBe(false);
    
    useGameState.getState().markRoomFixed('leak');
    expect(useGameState.getState().allRoomsFixed()).toBe(false);
    
    useGameState.getState().markRoomFixed('mirror');
    expect(useGameState.getState().allRoomsFixed()).toBe(true);
  });

  it('should clear all rooms when resetProgress is called', () => {
    // Mark some rooms as fixed
    useGameState.getState().markRoomFixed('loop');
    useGameState.getState().markRoomFixed('nullCandles');
    useGameState.getState().markRoomFixed('door404');
    
    let state = useGameState.getState();
    expect(state.fixedRooms.loop).toBe(true);
    expect(state.fixedRooms.nullCandles).toBe(true);
    expect(state.fixedRooms.door404).toBe(true);
    
    // Reset progress
    useGameState.getState().resetProgress();
    
    // All rooms should be false again
    state = useGameState.getState();
    expect(state.fixedRooms.loop).toBe(false);
    expect(state.fixedRooms.nullCandles).toBe(false);
    expect(state.fixedRooms.door404).toBe(false);
    expect(state.fixedRooms.leak).toBe(false);
    expect(state.fixedRooms.mirror).toBe(false);
  });
});

/**
 * Feature: haunted-codebase, Property 23: Room completion updates game state
 * 
 * For any room puzzle completion event, the game state should update to mark
 * that specific room as fixed (isFixed = true).
 * 
 * Validates: Requirements 6.6, 7.8, 8.8, 9.7, 10.7, 14.2
 */
describe('Property 23: Room completion updates game state', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameState.getState().resetProgress();
  });

  it('should mark the correct room as fixed when markRoomFixed is called', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<RoomId>('loop', 'nullCandles', 'door404', 'leak', 'mirror'),
        (roomId) => {
          // Reset state before each iteration
          useGameState.getState().resetProgress();
          
          // Get initial state
          const initialState = useGameState.getState().fixedRooms;
          
          // All rooms should start as false
          expect(initialState[roomId]).toBe(false);
          
          // Mark the room as fixed
          useGameState.getState().markRoomFixed(roomId);
          
          // Get updated state
          const updatedState = useGameState.getState().fixedRooms;
          
          // The specific room should now be true
          expect(updatedState[roomId]).toBe(true);
          
          // All other rooms should remain false
          const otherRooms = Object.keys(updatedState).filter(
            (key) => key !== roomId
          ) as RoomId[];
          
          otherRooms.forEach((otherRoom) => {
            expect(updatedState[otherRoom]).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain previously fixed rooms when marking additional rooms', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<RoomId>('loop', 'nullCandles', 'door404', 'leak', 'mirror'),
          { minLength: 1, maxLength: 5 }
        ),
        (roomSequence) => {
          // Reset state before each iteration
          useGameState.getState().resetProgress();
          
          const fixedRooms = new Set<RoomId>();
          
          // Mark each room in sequence
          roomSequence.forEach((roomId) => {
            fixedRooms.add(roomId);
            useGameState.getState().markRoomFixed(roomId);
            
            // Check that all previously fixed rooms are still fixed
            const currentState = useGameState.getState().fixedRooms;
            fixedRooms.forEach((fixedRoom) => {
              expect(currentState[fixedRoom]).toBe(true);
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
