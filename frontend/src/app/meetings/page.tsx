'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Meeting } from '@/types';
import { useRouter } from 'next/navigation';
import { Search, Filter, Loader2, Hash, Users, Bot, Plus, MessageSquare, MoreHorizontal, ChevronRight, X } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import Link from 'next/link';
import { FiltersPopover, FiltersState } from '@/components/meetings/FiltersPopover';
import { MeetingDetailsModal } from '@/components/meetings/MeetingDetailsModal';
import { UploadModal } from '@/components/meetings/UploadModal';

const CURRENT_USER_EMAIL = 'abdullah@example.com'; // Mocked current user

export default function MeetingsLibraryPage() {
  const [activeChannel, setActiveChannel] = useState<'my_meetings' | 'all_meetings'>('all_meetings');
  const [activeTopLevel, setActiveTopLevel] = useState<'all' | 'hosted' | 'shared'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMeetingForDetails, setSelectedMeetingForDetails] = useState<Meeting | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    hostedBy: [],
    participants: [],
    dateRange: { preset: 'Any Time' },
    duration: '',
    capturedFrom: [],
    privacy: []
  });

  // Build query parameters
  const queryParams = new URLSearchParams();
  
  const hostedByEmails = new Set(filters.hostedBy);

  if (activeChannel === 'my_meetings' || activeTopLevel === 'hosted') {
    hostedByEmails.add(CURRENT_USER_EMAIL);
  }

  if (activeTopLevel === 'shared') {
    queryParams.append('shared_with', CURRENT_USER_EMAIL);
  }

  if (searchQuery) queryParams.append('search', searchQuery);

  hostedByEmails.forEach(email => queryParams.append('hosted_by', email));
  filters.participants.forEach(email => queryParams.append('participants', email));
  filters.capturedFrom.forEach(source => queryParams.append('captured_from', source));
  filters.privacy.forEach(priv => queryParams.append('privacy', priv));

  // Duration mapping
  if (filters.duration === '< 15 mins') { queryParams.append('duration_max', '900'); }
  else if (filters.duration === '15 to 30 mins') { queryParams.append('duration_min', '900'); queryParams.append('duration_max', '1800'); }
  else if (filters.duration === '30 to 60 mins') { queryParams.append('duration_min', '1800'); queryParams.append('duration_max', '3600'); }
  else if (filters.duration === '60 to 90 mins') { queryParams.append('duration_min', '3600'); queryParams.append('duration_max', '5400'); }
  else if (filters.duration === '90+ mins') { queryParams.append('duration_min', '5400'); }

  // Date Range mapping
  if (filters.dateRange.preset !== 'Any Time') {
    const today = new Date();
    // Using startOfDay so that we include meetings that happened earlier today or earlier on that specific day
    const { startOfDay, endOfDay } = require('date-fns');
    
    if (filters.dateRange.preset === 'Today') {
      queryParams.append('date_from', startOfDay(today).toISOString());
    } else if (filters.dateRange.preset === 'Last 7 Days') {
      queryParams.append('date_from', startOfDay(subDays(today, 7)).toISOString());
    } else if (filters.dateRange.preset === 'Last 14 Days') {
      queryParams.append('date_from', startOfDay(subDays(today, 14)).toISOString());
    } else if (filters.dateRange.preset === 'Last 30 Days') {
      queryParams.append('date_from', startOfDay(subDays(today, 30)).toISOString());
    } else if (filters.dateRange.preset === 'Custom Date Range') {
      if (filters.dateRange.from) queryParams.append('date_from', startOfDay(new Date(filters.dateRange.from)).toISOString());
      if (filters.dateRange.to) queryParams.append('date_to', endOfDay(new Date(filters.dateRange.to)).toISOString());
    }
  }

  const { data: meetings, isLoading, error } = useQuery<Meeting[]>({
    queryKey: ['meetings', queryParams.toString()],
    queryFn: () => fetchApi(`/meetings/?${queryParams.toString()}`)
  });

  // Group meetings by Date
  const groupedMeetings = (meetings || []).reduce((acc, meeting) => {
    const dateObj = parseISO(meeting.date);
    const dateStr = format(dateObj, "EEE, MMM d, yyyy");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);

  const getHostName = (meeting: Meeting) => {
    const host = meeting.participants?.find(p => p.role === 'host');
    return host ? host.name : 'Unknown Host';
  };

  const hasActiveFilters = Object.values(filters).some(val => {
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object' && val.preset) return val.preset !== 'Any Time';
    return val !== '';
  });

  return (
    <div className="h-full flex bg-white dark:bg-gray-900 overflow-hidden">
      
      {/* Inner Sidebar: Channels */}
      <div className="w-[260px] border-r border-gray-100 dark:border-gray-800 flex flex-col bg-[#fcfcfc] dark:bg-gray-900 shrink-0 transition-colors">
        <div className="p-4">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search channels" 
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-[13px] focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all placeholder-gray-400 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 space-y-0.5 mb-6">
            <button 
              onClick={() => setActiveChannel('my_meetings')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-[13.5px] transition-colors ${
                activeChannel === 'my_meetings' 
                  ? 'bg-indigo-50/60 dark:bg-indigo-900/30 text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <Hash className={`w-4 h-4 mr-2.5 ${activeChannel === 'my_meetings' ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)]' : 'text-gray-400'}`} />
              My Meetings
            </button>
            <button 
              onClick={() => setActiveChannel('all_meetings')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-[13.5px] transition-colors ${
                activeChannel === 'all_meetings' 
                  ? 'bg-indigo-50/60 dark:bg-indigo-900/30 text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <Users className={`w-4 h-4 mr-2.5 ${activeChannel === 'all_meetings' ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)]' : 'text-gray-400'}`} />
              All Meetings
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-400 cursor-not-allowed rounded-md font-medium text-[13.5px] transition-colors">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2.5 text-gray-300" />
                Voice Agent Meetings
              </div>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">Coming Soon</span>
            </button>
          </div>

          <div className="px-5 mb-2">
            <h3 className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">All channels</h3>
          </div>
          
          <div className="px-5 py-6 text-center mt-4">
            <div className="w-8 h-8 mx-auto bg-pink-100/50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-3">
              <Hash className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed px-2">
              Create channels to organize your conversations
            </p>
            <button className="inline-flex items-center px-4 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[13px] font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Channel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 relative transition-colors">
        
        {/* Top Filter Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 relative z-40">
          <div className="flex items-center space-x-2">
            {/* Top-Level Toggles */}
            <button 
              onClick={() => setActiveTopLevel(activeTopLevel === 'hosted' ? 'all' : 'hosted')}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md shadow-sm transition-colors border ${
                activeTopLevel === 'hosted' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Hosted by me
            </button>
            <button 
              onClick={() => setActiveTopLevel(activeTopLevel === 'shared' ? 'all' : 'shared')}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md shadow-sm transition-colors border ${
                activeTopLevel === 'shared' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Shared with me
            </button>
            
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
            
            {/* Filters Button with Popover */}
            <div className="relative">
              <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md shadow-sm transition-colors flex items-center border ${
                  hasActiveFilters 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-200 text-[10px] text-indigo-800">
                    {filters.hostedBy.length + filters.participants.length + filters.capturedFrom.length + filters.privacy.length + (filters.duration ? 1 : 0) + (filters.dateRange.preset !== 'Any Time' ? 1 : 0)}
                  </span>
                )}
              </button>
              
              <FiltersPopover 
                filters={filters} 
                setFilters={setFilters} 
                isOpen={isFiltersOpen} 
                onClose={() => setIsFiltersOpen(false)} 
              />
            </div>
            
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
            
            {/* New Meeting Button */}
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 text-[13px] font-medium rounded-md shadow-sm transition-colors flex items-center bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Meeting
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSearchOpen ? (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meetings..." 
                  className="pl-8 pr-8 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-[13px] focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-500 w-64 shadow-sm transition-all text-gray-900 dark:text-gray-100"
                />
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Meetings List */}
        <div className="flex-1 overflow-y-auto p-6 relative z-0">
          <div className="max-w-4xl space-y-8">
            
            {isLoading && (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 text-[var(--color-brand-500)] animate-spin mx-auto" />
              </div>
            )}
            
            {!isLoading && Object.keys(groupedMeetings).length === 0 && (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                No meetings found matching your filters.
              </div>
            )}

            {!isLoading && Object.entries(groupedMeetings).map(([dateStr, dayMeetings]) => (
              <div key={dateStr}>
                
                {/* Date Group Header */}
                <div className="flex items-center justify-between mb-3 pl-1">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-[14px] h-[14px] rounded-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)] cursor-pointer" />
                    <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{dateStr}</span>
                  </div>
                  <button className="flex items-center text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <MessageSquare className="w-3 h-3 mr-1.5" />
                    Feedback
                  </button>
                </div>

                {/* Day's Meetings */}
                <div className="space-y-2">
                  {dayMeetings.map(meeting => (
                    <div key={meeting.id} className="flex items-center space-x-3 group">
                      <div className="pl-1 shrink-0">
                        <input type="checkbox" className="w-[14px] h-[14px] rounded-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <Link 
                        href={`/meetings/${meeting.id}`}
                        className="flex-1 flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center space-x-4 overflow-hidden">
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg bg-[#55cc99] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm relative">
                            {meeting.title.charAt(0).toUpperCase()}
                            {/* Participants Indicator */}
                            {meeting.participants && meeting.participants.length > 1 && (
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[9px] font-bold">
                                  +{meeting.participants.length - 1}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="min-w-0">
                            <h4 className="text-[14.5px] font-semibold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors truncate">
                              {meeting.title}
                              <ChevronRight className="w-3.5 h-3.5 ml-1 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </h4>
                            <div className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center">
                              {format(parseISO(meeting.date), "MMM d, yyyy · h:mm a")} 
                              <span className="mx-1.5">·</span>
                              {Math.round(meeting.duration_seconds / 60)} min
                              <span className="mx-1.5">·</span>
                              Hosted by <span className="font-medium text-gray-600 dark:text-gray-300 ml-1">{getHostName(meeting)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4 shrink-0">
                          <button 
                            onClick={(e) => { e.preventDefault(); setSelectedMeetingForDetails(meeting); }}
                            className="px-3 py-1.5 text-[12px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors bg-white dark:bg-gray-800 flex items-center"
                          >
                            Details
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                
              </div>
            ))}

          </div>
        </div>
      </div>
      
      {/* Details Modal */}
      <MeetingDetailsModal 
        meeting={selectedMeetingForDetails} 
        isOpen={!!selectedMeetingForDetails} 
        onClose={() => setSelectedMeetingForDetails(null)} 
      />

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}

