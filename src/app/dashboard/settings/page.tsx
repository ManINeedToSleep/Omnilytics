/**
 * @fileoverview Settings page component.
 * Allows users to manage general profile settings, account connections, notifications, appearance, and security.
 * Uses a tabbed interface with a side menu for navigation.
 * Connects to:
 *   - src/components/auth/ProtectedRoute.tsx
 *   - src/app/dashboard/layout.tsx (implicitly, via route)
 */
'use client';

import { useState } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { platformColors } from '@/lib/mockData'; // Import platform colors
// import SocialAccount from "@/components/accounts/SocialAccount"; // Will uncomment later

// Mock data for connected accounts (replace with real data fetch)
const mockAccounts = [
  { id: '1', platform: 'instagram', username: 'insta_user123', profilePictureUrl: 'https://via.placeholder.com/40?text=IG', status: 'connected', },
  { id: '2', platform: 'youtube', username: 'TubeMasterFlex', profilePictureUrl: 'https://via.placeholder.com/40?text=YT', status: 'connected', },
  { id: '3', platform: 'linkedin', username: 'Pro Networker', profilePictureUrl: null, status: 'needs_reauth', },
];

// Define tab type
type SettingsTab = 'general' | 'notifications' | 'appearance' | 'security';

// Platform connect button configurations
const connectButtons = [
  { 
    platform: 'instagram', 
    label: 'Instagram', 
    color: platformColors.Instagram, 
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" />
        <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    style: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90'
  },
  { 
    platform: 'youtube', 
    label: 'YouTube',
    color: platformColors.YouTube,
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    style: 'bg-[#FF0000] hover:bg-[#cc0000]'
  },
  { 
    platform: 'linkedin', 
    label: 'LinkedIn', 
    color: platformColors.LinkedIn, 
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    style: 'bg-[#0A66C2] hover:bg-[#0952a0]'
  },
  { 
    platform: 'twitter', 
    label: 'X', 
    color: platformColors.Twitter, 
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
    style: 'bg-black hover:bg-gray-800'
  },
];

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: 'bg-green-500', text: 'text-green-600 dark:text-green-400', label: 'Connected' };
      case 'needs_reauth':
        return { color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', label: 'Needs Reauth' };
      case 'error':
        return { color: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: 'Error' };
      default:
        return { color: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', label: status };
    }
  };
  
  const { color, text, label } = getStatusInfo();
  
  return (
    <div className="flex items-center">
      <div className={`w-2 h-2 rounded-full ${color} mr-2`}></div>
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Placeholder handlers
  const handleConnect = (platform: string) => {
    console.log(`TODO: Implement connect logic for ${platform}`);
    alert(`Connect for ${platform} not implemented yet.`);
  };
  const handleDisconnect = (accountId: string) => {
    console.log(`TODO: Implement disconnect logic for account ${accountId}`);
    alert(`Disconnect for account ${accountId} not implemented yet.`);
  };
  const handleProfileSave = (e: React.FormEvent) => { e.preventDefault(); console.log('TODO: Save Profile'); };
  const handleAccountSave = (e: React.FormEvent) => { e.preventDefault(); console.log('TODO: Save Account Settings'); };
  const handleSecuritySave = (e: React.FormEvent) => { e.preventDefault(); console.log('TODO: Save Security Settings'); };

  // Reusable Input Component for consistent styling
  const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${props.disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''} ${props.className}`}
    />
  );

  // Reusable Save Button
  const SaveButton = ({ children }: { children: React.ReactNode }) => (
      <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">
          {children}
      </button>
  );

  // --- RENDER TAB CONTENT --- //
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        const accounts = mockAccounts; // Replace with actual data
        return (
          // Using standard card styles
          <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">General Settings</h2>

            {/* Account Connection Card */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Connected Accounts</h3>

              {/* Add New Account Section */}
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">Connect New Account</h4>
                <div className="flex flex-wrap gap-3">
                  {connectButtons.map(({ platform, label, style, icon: Icon }) => (
                     <button
                        key={platform}
                        onClick={() => handleConnect(platform)}
                        className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-200 ${style}`}>
                       <Icon />
                       <span>Connect {label}</span>
                     </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Connect accounts based on your subscription tier.</p>
              </div>

              {/* List of Connected Accounts */}
              <div>
                 <h4 className="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">Currently Connected</h4>
                {accounts.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 dark:bg-slate-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No accounts connected yet.</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Connect your first account above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      // Enhanced account card with improved spacing and visual appeal
                      <div key={account.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md">
                         <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                             <img 
                               src={account.profilePictureUrl || 'https://via.placeholder.com/40?text=?'} 
                               alt={account.platform} 
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div className="min-w-0 flex-1">
                             <p className="font-medium capitalize text-sm text-gray-900 dark:text-gray-100 truncate">{account.platform}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.username}</p>
                           </div>
                         </div>
                         <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end space-y-2">
                           <StatusIndicator status={account.status} />
                           <button
                             onClick={() => handleDisconnect(account.id)}
                             className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline inline-flex items-center"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                             Disconnect
                           </button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form Card */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Profile</h3>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                     <InputField type="text" placeholder="Your first name" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                     <InputField type="text" placeholder="Your last name" />
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <InputField type="email" placeholder="Email" disabled value="user@example.com (TODO)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company (Optional)</label>
                  <InputField type="text" placeholder="Your company name" />
                </div>
                <SaveButton>Save Profile</SaveButton>
              </form>
            </div>

            {/* Account Settings Form Card */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Account</h3>
              <form onSubmit={handleAccountSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <InputField type="text" placeholder="English (US)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                  <InputField type="text" placeholder="UTC-5 (Eastern Time)" />
                </div>
                <SaveButton>Save Account Settings</SaveButton>
              </form>
            </div>
          </div>
        );
      case 'notifications':
        return <div className="text-gray-900 dark:text-white">Notifications Settings Content (TODO)</div>;
      case 'appearance':
        return <div className="text-gray-900 dark:text-white">Appearance Settings Content (TODO)</div>;
      case 'security':
        return (
          <form onSubmit={handleSecuritySave} className="space-y-4 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Security Settings</h2>
             <InputField type="password" placeholder="Current Password" />
             <InputField type="password" placeholder="New Password" />
             <InputField type="password" placeholder="Confirm New Password" />
             <p className="text-sm text-gray-600 dark:text-gray-300">Two Factor Auth (TODO)</p>
             <p className="text-sm text-gray-600 dark:text-gray-300">Active Sessions (TODO)</p>
             <SaveButton>Save Security</SaveButton>
          </form>
        );
      default:
        return null;
    }
  };

  // --- TAB BUTTON --- //
  const TabButton = ({ tabId, label }: { tabId: SettingsTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      // Applying styles similar to main sidebar links
      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
        ${activeTab === tabId
          ? 'bg-indigo-600 text-white' // Active state
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' // Inactive state
        }
      `}
    >
      {label}
    </button>
  );

  // --- MAIN RETURN --- //
  return (
    // No ProtectedRoute needed here if layout already has it, but keeping for clarity if routes change
    <ProtectedRoute>
      {/* Removed container mx-auto to allow content to use full width provided by layout */}
      <div className="text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar / Quick Settings - Themed */}
          <div className="w-full md:w-1/4 lg:w-1/5 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 px-1">Quick Settings</h2>
              <nav className="flex flex-col space-y-1">
                <TabButton tabId="general" label="General" />
                <TabButton tabId="notifications" label="Notifications" />
                <TabButton tabId="appearance" label="Appearance" />
                <TabButton tabId="security" label="Security" />
                {/* Styling this placeholder button similarly */}
                <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 opacity-60 cursor-not-allowed">
                  Manage API Keys (TODO)
                </button>
              </nav>
            </div>

            {/* Account Overview Card - Themed */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-lg">
               <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Account Overview</h3>
               <p className="text-sm text-gray-600 dark:text-gray-300">Name (TODO)</p>
               <p className="text-sm text-gray-600 dark:text-gray-300">Email (TODO)</p>
               <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">Status: <span className="font-semibold">Free Tier (TODO)</span></p>
               <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1">View More</button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow issues */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 