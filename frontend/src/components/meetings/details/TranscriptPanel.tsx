import React, { useState } from 'react';
import { TranscriptSegment } from '@/types';
import { Search, Maximize2, Minimize2, Sparkles, AudioLines, Copy, Scissors } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const colors = [
  'bg-teal-500', 'bg-blue-400', 'bg-purple-500', 'bg-pink-500', 
  'bg-orange-400', 'bg-green-600', 'bg-yellow-500', 'bg-indigo-500'
];

const getAvatarColor = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
}

export function TranscriptPanel({ segments, currentTime, onSeek, isExpanded, onToggleExpand }: TranscriptPanelProps) {
  const [activeTab, setActiveTab] = useState<'askfred' | 'transcript'>('transcript');
  const [search, setSearch] = useState('');
  const listRef = React.useRef<HTMLDivElement>(null);

  const filteredSegments = segments.filter(seg => 
    seg.text.toLowerCase().includes(search.toLowerCase()) || 
    seg.speaker_name.toLowerCase().includes(search.toLowerCase())
  );

  const activeIndex = filteredSegments.findIndex(seg => currentTime >= seg.start_time && currentTime <= seg.end_time);

  const queryClient = useQueryClient();
  
  // We need the meeting ID from the first segment to invalidate the cache properly
  const meetingId = segments.length > 0 ? (segments[0] as any).meeting_id : null;

  const createSoundbiteMutation = useMutation({
    mutationFn: (data: { title: string; start_time: number; end_time: number }) => 
      fetchApi(`/meetings/${meetingId}/soundbites/`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soundbites', meetingId?.toString()] });
    }
  });

  const handleCreateSoundbite = (seg: TranscriptSegment) => {
    if (!meetingId) return;
    const titleText = seg.text.length > 40 ? seg.text.substring(0, 40) + '...' : seg.text;
    createSoundbiteMutation.mutate({
      title: titleText,
      start_time: seg.start_time,
      end_time: seg.end_time
    });
  };

  React.useEffect(() => {
    if (activeIndex !== -1 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-r border-gray-200 dark:border-gray-800 transition-colors relative">
      {/* Tabs */}
      <div className="flex items-center space-x-6 py-4 border-b border-gray-100 dark:border-gray-800 px-6 shrink-0 relative">
        <button 
          onClick={() => setActiveTab('transcript')}
          className={`text-sm font-medium transition-colors ${activeTab === 'transcript' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-4 -mb-[17px]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        >
          Transcript
        </button>
        <button onClick={onToggleExpand} className="absolute right-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
          {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Find or Replace"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-900 rounded-md text-sm outline-none transition-colors text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Transcript List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-6 pb-32 space-y-6 scroll-smooth">
        {filteredSegments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10">No transcript segments match your search.</div>
        ) : (
          filteredSegments.map((seg, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div key={idx} className="flex items-start space-x-3 group relative pr-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${getAvatarColor(seg.speaker_name)}`}>
                  {seg.speaker_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-[15px]">
                      <HighlightText text={seg.speaker_name} highlight={search} />
                    </span>
                    <button onClick={() => onSeek(seg.start_time)} className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                      {formatTimestamp(seg.start_time)}
                    </button>
                  </div>
                  <div className={`text-[15px] leading-relaxed transition-colors p-1.5 -ml-1.5 rounded ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`}>
                    <HighlightText text={seg.text} highlight={search} />
                  </div>

                  {/* Hover Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 mt-3">
                    <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center">
                      <Copy className="w-4 h-4 mr-1.5" /> Copy
                    </button>
                    <button 
                      onClick={() => handleCreateSoundbite(seg)}
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center"
                      disabled={createSoundbiteMutation.isPending}
                    >
                      <Scissors className="w-4 h-4 mr-1.5" /> Soundbite
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
