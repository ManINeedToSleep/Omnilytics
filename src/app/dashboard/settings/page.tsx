'use client';

import { useState } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import SocialAccount from "@/components/accounts/SocialAccount"; // Will uncomment later

// Mock data for connected accounts (Moved from accounts page)
const mockAccounts = [
  { id: '1', platform: 'instagram', username: 'insta_user123', profilePictureUrl: 'https://via.placeholder.com/40?text=IG', status: 'connected', },
  { id: '2', platform: 'youtube', username: 'TubeMasterFlex', profilePictureUrl: 'https://via.placeholder.com/40?text=YT', status: 'connected', },
  { id: '3', platform: 'linkedin', username: 'Pro Networker', profilePictureUrl: null, status: 'needs_reauth', },
];

// Define tab type
type SettingsTab = 'general' | 'notifications' | 'appearance' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Placeholder handlers (moved from accounts page)
  const handleConnect = (platform: string) => {
    console.log(`TODO: Implement connect logic for ${platform}`);
    alert(`Connect for ${platform} not implemented yet.`);
  };
  const handleDisconnect = (accountId: string) => {
    console.log(`TODO: Implement disconnect logic for account ${accountId}`);
    alert(`Disconnect for account ${accountId} not implemented yet.`);
  };

  // ... (other placeholder handlers: handleProfileSave, etc.)
  const handleProfileSave = (e: React.FormEvent) => { e.preventDefault(); console.log('TODO: Save Profile'); };
  const handleAccountSave = (e: React.FormEvent) => { e.preventDefault(); console.log('TODO: Save Account Settings'); };
  const handleSecuritySave = (e: React.FormEvent) => { e.preventDefault(); console.log('TODO: Save Security Settings'); };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        // TODO: Fetch actual connected accounts from Firestore later
        const accounts = mockAccounts;
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            
            {/* --- Account Connection UI (Moved here) --- */}
            <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
              
              {/* Add New Account Section */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-md font-semibold mb-3">Connect New Account</h4>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleConnect('instagram')} className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:opacity-90">Connect Instagram</button>
                  <button onClick={() => handleConnect('youtube')} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Connect YouTube</button>
                  {/* TODO: Conditionally show premium buttons */}
                  <button onClick={() => handleConnect('linkedin')} className="px-3 py-1.5 text-sm bg-blue-700 text-white rounded hover:bg-blue-800">Connect LinkedIn</button>
                  <button onClick={() => handleConnect('twitter')} className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-900">Connect X</button>
                </div>
                 {/* TODO: Add checks based on user's tier/limits display */} 
                 <p className="text-xs text-gray-500 mt-2">Connect accounts based on your subscription tier.</p>
              </div>
              
              {/* List of Connected Accounts */}
              <div>
                 <h4 className="text-md font-semibold mb-3">Currently Connected</h4>
                {accounts.length === 0 ? (
                  <p className="text-gray-600">No accounts connected yet.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Placeholder rendering - Replace with SocialAccount component later */} 
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                         <div className="flex items-center space-x-3">
                           <img src={account.profilePictureUrl || 'https://via.placeholder.com/40?text=?'} alt={account.platform} className="w-8 h-8 rounded-full bg-gray-300"/>
                           <div>
                             <p className="font-medium capitalize text-sm">{account.platform}</p>
                             <p className="text-xs text-gray-600">{account.username}</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className={`text-xs font-medium ${account.status === 'connected' ? 'text-green-600' : 'text-orange-600'}`}>{account.status}</p>
                           <button 
                             onClick={() => handleDisconnect(account.id)}
                             className="mt-1 text-xs text-red-600 hover:text-red-800 hover:underline"
                           >
                             Disconnect
                           </button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* --- End Account Connection UI --- */}

            {/* Profile Form Placeholder */}
            <form onSubmit={handleProfileSave} className="mt-6 space-y-4 p-6 border rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-medium">Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" placeholder="First Name" className="border p-2 rounded" />
                 <input type="text" placeholder="Last Name" className="border p-2 rounded" />
              </div>
              <input type="email" placeholder="Email" disabled className="border p-2 rounded w-full bg-gray-100" /> 
              <input type="text" placeholder="Company (Optional)" className="border p-2 rounded w-full" /> 
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save Profile</button>
            </form>
             {/* Account Settings Form Placeholder */}
            <form onSubmit={handleAccountSave} className="mt-6 space-y-4 p-6 border rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-medium">Account</h3>
              <input type="text" placeholder="Language" className="border p-2 rounded w-full" /> 
              <input type="text" placeholder="Timezone" className="border p-2 rounded w-full" /> 
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save Account Settings</button>
            </form>
          </div>
        );
      case 'notifications':
        return <div>Notifications Settings Content (TODO)</div>;
      case 'appearance':
        return <div>Appearance Settings Content (TODO)</div>;
      case 'security':
        return (
          <form onSubmit={handleSecuritySave} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
             <input type="password" placeholder="Current Password" className="border p-2 rounded w-full" /> 
             <input type="password" placeholder="New Password" className="border p-2 rounded w-full" /> 
             <input type="password" placeholder="Confirm New Password" className="border p-2 rounded w-full" /> 
             {/* TODO: 2FA setup */}
             <p>Two Factor Auth (TODO)</p>
             {/* TODO: Sessions list */}
             <p>Active Sessions (TODO)</p>
             <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save Security</button>
          </form>
        );
      default:
        return null;
    }
  };

  const TabButton = ({ tabId, label }: { tabId: SettingsTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md 
        ${activeTab === tabId ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}
      `}
    >
      {label}
    </button>
  );

  return (
    <ProtectedRoute>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar / Quick Settings */}
          <div className="w-full md:w-1/4 lg:w-1/5">
            <h2 className="text-lg font-semibold mb-4">Quick Settings</h2>
            <nav className="flex flex-col space-y-1">
              <TabButton tabId="general" label="General" />
              <TabButton tabId="notifications" label="Notifications" />
              <TabButton tabId="appearance" label="Appearance" />
              <TabButton tabId="security" label="Security" />
              <button className="px-4 py-2 text-sm font-medium text-left text-gray-600 hover:bg-gray-100 rounded-md">Manage API Keys (TODO)</button>
            </nav>

            {/* Account Overview Placeholder */} 
            <div className="mt-8 p-4 border rounded-lg bg-white">
               <h3 className="text-lg font-medium mb-2">Account Overview</h3>
               <p className="text-sm">Name (TODO)</p>
               <p className="text-sm">Email (TODO)</p>
               <p className="text-sm mt-2">Status: <span className="font-semibold">Free Tier (TODO)</span></p>
               <button className="text-xs text-blue-600 mt-1">View More</button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 