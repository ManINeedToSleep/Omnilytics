'use client';

import { useAuthStore } from "@/store/authStore";
import { Menu, Bell, Sun, Moon, User as UserIcon, ChevronDown } from 'lucide-react'; // Import icons
// import LogoutButton from "@/components/auth/LogoutButton"; // Moved to Profile dropdown likely
// TODO: Add Theme toggle functionality

interface TopBarProps {
  onToggleSidebar: () => void; // Callback to toggle sidebar
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const user = useAuthStore((state) => state.user);
  // TODO: Add state for profile dropdown menu
  const isProfileMenuOpen = false; // Placeholder
  // TODO: Add state for theme
  const currentTheme = 'light'; // Placeholder

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
      {/* Left Side: Toggle Button & Search */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle Button */} 
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar Placeholder */}
        <div className="hidden md:block">
          <input 
            type="search" 
            placeholder="Search..."
            className="w-full max-w-xs px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-gray-50 dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Right Side: User Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Removed Filter Buttons */}

        {/* Theme Toggle Button */} 
        <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-700">
          {currentTheme === 'dark' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
        </button>
        
        {/* Notifications Button */} 
        <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-700">
          <Bell className="h-5 w-5"/>
        </button>
        
        {/* Profile/Logout Dropdown Placeholder */}
        <div className="relative">
           <button className="flex items-center space-x-1 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-700">
             <UserIcon className="h-5 w-5" /> 
             <ChevronDown className="h-4 w-4 opacity-75" /> 
           </button>
           {/* Dropdown Menu (Conditional Rendering) */} 
           {isProfileMenuOpen && (
             <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
               {/* <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600">Your Profile</Link> */}
               {/* <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600">Settings</Link> */}
               {/* <LogoutButton /> // Needs to be styled for dropdown */}
               <span className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400">(Dropdown Placeholder)</span>
             </div>
           )}
        </div>
      </div>
    </header>
  );
} 