'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { X, Loader2 } from 'lucide-react';

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: number;
  initialTitle: string;
}

export function EditMeetingModal({ isOpen, onClose, meetingId, initialTitle }: EditMeetingModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      return fetchApi(`/meetings/${meetingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', String(meetingId)] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Edit Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          />
        </div>

        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !title}
            className="px-3 py-1.5 text-sm font-medium text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
