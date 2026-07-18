'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Meeting, TranscriptSegment } from '@/types';
import { Loader2, Search, AudioLines, MessageSquare, Bookmark } from 'lucide-react';
import { MeetingHeader } from '@/components/meetings/details/MeetingHeader';
import { NotesPanel } from '@/components/meetings/details/NotesPanel';
import { TranscriptPanel } from '@/components/meetings/details/TranscriptPanel';
import { AudioPlayer } from '@/components/meetings/details/AudioPlayer';
import { ToolsPanel, ToolType } from '@/components/meetings/details/ToolsPanel';

export default function MeetingDetailsPage() {
  const params = useParams();
  const meetingId = params?.id as string;

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch meeting details
  const { data: meeting, isLoading: isMeetingLoading, error: meetingError } = useQuery<Meeting>({
    queryKey: ['meeting', meetingId],
    queryFn: () => fetchApi(`/meetings/${meetingId}`),
    enabled: !!meetingId,
  });

  // Fetch transcript separately
  const { data: transcript, isLoading: isTranscriptLoading } = useQuery<TranscriptSegment[]>({
    queryKey: ['transcript', meetingId],
    queryFn: () => fetchApi(`/meetings/${meetingId}/transcript`),
    enabled: !!meetingId,
  });

  // Mock audio playback timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (meeting && prev >= (meeting.duration_seconds || 1800)) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, meeting]);

  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [expandedPanel, setExpandedPanel] = useState<'notes' | 'transcript' | null>(null);

  if (isMeetingLoading || isTranscriptLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-500">
        Failed to load meeting.
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      <MeetingHeader meeting={meeting} />
      
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Leftmost Sidebar - Icon Navigation */}
        <div className="w-14 h-full bg-white border-r border-gray-100 flex flex-col items-center py-6 space-y-4 shrink-0 z-20">
          <button 
            onClick={() => setActiveTool(activeTool === 'search' ? null : 'search')}
            className={`p-2.5 rounded-xl transition-all ${activeTool === 'search' ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-500 hover:text-gray-900 border border-transparent'}`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTool(activeTool === 'soundbites' ? null : 'soundbites')}
            className={`p-2.5 rounded-xl transition-all ${activeTool === 'soundbites' ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-500 hover:text-gray-900 border border-transparent'}`}
          >
            <AudioLines className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTool(activeTool === 'comments' ? null : 'comments')}
            className={`p-2.5 rounded-xl transition-all ${activeTool === 'comments' ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-500 hover:text-gray-900 border border-transparent'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTool(activeTool === 'bookmarks' ? null : 'bookmarks')}
            className={`p-2.5 rounded-xl transition-all ${activeTool === 'bookmarks' ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-500 hover:text-gray-900 border border-transparent'}`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Panel */}
        <ToolsPanel 
          meeting={meeting} 
          activeTool={activeTool} 
          currentTime={currentTime}
          onSeek={(time) => setCurrentTime(time)}
          onClose={() => setActiveTool(null)} 
        />
        
        {/* Left Panel - Notes */}
        <div className={`h-full transition-all duration-300 ${expandedPanel === 'notes' ? 'w-full absolute inset-0 z-10 bg-white left-[56px]' : expandedPanel === 'transcript' ? 'w-0 hidden' : 'flex-1 border-r border-gray-200 min-w-0'}`}>
          <NotesPanel 
            meeting={meeting} 
            onSeek={(time) => setCurrentTime(time)}
            isExpanded={expandedPanel === 'notes'}
            onToggleExpand={() => setExpandedPanel(prev => prev === 'notes' ? null : 'notes')}
          />
        </div>
        
        {/* Right Panel - Transcript */}
        <div className={`h-full transition-all duration-300 ${expandedPanel === 'transcript' ? 'w-full absolute inset-0 z-10 bg-white left-[56px]' : expandedPanel === 'notes' ? 'w-0 hidden' : 'flex-1 bg-gray-50/50 min-w-0'}`}>
          <TranscriptPanel 
            segments={transcript || []} 
            currentTime={currentTime}
            onSeek={(time) => setCurrentTime(time)}
            isExpanded={expandedPanel === 'transcript'}
            onToggleExpand={() => setExpandedPanel(prev => prev === 'transcript' ? null : 'transcript')}
          />
        </div>
      </div>

      <AudioPlayer 
        durationSeconds={meeting.duration_seconds || 1800} 
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSeek={(time) => setCurrentTime(time)}
      />
    </div>
  );
}
