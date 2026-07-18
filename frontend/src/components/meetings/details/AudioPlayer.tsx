import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Download, Star, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AudioPlayerProps {
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ durationSeconds, currentTime, isPlaying, onPlayPause, onSeek }: AudioPlayerProps) {
  const progressPercent = Math.min(100, Math.max(0, (currentTime / (durationSeconds || 1)) * 100));

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = clickX / rect.width;
    onSeek(newPercent * durationSeconds);
  };

  return (
    <div className="w-full shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-colors">
      
      {/* Progress Bar */}
      <div 
        className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 cursor-pointer relative group"
        onClick={handleSeek}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Playhead thumb */}
        <div 
          className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-indigo-600 rounded-full shadow-sm"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>

      <div className="h-16 flex items-center justify-between px-6">
        {/* Time Display */}
        <div className="w-48 text-[13px] font-medium text-gray-500 dark:text-gray-400">
          <span className="text-gray-900 dark:text-gray-100">{formatTimestamp(currentTime)}</span> / {formatTimestamp(durationSeconds)}
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-6">
          <button className="text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            1x
          </button>
          <button onClick={() => onSeek(Math.max(0, currentTime - 15))} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            onClick={onPlayPause}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button onClick={() => onSeek(Math.min(durationSeconds, currentTime + 15))} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="w-48 flex items-center justify-end space-x-4 text-gray-400 dark:text-gray-500">
          <button className="hover:text-gray-600 dark:hover:text-gray-300"><Star className="w-5 h-5" /></button>
          <button className="hover:text-gray-600 dark:hover:text-gray-300"><Copy className="w-5 h-5" /></button>
          <button className="hover:text-gray-600 dark:hover:text-gray-300"><ThumbsUp className="w-5 h-5" /></button>
          <button className="hover:text-gray-600 dark:hover:text-gray-300"><ThumbsDown className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
