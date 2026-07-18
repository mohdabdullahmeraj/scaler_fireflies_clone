'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { TranscriptSegment } from '@/types';
import { formatTime, cn } from '@/lib/utils';
import { Play, MessageSquare, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Highlight, Comment } from '@/types';

interface TranscriptPanelProps {
  meetingId: number;
  segments: TranscriptSegment[];
}

export function TranscriptPanel({ meetingId, segments }: TranscriptPanelProps) {
  const { currentTime, seekTo } = usePlayer();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', meetingId],
    queryFn: () => fetchApi(`/meetings/${meetingId}/comments/`)
  });

  const { data: highlights = [] } = useQuery<Highlight[]>({
    queryKey: ['highlights', meetingId],
    queryFn: () => fetchApi(`/meetings/${meetingId}/highlights/`)
  });
  
  // Find active segment
  const activeIndex = segments.findIndex(
    seg => currentTime >= seg.start_time && currentTime < seg.end_time
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = activeSegmentRef.current;
      
      // Calculate position to center the active segment
      const topPos = element.offsetTop - container.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, topPos),
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  // Filter segments based on search
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const lowerQuery = searchQuery.toLowerCase();
    return segments.filter(seg => seg.text.toLowerCase().includes(lowerQuery) || seg.speaker_name.toLowerCase().includes(lowerQuery));
  }, [segments, searchQuery]);

  // Helper to highlight text
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark> 
        : part
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Transcript</h3>
          <span className="text-xs text-gray-500">{filteredSegments.length} segments</span>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md py-1.5 pl-3 pr-3 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
          />
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 relative"
      >
        {filteredSegments.map((segment, index) => {
          const isActive = index === activeIndex;
          const segmentComments = comments.filter(c => c.segment_id === segment.id);
          const segmentHighlights = highlights.filter(h => h.segment_id === segment.id);
          
          return (
            <div key={segment.id} className="flex flex-col gap-2 relative" ref={isActive ? activeSegmentRef : null}>
              <div 
                className={cn(
                  "group flex gap-4 p-2 -mx-2 rounded-lg transition-colors cursor-pointer",
                  isActive ? "bg-[var(--color-brand-50)]" : "hover:bg-gray-50",
                  segmentHighlights.length > 0 && !isActive ? "bg-yellow-50/40" : ""
                )}
                onClick={() => seekTo(segment.start_time)}
              >
                {/* Speaker Avatar / Time */}
                <div className="w-12 shrink-0 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mb-1">
                    {segment.speaker_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono hidden group-hover:block">
                    <Play className="w-3 h-3 text-[var(--color-brand-600)] inline" />
                  </div>
                  <div className={cn("text-[10px] font-mono", isActive ? "text-[var(--color-brand-600)] font-semibold" : "text-gray-400 group-hover:hidden")}>
                    {formatTime(segment.start_time)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{highlightText(segment.speaker_name)}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button className="text-gray-400 hover:text-[var(--color-brand-600)]" title="Add Comment">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-yellow-500" title="Highlight">
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isActive ? "text-gray-900 font-medium" : "text-gray-600"
                  )}>
                    {highlightText(segment.text)}
                  </p>
                </div>
              </div>
              
              {/* Render Annotations below segment */}
              {(segmentComments.length > 0 || segmentHighlights.length > 0) && (
                <div className="ml-16 mb-2 space-y-2">
                  {segmentHighlights.map(hl => (
                    <div key={`hl-${hl.id}`} className="flex items-start gap-2 bg-yellow-50 p-2 rounded text-xs border border-yellow-100">
                      <Star className="w-3.5 h-3.5 text-yellow-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-yellow-800 capitalize">{hl.label}</span>
                        {hl.note && <span className="text-yellow-700 ml-2">— {hl.note}</span>}
                      </div>
                    </div>
                  ))}
                  {segmentComments.map(comment => (
                    <div key={`c-${comment.id}`} className="flex items-start gap-2 bg-gray-50 p-2 rounded text-xs border border-gray-100">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
                      <div className="text-gray-700">
                        <span className="font-medium">User: </span> {comment.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {segments.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No transcript available for this meeting.
          </div>
        )}
      </div>
    </div>
  );
}
