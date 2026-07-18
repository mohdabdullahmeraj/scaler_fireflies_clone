'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Soundbite } from '@/types';
import { Play, Loader2, Music, Scissors } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface SoundbitesListProps {
  meetingId: number;
}

export function SoundbitesList({ meetingId }: SoundbitesListProps) {
  const { seekTo } = usePlayer();
  const { data: soundbites = [], isLoading } = useQuery<Soundbite[]>({
    queryKey: ['soundbites', meetingId],
    queryFn: () => fetchApi(`/meetings/${meetingId}/soundbites/`),
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (soundbites.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10 flex flex-col items-center">
        <Scissors className="w-8 h-8 text-gray-300 mb-2" />
        <p>No soundbites found for this meeting.</p>
        <p className="text-xs mt-1 text-gray-400">Highlight text in the transcript to create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {soundbites.map((sb) => (
        <div 
          key={sb.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-brand-300)] transition-colors shadow-sm group cursor-pointer"
          onClick={() => seekTo(sb.start_time)}
        >
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center group-hover:bg-[var(--color-brand-600)] group-hover:text-white transition-colors">
              <Play className="w-4 h-4 ml-0.5" />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{sb.title}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                <Music className="w-3 h-3" />
                <span>{formatTime(sb.start_time)} - {formatTime(sb.end_time)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs font-medium text-[var(--color-brand-600)] opacity-0 group-hover:opacity-100 transition-opacity">
            Play
          </div>
        </div>
      ))}
    </div>
  );
}
