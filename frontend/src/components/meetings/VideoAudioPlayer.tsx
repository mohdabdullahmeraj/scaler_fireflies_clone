'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { Meeting } from '@/types';

interface VideoAudioPlayerProps {
  meeting: Meeting;
}

export function VideoAudioPlayer({ meeting }: VideoAudioPlayerProps) {
  const mediaRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { 
    registerMediaRef, 
    updateTime, 
    updateDuration, 
    setPlayingState, 
    currentTime, 
    duration, 
    isPlaying, 
    togglePlay,
    seekTo
  } = usePlayer();

  useEffect(() => {
    registerMediaRef(mediaRef);
  }, [registerMediaRef]);

  // Fallback mock audio URL since we might not have real audio
  const audioSrc = meeting.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const handleTimeUpdate = () => {
    if (mediaRef.current) updateTime(mediaRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) updateDuration(mediaRef.current.duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(pos * duration);
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !mediaRef.current.muted;
      setIsMuted(mediaRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col w-full h-[240px] md:h-[320px] shadow-lg">
      <audio
        ref={mediaRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPlayingState(true)}
        onPause={() => setPlayingState(false)}
        onEnded={() => setPlayingState(false)}
      />
      
      {/* Video Placeholder (mock visualizer) */}
      <div className="flex-1 bg-black flex items-center justify-center relative">
        <div className="text-white/20 text-6xl font-bold tracking-widest">
          {isPlaying ? (
             <div className="flex space-x-2 items-center h-16">
               <div className="w-3 bg-[var(--color-brand-500)] animate-pulse h-16"></div>
               <div className="w-3 bg-[var(--color-brand-400)] animate-pulse h-10 delay-75"></div>
               <div className="w-3 bg-[var(--color-brand-600)] animate-pulse h-14 delay-150"></div>
               <div className="w-3 bg-[var(--color-brand-500)] animate-pulse h-8 delay-300"></div>
             </div>
          ) : (
             meeting.title.charAt(0)
          )}
        </div>
      </div>

      {/* Custom Controls */}
      <div className="h-14 bg-gray-800 px-4 flex items-center text-white space-x-4">
        <button onClick={togglePlay} className="hover:text-[var(--color-brand-400)] transition-colors">
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
        </button>
        
        <div className="flex items-center space-x-2">
          <button onClick={() => seekTo(Math.max(0, currentTime - 10))} className="hover:text-[var(--color-brand-400)] transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={() => seekTo(Math.min(duration, currentTime + 10))} className="hover:text-[var(--color-brand-400)] transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm font-medium w-24 text-center tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration || meeting.duration_seconds)}
        </div>

        <div 
          className="flex-1 h-1.5 bg-gray-600 rounded-full cursor-pointer relative group"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--color-brand-500)] rounded-full"
            style={{ width: `${(currentTime / (duration || meeting.duration_seconds || 1)) * 100}%` }}
          />
          <div 
            className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${(currentTime / (duration || meeting.duration_seconds || 1)) * 100}% - 6px)` }}
          />
        </div>

        <div className="flex items-center space-x-4 text-gray-300">
          <button onClick={toggleMute} className="hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button className="hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
          <button onClick={toggleFullscreen} className="hover:text-white transition-colors"><Maximize className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
