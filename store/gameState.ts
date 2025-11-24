import { create } from 'zustand';

export type RoomId = 'loop' | 'nullCandles' | 'door404' | 'leak' | 'mirror';

interface GameState {
  fixedRooms: {
    loop: boolean;
    nullCandles: boolean;
    door404: boolean;
    leak: boolean;
    mirror: boolean;
  };
  markRoomFixed: (room: RoomId) => void;
  resetProgress: () => void;
  allRoomsFixed: () => boolean;
}

export const useGameState = create<GameState>((set, get) => ({
  fixedRooms: {
    loop: false,
    nullCandles: false,
    door404: false,
    leak: false,
    mirror: false,
  },
  markRoomFixed: (room: RoomId) =>
    set((state) => ({
      fixedRooms: {
        ...state.fixedRooms,
        [room]: true,
      },
    })),
  resetProgress: () =>
    set({
      fixedRooms: {
        loop: false,
        nullCandles: false,
        door404: false,
        leak: false,
        mirror: false,
      },
    }),
  allRoomsFixed: () => {
    const { fixedRooms } = get();
    return Object.values(fixedRooms).every((fixed) => fixed === true);
  },
}));
