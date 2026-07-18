'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Meeting } from '@/types';
import { Loader2, CheckCircle2, XCircle, Info, ChevronDown, Check } from 'lucide-react';
import { format, startOfWeek, endOfWeek, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

const DATE_PRESETS = [
  "All", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Custom date range"
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
];

export default function MeetingStatusPage() {
  const [datePreset, setDatePreset] = useState("All");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [status, setStatus] = useState("all");

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setIsStatusOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const queryParams = new URLSearchParams();

  if (status !== 'all') {
    queryParams.append('status', status);
  }

  if (datePreset !== 'All') {
    const today = new Date();
    if (datePreset === 'Today') {
      queryParams.append('date_from', startOfDay(today).toISOString());
      queryParams.append('date_to', endOfDay(today).toISOString());
    } else if (datePreset === 'Yesterday') {
      const yesterday = subDays(today, 1);
      queryParams.append('date_from', startOfDay(yesterday).toISOString());
      queryParams.append('date_to', endOfDay(yesterday).toISOString());
    } else if (datePreset === 'Last 7 days') {
      queryParams.append('date_from', startOfDay(subDays(today, 7)).toISOString());
    } else if (datePreset === 'Last 30 days') {
      queryParams.append('date_from', startOfDay(subDays(today, 30)).toISOString());
    } else if (datePreset === 'Custom date range') {
      if (customFrom) queryParams.append('date_from', startOfDay(new Date(customFrom)).toISOString());
      if (customTo) queryParams.append('date_to', endOfDay(new Date(customTo)).toISOString());
    }
  }

  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings-status', queryParams.toString()],
    queryFn: () => fetchApi(`/meetings/?${queryParams.toString()}`)
  });

  // Group meetings by week
  const groupedMeetings: Record<string, Meeting[]> = {};
  
  if (meetings) {
    meetings.forEach(meeting => {
      const date = parseISO(meeting.date);
      const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
      const end = endOfWeek(date, { weekStartsOn: 0 });
      
      const key = `${format(start, 'MMM d')} - ${format(end, 'MMM d')}${start.getFullYear() !== new Date().getFullYear() ? ` ${start.getFullYear()}` : ''}`;
      
      if (!groupedMeetings[key]) {
        groupedMeetings[key] = [];
      }
      groupedMeetings[key].push(meeting);
    });
  }

  const formatMeetingDate = (isoString: string) => {
    return format(parseISO(isoString), 'EEE, MMM d, hh:mm a');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfcfc] dark:bg-gray-900 transition-colors overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col pb-20 p-6 w-full">
        <div className="flex items-center space-x-4 text-sm mb-6 border-b border-gray-100 dark:border-gray-800 pb-2 relative z-50">
        
        {/* Date Dropdown */}
        <div className="relative" ref={dateRef}>
          <button 
            onClick={() => { setIsDateOpen(!isDateOpen); setIsStatusOpen(false); }}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {datePreset} <ChevronDown className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
          </button>
          {isDateOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-md py-1 z-50">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => { setDatePreset(preset); if (preset !== 'Custom date range') setIsDateOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group"
                >
                  {preset}
                  {datePreset === preset && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
              {datePreset === 'Custom date range' && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 mt-1 space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">From</label>
                    <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-full bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded p-1 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">To</label>
                    <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-full bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded p-1 text-xs" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <button 
            onClick={() => { setIsStatusOpen(!isStatusOpen); setIsDateOpen(false); }}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {STATUS_OPTIONS.find(o => o.value === status)?.label} <ChevronDown className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
          </button>
          {isStatusOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-md py-1 z-50">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setStatus(opt.value); setIsStatusOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  {opt.label}
                  {status === opt.value && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />
        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Feedback</button>
      </div>

      <div className="space-y-10 relative z-0">
        {isLoading && (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[var(--color-brand-500)] animate-spin mx-auto" />
          </div>
        )}
        
        {!isLoading && meetings?.length === 0 && (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            No meetings found for the selected filters.
          </div>
        )}

        {!isLoading && Object.entries(groupedMeetings).map(([week, weekMeetings]) => (
          <div key={week}>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-[15px] mb-4">{week}</h3>
            
            <div className="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
              {weekMeetings.map((meeting, index) => (
                <div 
                  key={meeting.id} 
                  className={`flex items-center justify-between p-4 ${index !== weekMeetings.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded bg-[#799955] text-white flex items-center justify-center font-bold text-lg">
                      {meeting.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{meeting.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatMeetingDate(meeting.date)} · Hosted by {meeting.participants?.find(p => p.role === 'host')?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {meeting.status === 'completed' ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Completed
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full">
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Not allowed in
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-12 h-12 bg-[var(--color-brand-700)] rounded-full text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-brand-800)]">
          <span className="text-2xl font-serif">?</span>
        </button>
      </div>
      </div>
    </div>
  );
}
