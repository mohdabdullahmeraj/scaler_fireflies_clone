'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { ActionItem } from '@/types';
import { CheckCircle2, Circle, Loader2, Calendar, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActionItemsListProps {
  meetingId: number;
}

export function ActionItemsList({ meetingId }: ActionItemsListProps) {
  const queryClient = useQueryClient();
  const [newTaskText, setNewTaskText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState('');

  const { data: items = [], isLoading } = useQuery<ActionItem[]>({
    queryKey: ['actionItems', meetingId],
    queryFn: () => fetchApi(`/meetings/${meetingId}/action-items/`),
  });

  const toggleMutation = useMutation({
    mutationFn: (itemId: number) => fetchApi(`/action-items/${itemId}/toggle`, { method: 'PATCH' }),
    // Optimistic Update
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['actionItems', meetingId] });
      const previousItems = queryClient.getQueryData<ActionItem[]>(['actionItems', meetingId]);
      
      queryClient.setQueryData<ActionItem[]>(['actionItems', meetingId], (old) => 
        old?.map(item => item.id === itemId ? { ...item, is_completed: item.is_completed === 1 ? 0 : 1 } : item)
      );
      
      return { previousItems };
    },
    onError: (err, itemId, context) => {
      queryClient.setQueryData(['actionItems', meetingId], context?.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems', meetingId] });
    }
  });

  const addMutation = useMutation({
    mutationFn: (text: string) => fetchApi(`/meetings/${meetingId}/action-items/`, { 
      method: 'POST',
      body: JSON.stringify({ text, assignee: 'me', is_completed: 0 })
    }),
    onSuccess: () => {
      setNewTaskText('');
      queryClient.invalidateQueries({ queryKey: ['actionItems', meetingId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => fetchApi(`/action-items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionItems', meetingId] })
  });

  const editMutation = useMutation({
    mutationFn: ({ id, text }: { id: number, text: string }) => fetchApi(`/action-items/${id}`, { 
      method: 'PATCH',
      body: JSON.stringify({ text })
    }),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['actionItems', meetingId] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No action items found for this meeting.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add New Task */}
      <form 
        onSubmit={(e) => { e.preventDefault(); if (newTaskText) addMutation.mutate(newTaskText); }}
        className="flex items-center gap-2 mb-6 bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
      >
        <Plus className="w-5 h-5 text-gray-400 ml-2" />
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new action item..."
          className="flex-1 text-sm border-none focus:ring-0 py-1.5"
          disabled={addMutation.isPending}
        />
        <button 
          type="submit"
          disabled={!newTaskText || addMutation.isPending}
          className="px-3 py-1.5 text-xs font-medium bg-[var(--color-brand-50)] text-[var(--color-brand-700)] rounded-md hover:bg-[var(--color-brand-100)] disabled:opacity-50"
        >
          {addMutation.isPending ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className="group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors shadow-sm relative"
          >
            <button 
              onClick={() => toggleMutation.mutate(item.id)}
              className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
            >
              {item.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              {editingId === item.id ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input 
                    type="text" 
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    className="flex-1 text-sm border border-[var(--color-brand-300)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
                    autoFocus
                  />
                  <button onClick={() => editMutation.mutate({ id: item.id, text: editTaskText })} className="text-green-600 p-1 hover:bg-green-50 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className={cn(
                  "text-sm mt-0.5",
                  item.is_completed ? "text-gray-500 line-through" : "text-gray-900 font-medium"
                )}>
                  {item.text}
                </p>
              )}
              
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {item.assignee && (
                  <span className="flex items-center gap-1 font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)] px-2 py-0.5 rounded-full">
                    @{item.assignee}
                  </span>
                )}
                
                {item.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(parseISO(item.due_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            {/* Hover Actions */}
            {editingId !== item.id && (
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white pl-2">
                <button 
                  onClick={() => { setEditingId(item.id); setEditTaskText(item.text); }}
                  className="p-1.5 text-gray-400 hover:text-[var(--color-brand-600)] rounded hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
