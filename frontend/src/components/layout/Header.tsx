'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Mic, ChevronDown, Video, Loader2, X, Sun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { SearchResult } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreateMeetingModal } from '../meetings/CreateMeetingModal';
import { useTheme } from 'next-themes';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open search modal on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search on navigation
  useEffect(() => {
    setIsSearchFocused(false);
  }, [pathname]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetchApi(`/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length > 1,
  });

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchFocused) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchFocused]);

  return (
    <header className="h-16 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 relative z-50 transition-colors">
      {/* Search Bar Area (Dummy button) */}
      <div className="flex-1 flex items-center max-w-xl">
        <button 
          onClick={() => setIsSearchFocused(true)}
          className="relative w-full max-w-md flex items-center pl-3 pr-3 py-2 border border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm text-gray-400 transition-colors text-left"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="flex-1">Search by title or keyword</span>
          <span className="text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1.5 rounded text-gray-500 shadow-sm">Ctrl K</span>
        </button>
      </div>

      {/* Right Actions Area */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Capture</span>
          </button>
        </div>

        <button className="text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] p-1.5 rounded-full transition-colors border border-[var(--color-brand-200)]">
          <Mic className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
            title="Toggle theme"
          >
            {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
          </button>
        </div>

        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500 text-white font-medium text-sm">
          A
        </button>
      </div>

      <CreateMeetingModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Global Search Modal Overlay */}
      {isSearchFocused && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-gray-500/30 dark:bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchFocused(false)}>
          <div 
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 text-lg placeholder-gray-400"
                placeholder="Search across all your meetings..."
              />
              <button onClick={() => setIsSearchFocused(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 p-1 rounded-md text-xs font-semibold px-2">ESC</button>
            </div>
            
            {query.length > 1 && (
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="p-10 flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin" /> 
                    <span>Searching transcripts...</span>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/50">Meeting Results</div>
                    {searchResults.map((result) => (
                      <Link
                        key={result.meeting_id}
                        href={`/meetings/${result.meeting_id}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="block px-4 py-3 hover:bg-[var(--color-brand-50)] dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 group"
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[var(--color-brand-700)] dark:group-hover:text-[var(--color-brand-500)] transition-colors">{result.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: result.snippet }} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No results found</div>
                    <div className="text-sm">We couldn't find anything matching "{query}"</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
