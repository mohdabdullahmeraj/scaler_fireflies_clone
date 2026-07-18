import React, { useState } from 'react';
import { Meeting } from '@/types';
import { Pencil, Check, X, Trash2, Bot, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

export function MeetingHeader({ meeting }: { meeting: Meeting }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const queryClient = useQueryClient();
  const router = useRouter();

  const updateTitleMutation = useMutation({
    mutationFn: (newTitle: string) => fetchApi(`/meetings/${meeting.id}/title`, {
      method: 'PUT',
      body: JSON.stringify({ title: newTitle }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setIsEditing(false);
    }
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: () => fetchApi(`/meetings/${meeting.id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      router.push('/meetings');
    }
  });

  const handleSave = () => {
    if (title.trim() && title !== meeting.title) {
      updateTitleMutation.mutate(title);
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      deleteMeetingMutation.mutate();
    }
  };

  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors">
      <div className="flex flex-col min-w-0 mr-4">
        {isEditing ? (
          <div className="flex items-center space-x-1">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="border border-indigo-300 dark:border-indigo-600 rounded px-2 py-0.5 text-gray-900 dark:text-gray-100 bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 text-lg font-semibold"
              autoFocus
            />
            <button onClick={handleSave} className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setIsEditing(false); setTitle(meeting.title); }} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center group space-x-2">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate max-w-xl">{meeting.title}</h1>
            <button onClick={() => setIsEditing(true)} className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity p-0.5">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="text-[13px] text-gray-500 dark:text-gray-400 flex items-center truncate mt-0.5">
          <Link href="/meetings" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">#My Meetings</Link>
          <span className="mx-2">·</span>
          <span>{format(parseISO(meeting.date), "MMM d, yyyy · h:mm a")}</span>
          <span className="mx-2 border-l border-gray-300 dark:border-gray-600 h-3"></span>
          <span>English (Global)</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 shrink-0">
        <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
          <Share2 className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          Share
        </button>
        <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors border border-transparent" title="Delete Meeting">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
