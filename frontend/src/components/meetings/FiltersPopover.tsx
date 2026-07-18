import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, User, Users, Clock, Mic, Eye } from 'lucide-react';

export interface FiltersState {
  hostedBy: string[];
  participants: string[];
  dateRange: { preset: string; from?: string; to?: string };
  duration: string;
  capturedFrom: string[];
  privacy: string[];
}

interface FiltersPopoverProps {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'hosted_by', label: 'Hosted by', icon: User },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'date_range', label: 'Date Range', icon: CalendarIcon },
  { id: 'duration', label: 'Duration', icon: Clock },
  { id: 'captured_from', label: 'Captured From', icon: Mic },
  { id: 'privacy', label: 'Privacy', icon: Eye },
];

const CAPTURED_FROM_OPTIONS = [
  "Meeting Notetaker", "Chrome Extension", "Mobile App", "Desktop App", "Uploads", "Voice Agent"
];

const PRIVACY_OPTIONS = [
  "Anyone with Link", "Teammates & Participants", "Only Teammates", "Only Participants", "Only Participants in Team", "Only Host"
];

const DURATION_OPTIONS = [
  "< 15 mins", "15 to 30 mins", "30 to 60 mins", "60 to 90 mins", "90+ mins"
];

const DATE_PRESETS = [
  "Any Time", "Today", "Last 7 Days", "Last 14 Days", "Last 30 Days"
];

// Mock lists for the UI to be robust
const MOCK_PEOPLE = [
  { name: "Mohd. Abdullah", email: "abdullah@example.com", initials: "MA", color: "bg-purple-400" },
  { name: "Participant 1", email: "p0_1@example.com", initials: "P1", color: "bg-teal-400" },
  { name: "Participant 2", email: "p1_1@example.com", initials: "P2", color: "bg-green-400" },
  { name: "Participant 3", email: "p2_1@example.com", initials: "P3", color: "bg-yellow-400" },
];

