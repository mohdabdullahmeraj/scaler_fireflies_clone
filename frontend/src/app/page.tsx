'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { Meeting } from '@/types';
import { Loader2, MessageSquare, Calendar, CheckSquare, Hash, Mail, ArrowRight, ChevronDown, Mic, Settings, Rss } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { CreateMeetingModal } from '@/components/meetings/CreateMeetingModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'recent' | 'upcoming'>('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => fetchApi('/meetings/')
  });

  // Take top 4 meetings
  const recentMeetings = meetings ? meetings.slice(0, 4) : [];

  const formatMeetingDate = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, 'MMM dd · h:mm a');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 relative overflow-y-auto transition-colors">
      {/* Background Gradient Header */}
      <div 
        className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-r from-blue-100/50 via-indigo-50/50 to-orange-50/50 pointer-events-none" 
        style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)' }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full pt-10 px-8 pb-24">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-semibold text-gray-900 dark:text-white tracking-tight">Good Evening, Mohd. Abdullah 🌙</h1>
          <button className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </button>
        </div>

        {/* Personal Assistant toggle */}
        <div className="flex items-center mb-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <span className="flex items-center mr-3">
            <Settings className="w-4 h-4 mr-1.5" /> Personal Assistant
          </span>
          <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-not-allowed opacity-60">
            <div className="w-3.5 h-3.5 bg-white dark:bg-gray-300 rounded-full absolute top-[1px] left-[1px] shadow-sm" />
          </div>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 relative z-10">
          <div className="bg-white/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm cursor-not-allowed flex flex-col items-start grayscale-[0.2] opacity-70">
            <div className="w-9 h-9 rounded-xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-4">
              <Rss className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Daily Digest <span className="text-gray-400 dark:text-gray-500 font-normal">(OFF)</span></div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400"><span className="text-indigo-600/80 dark:text-indigo-400/80 font-medium">Enable</span> to view it. <span className="ml-1 text-[10px] bg-gray-200/80 dark:bg-gray-700/80 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">Coming Soon</span></div>
          </div>
          
          <div className="bg-white/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm cursor-not-allowed flex flex-col items-start grayscale-[0.2] opacity-70">
            <div className="w-9 h-9 rounded-xl bg-pink-100/80 dark:bg-pink-900/40 text-pink-500 dark:text-pink-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Meeting Prep <span className="text-gray-400 dark:text-gray-500 font-normal">(OFF)</span></div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400"><span className="text-indigo-600/80 dark:text-indigo-400/80 font-medium">Enable</span> to view it. <span className="ml-1 text-[10px] bg-gray-200/80 dark:bg-gray-700/80 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">Coming Soon</span></div>
          </div>
          
          <Link href="/task" className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow relative flex flex-col items-start block">
            <div className="w-9 h-9 rounded-xl bg-[#c5e638] dark:bg-[#c5e638]/20 text-[#55690b] dark:text-[#c5e638] flex items-center justify-center mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Tasks</div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">0 New tasks</div>
          </Link>
        </div>

        {/* Integration Banner */}
        <div className="bg-[#f8f9fc] dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center mb-10 opacity-70 cursor-not-allowed">
          <div className="flex -space-x-2 mr-5">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-50 dark:border-gray-600 flex items-center justify-center z-10"><Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-50 dark:border-gray-600 flex items-center justify-center"><Mail className="w-5 h-5 text-red-500 dark:text-red-400" /></div>
          </div>
          <div className="flex-1 text-[14px] text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-200">Connect Slack and Email</span> — get richer insights with full context. <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-medium text-gray-600 dark:text-gray-400">Coming Soon</span>
          </div>
          <div className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center">
            Connect <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* Meetings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-1.5 text-[15px] font-medium rounded-md transition-colors ${activeTab === 'recent' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                Recent
              </button>
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-1.5 text-[15px] font-medium rounded-md transition-colors ${activeTab === 'upcoming' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                Upcoming
              </button>
              <button className="px-4 py-1.5 text-[15px] font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed flex items-center">
                AI Feed <span className="text-[10px] ml-1.5 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">Coming Soon</span>
              </button>
            </div>
            <button className="flex items-center text-[14px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
              <Settings className="w-4 h-4 mr-1.5" />
              Settings
            </button>
          </div>

          {activeTab === 'recent' ? (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-500)]" /></div>
              ) : (
                <div className="space-y-1 mb-6">
                  {recentMeetings.map((meeting) => (
                    <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="flex items-center p-3 -mx-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                      <div className="w-11 h-11 rounded-lg bg-[#f0a775] text-white flex items-center justify-center font-bold text-[19px] mr-4 shrink-0 shadow-sm">
                        {meeting.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors">{meeting.title}</h4>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{formatMeetingDate(meeting.date)}</p>
                      </div>
                    </Link>
                  ))}
                  {recentMeetings.length === 0 && (
                    <div className="text-[15px] text-gray-500 dark:text-gray-400 py-6 text-center">No recent meetings found.</div>
                  )}
                </div>
              )}

              <Link href="/meetings" className="inline-flex items-center text-[14px] font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                View More <ChevronDown className="w-4 h-4 ml-1" />
              </Link>
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-[300px] h-20 mb-8 relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex items-start p-5">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-4 shrink-0" />
                <div className="space-y-3 flex-1 pt-1">
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-[140px]"></div>
                  <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded-full w-[80px]"></div>
                </div>
              </div>
              <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100 mb-2">No upcoming meeting scheduled</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[14px] max-w-sm mb-8 leading-relaxed">
                Schedule a meeting on your calendar or transcribe a live meeting.
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[var(--color-brand-600)] text-white px-12 py-2.5 rounded-md font-medium text-[15px] flex items-center shadow-sm hover:bg-[var(--color-brand-700)] transition-colors"
              >
                + Capture
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-8 left-[240px] right-0 flex justify-center pointer-events-none z-20">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 px-5 py-3.5 flex items-center w-full max-w-2xl opacity-60 pointer-events-auto cursor-not-allowed transition-colors">
          <input type="text" placeholder="Type / to run AI skills (Coming Soon)" disabled className="flex-1 bg-transparent focus:outline-none text-[15px] placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed text-gray-900 dark:text-gray-100" />
          <div className="flex space-x-3 ml-4 items-center">
            <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Mic className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 rounded-md flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
      
      <CreateMeetingModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
