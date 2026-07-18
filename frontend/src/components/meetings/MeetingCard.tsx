import React from 'react';
import { Meeting } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import { Video, Mic, Share2, MoreVertical, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import Link from 'next/link';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  // Use first letter of title for placeholder
  const initial = meeting.title.charAt(0).toUpperCase();

  return (
    <Link 
      href={`/meetings/${meeting.id}`}
      className="block group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[var(--color-brand-400)] hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-lg flex-shrink-0">
              {initial}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-brand-600)] transition-colors line-clamp-1" title={meeting.title}>
                {meeting.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(meeting.date)}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {meeting.tags.map((tag) => (
            <Badge key={tag.id} variant="outline" size="sm" style={{ color: tag.color, borderColor: `${tag.color}40` }}>
              {tag.name}
            </Badge>
          ))}
          {meeting.tags.length === 0 && (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer info */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(meeting.duration_seconds)}
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5" />
              {meeting.participants.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {meeting.status === 'completed' && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </span>
            )}
            {meeting.status === 'processing' && (
              <span className="flex items-center gap-1 text-orange-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Processing
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
