import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';
import LoopRoomPage from './room/loop/page';
import NullCandlesRoomPage from './room/null-candles/page';
import Door404RoomPage from './room/404/page';
import MemoryLeakRoomPage from './room/leak/page';
import MirrorRoomPage from './room/mirror/page';
import CommitAltarPage from './altar/page';

describe('Route Pages', () => {
  it('should render Hallway Hub page without crashing', () => {
    render(<Home />);
    expect(screen.getByText(/Loading Hallway Hub.../i)).toBeInTheDocument();
  });

  it('should render Loop Room page without crashing', () => {
    render(<LoopRoomPage />);
    expect(screen.getByText(/Loading Loop Room.../i)).toBeInTheDocument();
  });

  it('should render Null Candles Room page without crashing', () => {
    render(<NullCandlesRoomPage />);
    expect(screen.getByText(/Loading Null Candles Room.../i)).toBeInTheDocument();
  });

  it('should render 404 Room page without crashing', () => {
    render(<Door404RoomPage />);
    expect(screen.getByText(/Loading 404 Room.../i)).toBeInTheDocument();
  });

  it('should render Memory Leak Room page without crashing', () => {
    render(<MemoryLeakRoomPage />);
    expect(screen.getByText(/Loading Memory Leak Room.../i)).toBeInTheDocument();
  });

  it('should render Mirror Room page without crashing', () => {
    render(<MirrorRoomPage />);
    expect(screen.getByText(/Loading Mirror Room.../i)).toBeInTheDocument();
  });

  it('should render Commit Altar page without crashing', () => {
    render(<CommitAltarPage />);
    expect(screen.getByText(/Loading Commit Altar.../i)).toBeInTheDocument();
  });
});
