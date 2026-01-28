import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [track, setTrack] = useState(null); // { link, title, artist, coverUrl, albumId, source }
  const [playing, setPlaying] = useState(false);

  const play = useCallback((data) => {
    setTrack(data);
    setPlaying(true);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);
  const resume = useCallback(() => setPlaying(true), []);

  return (
    <PlayerContext.Provider value={{ track, playing, play, pause, resume }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
