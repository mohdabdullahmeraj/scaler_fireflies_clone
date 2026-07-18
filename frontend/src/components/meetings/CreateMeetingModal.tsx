'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { X, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMeetingModal({ isOpen, onClose }: CreateMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [language, setLanguage] = useState('English (Global)');
  
  const queryClient = useQueryClient();
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create meeting
      const meeting = await fetchApi('/meetings/', {
        method: 'POST',
        body: JSON.stringify({
          title: title || 'Live Meeting Capture',
          date: new Date().toISOString(),
          duration_seconds: 1800, // Default 30m
          status: 'processing', // Since it's a live meeting capture
          meeting_type: 'external'
        })
      });

      return meeting;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onClose();
      router.push(`/status`); // Or `/meetings/${data.id}` if we want to show it immediately
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[560px] overflow-hidden flex flex-col m-4">
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-900">Add to live meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-7">
          {/* Name your meeting */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-900 mb-2">
              Name your meeting <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-[15px] focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-shadow placeholder-gray-400"
              placeholder="E.g. Product team sync"
            />
          </div>
          
          {/* Meeting Link */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-900 mb-1">Meeting link</label>
            <p className="text-[13px] text-gray-500 mb-2">
              Capture meetings from GMeet, Zoom, MS teams, and <a href="#" className="text-gray-600 underline hover:text-gray-900">more.</a>
            </p>
            <div className="flex border border-gray-200 rounded-md overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow">
              <div className="bg-gray-50 px-3 py-2 flex items-center justify-center border-r border-gray-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </div>
              <input 
                type="text" 
                value={meetingLink} 
                onChange={e => setMeetingLink(e.target.value)}
                className="flex-1 px-3 py-2 text-[15px] focus:outline-none placeholder-gray-400"
                placeholder="https://zoom.us/s/77277195107"
              />
            </div>
          </div>

          {/* Meeting language */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-900 mb-2">Meeting language</label>
            <div className="relative">
              <select 
                value={language} 
                onChange={e => setLanguage(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-[15px] text-gray-700 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-shadow appearance-none cursor-pointer"
              >
                <option value="English (Global)">English (Global)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-5 flex justify-end gap-3 bg-white mt-2">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-[14px] font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !meetingLink.trim()}
            className="px-5 py-2 text-[14px] font-medium text-white bg-[#8651f5] hover:bg-[#723eee] rounded-md transition-colors disabled:opacity-50 disabled:bg-[#d6c7ff] flex items-center gap-2 shadow-sm"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Start Capturing
          </button>
        </div>
      </div>
    </div>
  );
}
