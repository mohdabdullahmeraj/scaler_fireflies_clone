import React, { useState } from 'react';
import { Meeting } from '@/types';
import { format, parseISO } from 'date-fns';
import { Video, Copy, Maximize2, Minimize2, Sparkles, ArrowRight, Activity, HelpCircle, CheckCircle2, X, Pencil, Plus } from 'lucide-react';
import { fetchApi } from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';

interface NotesPanelProps {
  meeting: Meeting;
  onSeek?: (time: number) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function NotesPanel({ meeting, onSeek, isExpanded, onToggleExpand }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'ai'>('notes');
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');
  const [newItemText, setNewItemText] = useState('');

  const host = meeting.participants?.find(p => p.role === 'host') || meeting.participants?.[0];
  const dateObj = meeting.date ? parseISO(meeting.date) : new Date();
  
  let outline: any[] = [];
  try {
    if (meeting.summary?.outline) {
      outline = JSON.parse(meeting.summary.outline);
    }
  } catch(e) {}

  const toggleActionItem = async (id: number) => {
    try {
      await fetchApi(`/action-items/${id}/toggle`, { method: 'PATCH' });
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch (e) { console.error(e); }
  };

  const saveActionItem = async (id: number) => {
    try {
      await fetchApi(`/action-items/${id}`, { 
        method: 'PATCH',
        body: JSON.stringify({ text: editItemText })
      });
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch (e) { console.error(e); }
  };

  const addActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    try {
      await fetchApi(`/meetings/${meeting.id}/action-items/`, { 
        method: 'POST',
        body: JSON.stringify({ text: newItemText, assignee: 'Unassigned' })
      });
      setNewItemText('');
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden relative transition-colors">
      {/* Tabs */}
      <div className="flex items-center justify-center space-x-2 py-4 border-b border-gray-100 dark:border-gray-800 px-6 shrink-0 relative bg-white dark:bg-gray-900 z-10 transition-colors">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'notes' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Notes
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'ai' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            AI Skills · 0
          </button>
        </div>
        <button onClick={onToggleExpand} className="absolute right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pb-32">
        {activeTab === 'notes' ? (
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Title and Meta */}
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {meeting.title}
                </h1>
                <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </button>
              </div>
              
              <div className="flex items-center text-[13px] text-gray-500 dark:text-gray-400 mt-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[10px] mr-2">
                    {host?.name.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <span>{host?.name || 'Unknown'}</span>
                  <span className="mx-1 text-gray-400 dark:text-gray-500">+{Math.max(0, (meeting.participants?.length || 0) - 1)}</span>
                </div>
                <span className="mx-2">·</span>
                <span>{format(dateObj, "MMM d yyyy, h:mm a")}</span>
                <span className="mx-2">·</span>
                <span>English (Global)</span>
              </div>
            </div>

            {/* General Summary */}
            {meeting.summary && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">
                  <SparklesIcon className="w-4 h-4 text-indigo-400" />
                  <span>General Summary</span>
                  <button className="ml-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed pl-6">
                  <p>{meeting.summary.overview}</p>
                </div>

                <div className="pt-4">
                  <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes</h3>
                  <div className="space-y-6 text-[14px] text-gray-700 dark:text-gray-300 pl-6">
                    {outline.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {section.title} <span onClick={() => onSeek?.(section.timestamp)} className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-normal">({formatTimestamp(section.timestamp)})</span>
                        </h4>
                        {section.points && (
                          <ul className="list-disc pl-5 space-y-1">
                            {section.points.map((pt: string, ptIdx: number) => (
                              <li key={ptIdx}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Items */}
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Action items</h3>
              
              <div className="space-y-4">
                <ul className="space-y-2 text-[14px] text-gray-700 dark:text-gray-300">
                  {meeting.action_items?.map((ai) => (
                    <li key={ai.id} className="flex items-start group space-x-2">
                      <input 
                        type="checkbox" 
                        checked={!!ai.is_completed}
                        onChange={() => toggleActionItem(ai.id)}
                        className="mt-1 w-[14px] h-[14px] rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 cursor-pointer" 
                      />
                      {editingItem === ai.id ? (
                        <div className="flex-1 flex items-center space-x-1">
                          <input 
                            autoFocus
                            type="text"
                            value={editItemText}
                            onChange={e => setEditItemText(e.target.value)}
                            className="flex-1 border border-indigo-300 dark:border-indigo-600 bg-transparent rounded px-2 py-0.5 text-sm focus:outline-none focus:border-indigo-500"
                            onKeyDown={(e) => e.key === 'Enter' && saveActionItem(ai.id)}
                          />
                          <button onClick={() => saveActionItem(ai.id)} className="text-green-600 dark:text-green-400 p-1 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => setEditingItem(null)} className="text-red-600 dark:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start justify-between">
                          <span className={ai.is_completed ? 'line-through text-gray-400 dark:text-gray-600' : ''}>
                            {ai.text}
                            {ai.timestamp ? (
                              <span onClick={() => onSeek?.(ai.timestamp || 0)} className="text-blue-500 dark:text-blue-400 hover:underline cursor-pointer ml-1">({formatTimestamp(ai.timestamp || 0)})</span>
                            ) : null}
                          </span>
                          <button 
                            onClick={() => { setEditingItem(ai.id); setEditItemText(ai.text); }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                
                <form onSubmit={addActionItem} className="flex items-center space-x-2 pt-2">
                  <div className="w-[14px] h-[14px] border border-gray-300 dark:border-gray-600 rounded-sm shrink-0 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                  </div>
                  <input 
                    type="text"
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    placeholder="Add an action item..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                  />
                  {newItemText && <button type="submit" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300">Add</button>}
                </form>
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-8 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              Extract specific insights from this meeting <Sparkles className="w-5 h-5 ml-2 text-yellow-500 fill-current" />
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] mb-10 text-center max-w-lg">
              AI skills analyze your conversations to surface specific insights that's relevant to you.
            </p>

            <div className="w-full bg-[#F4FDF9] dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-50 dark:border-emerald-900/20 relative transition-colors">
              <div className="absolute -top-3 right-6 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded shadow-sm">
                Coming soon
              </div>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100/50 dark:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-400 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Onboarding Experience</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500 font-medium">
                    <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> 6.7k</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold cursor-not-allowed">Run</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100/50 dark:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Onboarding Challenges</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500 font-medium">
                    <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> 22.6k</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold cursor-not-allowed">Run</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100/50 dark:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-400 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Onboarding FAQs</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500 font-medium">
                    <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> 9.9k</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold cursor-not-allowed">Run</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-2">
                <button className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  200+ AI Skills <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <span className="text-gray-400 dark:text-gray-500 text-[13px]">Consumes AI credits</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
