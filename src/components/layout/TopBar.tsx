/**
 * @fileoverview TopBar component for the dashboard layout.
 * Displays controls like sidebar toggle, search (placeholder), notifications, and user profile dropdown.
 * It receives a callback to toggle the sidebar and manages the profile dropdown state.
 * Connects to:
 *   - src/app/dashboard/layout.tsx (parent, provides toggle callback)
 *   - src/store/authStore.ts (potentially for user info in dropdown)
 *   - src/components/auth/LogoutButton.tsx (for the logout action)
 *   - lucide-react (for icons)
 */
'use client';

import { useState } from 'react'; // Import useState
import Link from 'next/link'; // Import Link
import { useAuthStore } from "@/store/authStore";
import { Menu, Bell, User as UserIcon, ChevronDown } from 'lucide-react'; // Import icons
import LogoutButton from "@/components/auth/LogoutButton"; // Import LogoutButton
// TODO: Add Theme toggle functionality

interface TopBarProps {
  onToggleSidebar: () => void; // Callback to toggle sidebar
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const user = useAuthStore((state) => state.user);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // State for dropdown

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    // I'll use the consistent slightly lighter gray for the top bar bg in dark mode
    // Adding z-index to ensure it's below the sidebar overlay
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      {/* Left Side: Toggle Button */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          // Standardizing padding and adding transition
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar Removed */}
      </div>

      {/* Right Side: User Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Notifications Button */}
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-150">
          <Bell className="h-5 w-5"/>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
           {/* Standardizing padding and adding transition */}
           {/* Added onClick handler */}
           <button
             onClick={toggleProfileMenu}
             className="flex items-center space-x-1 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
             aria-haspopup="true"
             aria-expanded={isProfileMenuOpen}
           >
             <UserIcon className="h-5 w-5" />
             <ChevronDown className={`h-4 w-4 opacity-75 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
           </button>
           {/* Dropdown Menu (Conditional Rendering) */}
           {isProfileMenuOpen && (
             <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
               {/* Basic styling for dropdown items */}
               <div className="px-4 py-3">
                 <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.displayName || 'User'}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
               </div>
               <div className="border-t border-gray-200 dark:border-gray-700"></div>
               {/* Placeholder links */}
               <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>
               {/* Integrate LogoutButton */}
               <div className="px-2 py-1"> {/* Padding around the button */}
                 <LogoutButton />
               </div>
             </div>
           )}
        </div>
      </div>
    </header>
  );
} 