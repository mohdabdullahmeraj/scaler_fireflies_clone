'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Meeting, ActionItem } from '@/types';
import { format, parseISO } from 'date-fns';
import { Loader2, Plus, Share, Check, MoreVertical, Trash2 } from 'lucide-react';

export default function TaskPage() {
  const queryClient = useQueryClient();
  const [addingTaskToMeeting, setAddingTaskToMeeting] = useState<number | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => fetchApi('/meetings/')
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: number) => fetchApi(`/action-items/${taskId}/toggle`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => fetchApi(`/action-items/${taskId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (meetingId: number) => fetchApi(`/meetings/${meetingId}/action-items/`, { 
      method: 'POST',
      body: JSON.stringify({ text: newTaskText, assignee: 'Mohd. A' })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setAddingTaskToMeeting(null);
      setNewTaskText('');
    }
  });

  const handleCreateTask = (meetingId: number) => {
    if (!newTaskText.trim()) return;
    createTaskMutation.mutate(meetingId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-500)]" />
      </div>
    );
  }

  // Filter out meetings that have no action items
  const meetingsWithTasks = (meetings || []).filter(m => m.action_items && m.action_items.length > 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfcfc] dark:bg-gray-900 transition-colors overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full pt-8 px-8 pb-24">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">All Tasks</h2>
          <button className="flex items-center text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
            <Share className="w-4 h-4 mr-1.5" />
            Share Feedback
          </button>
        </div>

        {/* Integration Banner */}
        <div className="bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between mb-6 shadow-sm cursor-not-allowed opacity-70">
          <div className="flex items-center">
            <div className="flex space-x-2 mr-4 opacity-50 grayscale">
              <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-[10px]">A</div>
              <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center text-[10px]">M</div>
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-[10px]">J</div>
              <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-[10px]">E</div>
            </div>
            <span className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">Automatically send all your tasks to your work apps.</span>
          </div>
          <button className="text-[14px] font-medium text-gray-400 cursor-not-allowed flex items-center">
            Connect <span className="text-[10px] ml-1.5 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">Coming Soon</span>
          </button>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetingsWithTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-[15px]">No tasks found.</div>
          ) : (
            meetingsWithTasks.map(meeting => (
              <div key={meeting.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#55cc99] text-white flex items-center justify-center font-bold text-lg mr-4 shadow-sm">
                      {meeting.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{meeting.title}</h4>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{format(parseISO(meeting.date), "EEE, MMM d, yyyy · h:mm a")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{meeting.action_items?.length || 0} Task{(meeting.action_items?.length || 0) !== 1 ? 's' : ''}</span>
                    <button className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </button>
                    <button className="text-gray-400 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                </div>
                
                {/* Action Items */}
                <div className="px-5 py-2">
                  {meeting.action_items?.map(task => (
                    <div key={task.id} className="group flex items-start py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        className="mt-0.5 mr-2 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      {/* Checkbox */}
                      <button 
                        onClick={() => toggleTaskMutation.mutate(task.id)}
                        className={`mt-0.5 w-[18px] h-[18px] rounded flex items-center justify-center border shrink-0 transition-colors ${
                          task.is_completed 
                            ? 'bg-[#55cc99] border-[#55cc99] text-white' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400'
                        }`}
                      >
                        {task.is_completed === 1 && <Check className="w-3 h-3" />}
                      </button>
                      
                      <div className="ml-3 flex-1">
                        <p className={`text-[14px] ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                          {task.text}
                        </p>
                      </div>
                      
                      <div className="ml-4 flex items-center space-x-2 shrink-0">
                        {task.assignee ? (
                          <div className="flex items-center space-x-1.5 text-[12px] text-gray-500 dark:text-gray-400">
                            <span>{task.assignee}</span>
                            <div className="w-5 h-5 rounded bg-[#0fa47f] text-white flex items-center justify-center font-semibold text-[10px]">
                              {task.assignee.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-[12px] text-gray-500 dark:text-gray-400">
                            <span>Mohd.</span>
                            <div className="w-5 h-5 rounded bg-[#0fa47f] text-white flex items-center justify-center font-semibold text-[10px]">
                              A
                            </div>
                          </div>
                        )}
                        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Inline Add Task Input */}
                  {addingTaskToMeeting === meeting.id && (
                    <div className="flex items-center py-3 pl-6 pr-2">
                      <div className="w-[18px] h-[18px] rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shrink-0 mr-3"></div>
                      <input 
                        type="text" 
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreateTask(meeting.id)}
                        autoFocus
                        placeholder="What needs to be done?"
                        className="flex-1 text-[14px] bg-transparent focus:outline-none border-b border-indigo-200 dark:border-indigo-800 pb-1 mr-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        disabled={createTaskMutation.isPending}
                      />
                      <button 
                        onClick={() => handleCreateTask(meeting.id)}
                        disabled={!newTaskText.trim() || createTaskMutation.isPending}
                        className="text-[13px] text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => { setAddingTaskToMeeting(null); setNewTaskText(''); }}
                        className="ml-2 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-700/50">
                  {!addingTaskToMeeting || addingTaskToMeeting !== meeting.id ? (
                    <button 
                      onClick={() => setAddingTaskToMeeting(meeting.id)}
                      className="flex items-center text-[13px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      New Task
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
