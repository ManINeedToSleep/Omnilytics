/**
 * @fileoverview Sidebar component for the dashboard layout.
 * Displays primary navigation, platform links (collapsible), settings, logout, and user info.
 * It receives an `isOpen` prop to control its visibility and applies fixed positioning for an overlay effect.
 * Connects to:
 *   - src/app/dashboard/layout.tsx (parent, provides isOpen state)
 *   - src/store/authStore.ts (for user info)
 *   - src/components/auth/LogoutButton.tsx (for the logout action)
 *   - lucide-react (for icons)
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import LogoutButton from "@/components/auth/LogoutButton"; // Import LogoutButton
import {
  LayoutDashboard, 
  PenSquare, 
  Settings, 
  Network, 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  ChevronDown, 
  ChevronUp,
  LogOut, // Import LogOut icon
  X as XIcon // Import X icon for the close button
} from 'lucide-react'; // Import Lucide icons

// Updated Nav Items with Lucide Icons
const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/content', label: 'Content', Icon: PenSquare },
];

const platformNavItems = [
  { href: '/dashboard/instagram', label: 'Instagram', Icon: Instagram },
  { href: '/dashboard/youtube', label: 'YouTube', Icon: Youtube },
  { href: '/dashboard/twitter', label: 'Twitter/X', Icon: Twitter },
  { href: '/dashboard/linkedin', label: 'LinkedIn', Icon: Linkedin },
];

// --- Props Interface --- //
interface SidebarProps {
  isOpen: boolean;
  onToggleSidebar: () => void; // Add toggle function to props
}

// --- Sidebar Component --- //
export default function Sidebar({ isOpen, onToggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false); // Default closed?

  const NavLink = ({ href, label, Icon }: { href: string; label: string; Icon: React.ElementType }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors duration-150 
          ${isActive
            ? 'bg-indigo-600 text-white' // Active background using brand color
            : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Inactive hover (darker gray)
          }`}
      >
        <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        {label}
      </Link>
    );
  };

  return (
    // Applying fixed positioning, z-index, transitions, and ensuring correct background
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-gray-100 flex flex-col h-screen transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Title/Logo section - using darker gray-900 */}
      <div className="h-16 flex items-center justify-between border-b border-gray-700 flex-shrink-0 px-4 bg-gray-900">
        <Link href="/dashboard" className="text-xl font-bold text-white hover:opacity-90 transition-opacity flex items-center space-x-2 group">
          {/* Adding the logo SVG from landing page */}
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 shadow-md transition-transform duration-300 group-hover:scale-105">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span>Omnilytics</span>
        </Link>
        {/* Mobile Close Button for Sidebar */}
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-label="Close sidebar"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Main Navigation - Scrollable, scrollbar hidden */}
      {/* Tailwind classes for hiding scrollbar: scrollbar-hide (requires plugin) or custom like below */}
      {/* For this example, I'll use a common set of classes. If you have tailwind-scrollbar-hide plugin, use that. */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto 
                    [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {mainNavItems.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}

        {/* Platforms Dropdown */}
        <div>
          <button
            onClick={() => setIsPlatformsOpen(!isPlatformsOpen)}
            className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
            aria-expanded={isPlatformsOpen}
          >
            <div className="flex items-center">
              <Network className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span>Platforms</span>
            </div>
            {isPlatformsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {/* Collapsible Content - slight indent */}
          {isPlatformsOpen && (
            <div className="mt-1 pl-5 space-y-1">
              {platformNavItems.map((item) => (
                 <NavLink key={item.label} {...item} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Fixed Section: Settings, Logout, and User Profile */}
      {/* This section will stay at the bottom and not scroll */}
      <div className="mt-auto border-t border-gray-700 bg-gray-900 flex-shrink-0">
        {/* Settings and Logout Container */}
        <div className="px-3 py-4 space-y-2">
        {/* Settings Link */}
        <NavLink href="/dashboard/settings" label="Settings" Icon={Settings} />
          {/* Logout Button */}
          <LogoutButton />
        </div>

        {/* Account Section fixed at Bottom of this new div */}
        <div className="p-4 border-t border-gray-700">
         <Link
            href="/dashboard/settings" // Or link to a dedicated profile page if you have one
            className="flex items-center space-x-3 group p-2 rounded-md hover:bg-gray-800 transition-colors duration-150"
         >
          {/* Simple Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-medium text-white group-hover:bg-indigo-600 flex-shrink-0">
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
      </div>
    </aside>
  );
} 