import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Meeting, Comment, Soundbite } from '@/types';
import { Search, AudioLines, MessageSquare, Bookmark, Plus, Send, Activity, CheckCircle2, Globe, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';

export type ToolType = 'search' | 'soundbites' | 'comments' | 'bookmarks' | null;

interface ToolsPanelProps {
  meeting: Meeting;
  activeTool: ToolType;
  currentTime: number;
  onSeek: (time: number) => void;
  onClose?: () => void;
}

export function ToolsPanel({ meeting, activeTool, currentTime, onSeek, onClose }: ToolsPanelProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch Comments
  const { data: comments, isLoading: isCommentsLoading } = useQuery<Comment[]>({
    queryKey: ['comments', meeting.id.toString()],
    queryFn: () => fetchApi(`/meetings/${meeting.id}/comments`),
    enabled: activeTool === 'comments',
  });

  // Fetch Soundbites
  const { data: soundbites, isLoading: isSoundbitesLoading } = useQuery<Soundbite[]>({
    queryKey: ['soundbites', meeting.id.toString()],
    queryFn: () => fetchApi(`/meetings/${meeting.id}/soundbites`),
    enabled: activeTool === 'soundbites',
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await fetchApi(`/meetings/${meeting.id}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ text: newComment, timestamp: currentTime })
      });
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', meeting.id.toString()] });
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleCreateMockSoundbite = async () => {
    try {
      await fetchApi(`/meetings/${meeting.id}/soundbites/`, {
        method: 'POST',
        body: JSON.stringify({
          title: 'Important Moment',
          start_time: 120,
          end_time: 150
        })
      });
      queryClient.invalidateQueries({ queryKey: ['soundbites', meeting.id.toString()] });
    } catch (err) {
      console.error('Failed to create soundbite', err);
    }
  };

  if (!activeTool) return null;

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 shrink-0 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {activeTool === 'search' && 'Smart Search'}
          {activeTool === 'soundbites' && 'Soundbite'}
          {activeTool === 'comments' && 'Comments'}
          {activeTool === 'bookmarks' && (
            <span className="flex items-center">
              All Bookmarks <span className="ml-1 text-gray-400 dark:text-gray-500 text-xs">▼</span>
            </span>
          )}
        </h3>
        {activeTool === 'soundbites' && (
          <button onClick={handleCreateMockSoundbite} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/50">
        
        {/* SMART SEARCH */}
        {activeTool === 'search' && (
          <div className="p-6 space-y-6 relative h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">AI FILTERS</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">^</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2"></span>Questions
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">14</span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>Metrics
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">50</span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-2"></span>Date & Time
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">26</span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span>Tasks
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">23</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">SENTIMENTS</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">^</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-300 mr-2"></span>Neutral
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">72%</span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>Positive
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">22%</span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <span className="flex items-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-300 mr-2"></span>Negative
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">6%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">SPEAKER TALKTIME</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">^</span>
              </div>
            </div>
            
            {/* Overlay for "Coming Soon" */}
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 transition-colors">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-900/50 text-center max-w-[200px]">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Smart Search</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon in a future update.</p>
              </div>
            </div>
          </div>
        )}

        {/* SOUNDBITES */}
        {activeTool === 'soundbites' && (
          <div className="h-full flex flex-col relative">
            {isSoundbitesLoading ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
            ) : soundbites && soundbites.length > 0 ? (
              <div className="p-6 space-y-4">
                {soundbites.map(sb => (
                  <div key={sb.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] font-medium text-gray-900 dark:text-gray-100">{sb.title}</span>
                      <span className="text-[12px] text-gray-400 dark:text-gray-500">
                        {Math.floor(sb.start_time / 60)}:{Math.floor(sb.start_time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-full h-8 bg-gray-50 dark:bg-gray-900 rounded flex items-center px-2 opacity-50">
                      <AudioLines className="w-4 h-4 text-indigo-400" />
                      <div className="h-1 bg-indigo-200 dark:bg-indigo-800 flex-1 ml-2 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <div className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-8 flex space-x-4 opacity-50 pointer-events-none">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-lg shrink-0"></div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
                
                <h4 className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-2">Clip out important moments</h4>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-8 px-4">
                  Pick your transcript or let Fireflies AI create it for you.
                </p>
                
                <button onClick={handleCreateMockSoundbite} className="w-full bg-indigo-600 text-white font-medium text-[13px] py-2.5 rounded-lg flex items-center justify-center mb-3 hover:bg-indigo-700 transition-colors shadow-sm">
                  <AudioLines className="w-4 h-4 mr-2" />
                  Create Soundbite
                </button>
                <button className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium text-[13px] py-2.5 rounded-lg flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-transparent dark:border-indigo-900/50">
                  <span className="mr-2 text-lg leading-none">✨</span>
                  AI Soundbite
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMMENTS */}
        {activeTool === 'comments' && (
          <div className="h-full flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm opacity-50 pointer-events-none mb-10 overflow-hidden">
                <div className="p-4 border-b border-gray-50 dark:border-gray-700/50 flex items-start space-x-3">
                  <div className="w-6 h-6 rounded bg-teal-400 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="flex space-x-2">
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded w-8"></div>
                    </div>
                    <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-full mt-2"></div>
                    <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="p-4 flex items-start space-x-3">
                  <div className="w-6 h-6 rounded bg-indigo-400 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="flex space-x-2">
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded w-8"></div>
                    </div>
                    <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-full mt-2"></div>
                  </div>
                </div>
              </div>

              {isCommentsLoading ? (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4 pb-24">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded bg-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {meeting.participants?.[0]?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm text-[13px] text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
                          {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                          {comment.timestamp !== null && comment.timestamp !== undefined && (
                            <span 
                              className="ml-2 text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                              onClick={() => onSeek(comment.timestamp as number)}
                            >
                              {Math.floor(comment.timestamp / 60)}:{Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center pb-24 mt-4">
                  <h4 className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-2">No discussion started yet</h4>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                    Bring your teammates, start threads and collaborate seamlessly
                  </p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 z-10 transition-colors">
              <form 
                onSubmit={handleAddComment} 
                className={`flex items-center w-full rounded-lg bg-white dark:bg-gray-900 ${
                  newComment.trim() 
                    ? 'border border-indigo-600 dark:border-indigo-500 p-1.5 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm' 
                    : 'space-x-3'
                }`}
              >
                {!newComment.trim() && (
                  <div className="w-8 h-8 rounded bg-teal-500 text-white flex items-center justify-center text-sm shrink-0">
                    {meeting.participants?.[0]?.name?.charAt(0) || 'U'}
                  </div>
                )}
                
                <div className={`flex items-center flex-1 ${!newComment.trim() ? 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-1.5' : ''}`}>
                  {newComment.trim() ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-[13px] pl-2 pr-2 shrink-0">
                      {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                    </span>
                  ) : null}
                  
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Comment..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] py-1 px-2 outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                  />
                  
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="w-7 h-7 rounded shrink-0 bg-indigo-100 dark:bg-indigo-900/50 text-white flex items-center justify-center disabled:bg-indigo-50 dark:disabled:bg-indigo-900/20 disabled:text-indigo-200 dark:disabled:text-indigo-800 bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 transition-colors ml-1"
                  >
                    <ArrowUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 disabled:text-indigo-300" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BOOKMARKS */}
        {activeTool === 'bookmarks' && (
          <div className="p-6 h-full flex flex-col items-center justify-center text-center">
            <div className="w-full space-y-4 mb-10 opacity-50 pointer-events-none">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div className="w-full">
                  <div className="flex items-center text-green-600 dark:text-green-400 mb-3 text-[13px] font-medium">
                    <Activity className="w-4 h-4 mr-2" /> Positive
                  </div>
                  <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-full mb-1.5"></div>
                  <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-3/4"></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                <div className="w-full">
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-3 text-[13px] font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Action Item
                  </div>
                  <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-full mb-1.5"></div>
                  <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            <h4 className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-2">No bookmarks yet</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed px-4">
              Add bookmarks to highlight key moments in the meeting.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
