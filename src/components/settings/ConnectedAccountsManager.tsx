/**
 * @fileoverview Component for managing connected social accounts.
 * Displays connection buttons based on tier limits and lists currently connected accounts.
 * Receives user data, account list, limits, connection status, and handlers as props.
 * Connects to:
 *   - src/app/dashboard/settings/page.tsx (Parent)
 *   - src/lib/models/user.model.ts
 *   - src/lib/models/socialAccount.model.ts
 *   - src/lib/mockData.ts (for platform colors)
 */
import React from 'react';
import type { User as FirestoreUser } from '@/lib/models/user.model';
import type { SocialAccount, SocialPlatform } from '@/lib/models/socialAccount.model';
import { platformColors } from '@/lib/mockData';

// Platform connect button configurations (Copied from settings page for now)
// TODO: Consider moving this config to a shared location if used elsewhere
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

// Status indicator component (Copied from settings page)
const StatusIndicator = ({ status }: { status: string }) => {
  // ... (Keep the existing StatusIndicator component)
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

interface ConnectedAccountsManagerProps {
  firestoreUser: FirestoreUser | null;
  connectedAccounts: (SocialAccount & { id: string })[];
  onConnect: (platform: SocialPlatform) => void;
  onDisconnect: (accountId: string) => void;
  isConnecting: SocialPlatform | null;
  connectionError: string | null; // Specific error for this section
}

export default function ConnectedAccountsManager({
  firestoreUser,
  connectedAccounts,
  onConnect,
  onDisconnect,
  isConnecting,
  connectionError
}: ConnectedAccountsManagerProps) {

  if (!firestoreUser) {
    return <div className="text-gray-500 dark:text-gray-400">User data not loaded.</div>;
  }

  const currentTotalAccounts = connectedAccounts.length;
  const limits = firestoreUser.accountLimits;
  const tier = firestoreUser.subscriptionTier;

  const getAccountCount = (platform: SocialPlatform) => {
      return connectedAccounts.filter(acc => acc.platform === platform).length;
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Connected Social Accounts</h3>

      {/* Connect New Account Section */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200">Connect New Account</h4>
        {connectionError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">Error: {connectionError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connectButtons.map(({ platform, label, style, icon: Icon }) => {
            let isDisabled = false;
            let disabledReason = '';
            // Check if *any* connection is in progress
            if (isConnecting) {
              isDisabled = true;
              disabledReason = 'Processing...';
            } else {
              // Apply limits logic
              const platformLimit = limits?.[`max${platform.charAt(0).toUpperCase() + platform.slice(1)}` as keyof typeof limits] ?? 0;
              const platformCount = getAccountCount(platform as SocialPlatform);
              if (tier === 'free' && (platform === 'linkedin' || platform === 'twitter')) {
                  isDisabled = true;
                  disabledReason = 'Premium required';
              }
              else if (currentTotalAccounts >= (limits?.maxTotal ?? 0)) {
                isDisabled = true;
                disabledReason = 'Total limit reached';
              }
              else if (platformCount >= platformLimit) {
                isDisabled = true;
                disabledReason = `Limit reached (${platformLimit})`;
              }
            }
            const isCurrentlyConnecting = isConnecting === platform;
            return (
             <button
                key={platform}
                // Use the passed-in handler
                onClick={() => onConnect(platform as SocialPlatform)}
                disabled={isDisabled || isCurrentlyConnecting}
                title={disabledReason || `Connect ${label}`}
                className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-200 ${style} ${(isDisabled || isCurrentlyConnecting) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}>
               <Icon />
               <span>
                 {isCurrentlyConnecting ? `Connecting ${label}...` : `Connect ${label}`}
               </span>
               {isDisabled && !isCurrentlyConnecting && <span className="ml-1.5 text-xs opacity-75">({disabledReason})</span>}
             </button>
           );
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Connected: {currentTotalAccounts} / {limits?.maxTotal ?? '?'}. Tier: <span className="font-medium capitalize">{tier}</span>.
          {tier === 'free' && " (Instagram & YouTube only)"}
        </p>
      </div>

      {/* List of Connected Accounts */}
      <div>
         <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200">Currently Connected</h4>
        {connectedAccounts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
            {/* Link Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No accounts connected yet.</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Use the buttons above to connect.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600">
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                     <img 
                       src={account.profilePictureUrl || `https://via.placeholder.com/40?text=${account.platform.substring(0,2).toUpperCase()}`}
                       alt={account.platform} 
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <div className="min-w-0">
                     <p className="font-medium capitalize text-sm text-gray-900 dark:text-gray-100 truncate">{account.platform}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.username}</p>
                   </div>
                 </div>
                 <div className="text-right flex items-center space-x-3">
                   <StatusIndicator status={account.status} />
                   <button
                     // Use the passed-in handler
                     onClick={() => onDisconnect(account.id)}
                     className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                     title={`Disconnect ${account.platform} account ${account.username}`}
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
  );
} 