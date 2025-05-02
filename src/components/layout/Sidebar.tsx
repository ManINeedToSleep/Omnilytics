'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, 
  BarChart3, 
  PenSquare, 
  Settings, 
  Network, 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react'; // Import Lucide icons

// Updated Nav Items with Lucide Icons
const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/dashboard/content', label: 'Content', Icon: PenSquare },
];

const platformNavItems = [
  { href: '/dashboard/instagram', label: 'Instagram', Icon: Instagram },
  { href: '/dashboard/youtube', label: 'YouTube', Icon: Youtube },
  { href: '/dashboard/twitter', label: 'Twitter/X', Icon: Twitter },
  { href: '/dashboard/linkedin', label: 'LinkedIn', Icon: Linkedin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false); // Default closed?

  const NavLink = ({ href, label, Icon }: { href: string; label: string; Icon: React.ElementType }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
          ${isActive
            ? 'bg-slate-900 text-white' // Active background
            : 'text-gray-300 hover:bg-slate-700 hover:text-white' // Inactive hover
          }`}
      >
        <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        {label}
      </Link>
    );
  };

  return (
    // Use a slightly darker bg for sidebar, ensure full height
    <aside className="w-64 bg-slate-800 text-gray-100 flex flex-col h-screen">
      {/* Title/Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700 flex-shrink-0">
        <Link href="/dashboard" className="text-xl font-bold text-white hover:opacity-90 transition-opacity">
          {/* Consider adding a logo icon here */}
          Omnilytics
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}

        {/* Platforms Dropdown */}
        <div>
          <button
            onClick={() => setIsPlatformsOpen(!isPlatformsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white focus:outline-none"
            aria-expanded={isPlatformsOpen}
          >
            <div className="flex items-center">
              <Network className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span>Platforms</span>
            </div>
            {isPlatformsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {/* Collapsible Content */}
          {isPlatformsOpen && (
            <div className="mt-1 pl-6 space-y-1 border-l border-slate-700 ml-2.5">
              {platformNavItems.map((item) => (
                 <NavLink key={item.label} {...item} />
              ))}
            </div>
          )}
        </div>

        {/* Separator */} 
        <div className="pt-2 pb-1">
           <hr className="border-t border-slate-700"/>
        </div>

        {/* Settings Link */}
         <NavLink href="/dashboard/settings" label="Settings" Icon={Settings} />
      </nav>

      {/* Account Section at Bottom */}
      <div className="p-3 border-t border-slate-700 flex-shrink-0 bg-slate-900">
         <Link 
           href="/dashboard/settings" 
           className="flex items-center space-x-3 group p-2 rounded-md hover:bg-slate-700 transition-colors duration-150"
         >
          {/* Simple Avatar */} 
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-medium text-white group-hover:bg-indigo-600">
            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-gray-100">
              {user?.displayName || 'User Settings'}
            </p>
            <p className="text-xs text-gray-400 truncate group-hover:text-gray-300">
              {user?.email}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
} 