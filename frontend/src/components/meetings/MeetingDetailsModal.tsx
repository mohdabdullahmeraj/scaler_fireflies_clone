import React, { useState } from 'react';
import { Meeting } from '@/types';
import { format, parseISO, addSeconds } from 'date-fns';
import { Video, Sparkles, Globe, Hash, Check, ChevronDown, ChevronUp, X, Calendar, Clock, FileText, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MeetingDetailsModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

const colors = [
  'bg-teal-500', 'bg-blue-400', 'bg-purple-500', 'bg-pink-500', 
  'bg-orange-400', 'bg-green-600', 'bg-yellow-500', 'bg-indigo-500'
];

const getAvatarColor = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

export function MeetingDetailsModal({ meeting, isOpen, onClose }: MeetingDetailsModalProps) {
  const [showAllInvited, setShowAllInvited] = useState(false);
  const [showAllAttended, setShowAllAttended] = useState(false);

  if (!isOpen || !meeting) return null;

  const dateObj = parseISO(meeting.date);
  const formattedDate = format(dateObj, "EEE, MMM d · h:mm a");
  
  const endTime = addSeconds(dateObj, meeting.duration_seconds || 1800);
  const timeRange = `${format(dateObj, "hh:mm a")} - ${format(endTime, "hh:mm a")}`;

  const host = meeting.participants?.find(p => p.role === 'host');
  const participants = meeting.participants || [];

  const invitedDisplayLimit = 3;
  const attendedDisplayLimit = 3;

  const visibleInvited = showAllInvited ? participants : participants.slice(0, invitedDisplayLimit);
  const visibleAttended = showAllAttended ? participants : participants.slice(0, attendedDisplayLimit);

  return (
    <div className="fixed inset-0 bg-gray-500/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 10px; }
      `}</style>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-[600px] max-w-[95vw] max-h-[80vh] overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start space-x-4">
            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shrink-0 bg-gray-50 dark:bg-gray-800">
              <Video className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">{meeting.title}</h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                {host ? host.name : 'Unknown Host'} · {formattedDate} · English (Global)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border border-transparent rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Summary Section */}
        {meeting.summary && (
          <div className="px-6 py-4 mx-6 mb-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-start space-x-3">
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[13px] leading-relaxed text-gray-700 dark:text-gray-300">
              {meeting.summary.short_summary || meeting.summary.overview}
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800"></div>

        {/* Details List */}
        <div className="p-6 space-y-6">
          
          {/* Privacy */}
          <div className="flex items-start">
            <div className="w-32 text-[13px] font-medium text-gray-900 dark:text-gray-100 shrink-0 mt-0.5">Privacy</div>
            <div className="flex items-center text-[13px] text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] font-medium">
              <Globe className="w-4 h-4 mr-2" />
              {meeting.privacy === 'anyone_with_link' ? 'Teammates & Anyone with Link' : (meeting.privacy || 'Teammates & Participants')}
            </div>
          </div>

          {/* Channels */}
          <div className="flex items-start">
            <div className="w-32 text-[13px] font-medium text-gray-900 dark:text-gray-100 shrink-0 mt-1.5">Channels</div>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-[13px] text-gray-600 dark:text-gray-400">
                  <Hash className="w-3.5 h-3.5 mr-1" /> All Meetings
                </span>
                <span className="flex items-center text-[13px] text-gray-600 dark:text-gray-400">
                  <Hash className="w-3.5 h-3.5 mr-1" /> Shared With Me
                </span>
              </div>
            </div>
          </div>

          {/* Invited */}
          <div className="flex items-start">
            <div className="w-32 text-[13px] font-medium text-gray-900 dark:text-gray-100 shrink-0 mt-1">Invited</div>
            <div className="flex-1 space-y-4">
              {visibleInvited.map(p => (
                <div key={p.email} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(p.name)}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200">{p.name}</span>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400">{p.email}{p.role === 'host' ? ' · Host' : ''}</span>
                  </div>
                </div>
              ))}
              
              {participants.length > invitedDisplayLimit && (
                <button 
                  onClick={() => setShowAllInvited(!showAllInvited)}
                  className="flex items-center text-[12.5px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium pt-1 transition-colors"
                >
                  {participants.length - invitedDisplayLimit} more 
                  {showAllInvited ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                </button>
              )}
            </div>
          </div>

          {/* Attended */}
          <div className="flex items-start pt-2">
            <div className="w-32 flex items-center text-[13px] font-medium text-gray-900 dark:text-gray-100 shrink-0">
              Attended
              <div className="ml-2 w-4 h-4 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-green-500 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {visibleAttended.map(p => (
                <div key={p.email} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(p.name)}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200">{p.name}</span>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400">{timeRange}</span>
                  </div>
                </div>
              ))}

              {participants.length > attendedDisplayLimit && (
                <button 
                  onClick={() => setShowAllAttended(!showAllAttended)}
                  className="flex items-center text-[12.5px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium pt-1 transition-colors"
                >
                  {participants.length - attendedDisplayLimit} more 
                  {showAllAttended ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end shrink-0">
          <Link 
            href={`/meetings/${meeting.id}`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center"
          >
            Open Full Meeting
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
