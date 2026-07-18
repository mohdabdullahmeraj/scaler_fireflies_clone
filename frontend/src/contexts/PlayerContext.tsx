'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface PlayerContextType {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  seekTo: (time: number) => void;
  togglePlay: () => void;
  // Audio ref handler to link with the actual media element
  registerMediaRef: (ref: React.RefObject<HTMLAudioElement | HTMLVideoElement | null>) => void;
  updateTime: (time: number) => void;
  updateDuration: (dur: number) => void;
  setPlayingState: (state: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  const registerMediaRef = (ref: React.RefObject<HTMLAudioElement | HTMLVideoElement | null>) => {
    mediaRef.current = ref.current;
  };

  const seekTo = (time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        mediaRef.current.play().catch(console.error);
      }
    }
  };

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch(console.error);
      }
    }
  };

  const updateTime = (time: number) => setCurrentTime(time);
  const updateDuration = (dur: number) => setDuration(dur);
  const setPlayingState = (state: boolean) => setIsPlaying(state);

  return (
    <PlayerContext.Provider
      value={{
        currentTime,
        duration,
        isPlaying,
        seekTo,
        togglePlay,
        registerMediaRef,
        updateTime,
        updateDuration,
        setPlayingState,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