export function FiltersPopover({ filters, setFilters, isOpen, onClose }: FiltersPopoverProps) {
  const [activeTab, setActiveTab] = useState('hosted_by');
  const [searchHost, setSearchHost] = useState('');
  const [searchParticipant, setSearchParticipant] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckboxToggle = (category: keyof FiltersState, value: string) => {
    const current = filters[category] as string[];
    const isSelected = current.includes(value);
    
    setFilters({
      ...filters,
      [category]: isSelected ? current.filter(v => v !== value) : [...current, value]
    });
  };

  const clearAll = () => {
    setFilters({
      hostedBy: [],
      participants: [],
      dateRange: { preset: 'Any Time' },
      duration: '',
      capturedFrom: [],
      privacy: []
    });
  };

  return (
    <div 
      ref={popoverRef}
      className="absolute top-full mt-2 left-0 w-[600px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-gray-100 flex z-50 overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      {/* Left Sidebar */}
      <div className="w-[200px] bg-[#fdfdfd] border-r border-gray-100 flex flex-col p-2 py-3">
        <div className="flex-1 space-y-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-[13.5px] rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-50/50 text-[var(--color-brand-600)] font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-2.5 ${activeTab === tab.id ? 'text-[var(--color-brand-500)]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="px-3 pt-4 pb-1">
          <button 
            onClick={clearAll}
            className="px-3 py-1.5 text-[12.5px] font-medium text-gray-400 border border-gray-200 rounded hover:bg-gray-50 transition-colors w-max"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white p-5 overflow-y-auto">
        
        {/* Hosted By */}
        {activeTab === 'hosted_by' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-[280px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search host" 
                  value={searchHost}
                  onChange={(e) => setSearchHost(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-indigo-300"
                />
              </div>
              <button 
                onClick={() => setFilters({ ...filters, hostedBy: [] })}
                className="text-[13px] text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_PEOPLE.filter(p => p.email.includes(searchHost) || p.name.toLowerCase().includes(searchHost.toLowerCase())).map(person => (
                <label key={person.email} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded text-white flex items-center justify-center text-[11px] font-bold ${person.color}`}>
                      {person.initials}
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-700">{person.name}</div>
                      <div className="text-[12px] text-gray-400">{person.email}</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={filters.hostedBy.includes(person.email)}
                    onChange={() => handleCheckboxToggle('hostedBy', person.email)}
                    className="w-4 h-4 rounded-sm border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] cursor-pointer" 
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        {activeTab === 'participants' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-[280px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search participant" 
                  value={searchParticipant}
                  onChange={(e) => setSearchParticipant(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-indigo-300"
                />
              </div>
              <button 
                onClick={() => setFilters({ ...filters, participants: [] })}
                className="text-[13px] text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_PEOPLE.filter(p => p.email.includes(searchParticipant) || p.name.toLowerCase().includes(searchParticipant.toLowerCase())).map(person => (
                <label key={person.email} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded text-white flex items-center justify-center text-[11px] font-bold ${person.color}`}>
                      {person.initials}
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-700">{person.name}</div>
                      <div className="text-[12px] text-gray-400">{person.email}</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={filters.participants.includes(person.email)}
                    onChange={() => handleCheckboxToggle('participants', person.email)}
                    className="w-4 h-4 rounded-sm border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] cursor-pointer" 
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        {activeTab === 'date_range' && (
          <div className="space-y-4">
            {DATE_PRESETS.map(preset => (
              <label key={preset} className="flex items-center justify-between cursor-pointer">
                <span className="text-[14px] text-gray-700">{preset}</span>
                <input 
                  type="radio" 
                  name="date_range"
                  checked={filters.dateRange.preset === preset}
                  onChange={() => setFilters({ ...filters, dateRange: { preset } })}
                  className="w-4 h-4 border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] cursor-pointer" 
                />
              </label>
            ))}
            
            <div className="border-t border-gray-100 pt-4 mt-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[14px] text-gray-700">Custom Date Range</span>
                <CalendarIcon className="w-4 h-4 text-gray-400" />
              </label>
              
              {/* Native Date Pickers for Custom Range (visible when selected) */}
              <div className="mt-3 flex items-center space-x-2">
                <input 
                  type="date"
                  value={filters.dateRange.from || ''}
                  onChange={(e) => setFilters({ ...filters, dateRange: { preset: 'Custom Date Range', from: e.target.value, to: filters.dateRange.to } })}
                  className="flex-1 border border-gray-200 rounded p-1.5 text-[13px] text-gray-600 focus:outline-none focus:border-indigo-300"
                />
                <span className="text-gray-400 text-[12px]">to</span>
                <input 
                  type="date"
                  value={filters.dateRange.to || ''}
                  onChange={(e) => setFilters({ ...filters, dateRange: { preset: 'Custom Date Range', from: filters.dateRange.from, to: e.target.value } })}
                  className="flex-1 border border-gray-200 rounded p-1.5 text-[13px] text-gray-600 focus:outline-none focus:border-indigo-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Duration */}
        {activeTab === 'duration' && (
          <div className="space-y-4">
            {DURATION_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center justify-between cursor-pointer">
                <span className="text-[14px] text-gray-700">{opt}</span>
                <input 
                  type="radio" 
                  name="duration"
                  checked={filters.duration === opt}
                  onChange={() => setFilters({ ...filters, duration: opt })}
                  className="w-4 h-4 border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] cursor-pointer" 
                />
              </label>
            ))}
          </div>
        )}

        {/* Captured From */}
        {activeTab === 'captured_from' && (
          <div className="space-y-4">
            {CAPTURED_FROM_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center justify-between cursor-pointer group">
                <span className="text-[14px] text-gray-700">{opt}</span>
                <input 
                  type="checkbox" 
                  checked={filters.capturedFrom.includes(opt)}
                  onChange={() => handleCheckboxToggle('capturedFrom', opt)}
                  className="w-4 h-4 rounded-sm border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] cursor-pointer" 
                />
              </label>
            ))}
          </div>
        )}

        {/* Privacy */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            {PRIVACY_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center justify-between cursor-pointer group">
                <span className="text-[14px] text-gray-700">{opt}</span>
                <input 
                  type="checkbox" 
                  checked={filters.privacy.includes(opt)}
                  onChange={() => handleCheckboxToggle('privacy', opt)}
                  className="w-4 h-4 rounded-sm border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] cursor-pointer" 
                />
              </label>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
