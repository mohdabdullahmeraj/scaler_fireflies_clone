'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Bot,
  Video,
  Activity,
  Upload,
  Layers,
  BarChart2,
  Users,
  Settings,
  MoreHorizontal,
  Lock,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/meetings')) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [pathname]);

  return (
    <aside className={cn(
      "h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0 transition-all duration-300",
      isCollapsed ? "w-[72px]" : "w-[240px]"
    )}>
      <div className="h-16 flex items-center px-4 justify-between border-b border-transparent shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 text-xl font-bold tracking-tight overflow-hidden text-gray-900 dark:text-gray-100">
            <div className="w-6 h-6 bg-[var(--color-brand-600)] rounded-sm flex items-center justify-center shrink-0">
               <div className="w-3 h-3 border-[1.5px] border-white rounded-[2px]" />
            </div>
            <span>fireflies.ai</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("w-6 h-6 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 shrink-0 transition-colors", isCollapsed && "mx-auto")}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 overflow-x-hidden">
        <NavItem href="/" icon={<Home className="w-5 h-5" />} label="Home" active={pathname === '/'} isCollapsed={isCollapsed} />
        <NavItem href="#" disabled icon={<Bot className="w-5 h-5" />} label="AskFred" rightAccessory={<span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded whitespace-nowrap">Coming Soon</span>} isCollapsed={isCollapsed} />
        <NavItem href="/meetings" icon={<Video className="w-5 h-5" />} label="Meetings" active={pathname?.startsWith('/meetings')} isCollapsed={isCollapsed} />
        <NavItem href="/status" icon={<Activity className="w-5 h-5" />} label="Meeting Status" active={pathname === '/status'} isCollapsed={isCollapsed} />
        <NavItem href="#" disabled icon={<Upload className="w-5 h-5" />} label="Uploads" rightAccessory={<span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded whitespace-nowrap">Coming Soon</span>} isCollapsed={isCollapsed} />

        <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

        <NavItem href="#" disabled icon={<Layers className="w-5 h-5" />} label="Integrations" rightAccessory={<span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded whitespace-nowrap">Coming Soon</span>} isCollapsed={isCollapsed} />
        <NavItem href="#" disabled icon={<Users className="w-5 h-5" />} label="Team" rightAccessory={<span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded whitespace-nowrap">Coming Soon</span>} isCollapsed={isCollapsed} />

        <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

        <NavItem href="#" disabled icon={<Settings className="w-5 h-5" />} label="Settings" rightAccessory={<span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded whitespace-nowrap">Coming Soon</span>} isCollapsed={isCollapsed} />
      </div>

      <div className="mt-auto px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 gap-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Lock className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Your Privacy Choices</span>}
        </div>
      </div>
    </aside>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  active, 
  disabled,
  rightAccessory,
  isCollapsed
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  disabled?: boolean;
  rightAccessory?: React.ReactNode;
  isCollapsed?: boolean;
}) {
  return (
    <Link 
      href={disabled ? '#' : href}
      className={cn(
        "flex items-center px-3 py-2 rounded-md transition-colors text-[15px]",
        active 
          ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-600)]/20 text-[var(--color-brand-700)] dark:text-[var(--color-brand-500)] font-medium" 
          : "text-[var(--color-text-secondary)] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-[var(--color-text-secondary)] dark:hover:text-gray-400 pointer-events-none"
      )}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className={cn("shrink-0", active ? "text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)]" : "text-gray-500 dark:text-gray-400")}>
          {icon}
        </div>
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>
      {!isCollapsed && rightAccessory && (
        <div className="shrink-0 ml-2">{rightAccessory}</div>
      )}
    </Link>
  );
}
