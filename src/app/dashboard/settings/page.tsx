/**
 * @fileoverview Settings page component.
 * Main container for user settings, managing state and data fetching.
 * Uses a responsive tabbed interface and delegates rendering of specific settings
 * sections to child components (imported).
 * Connects to:
 *   - src/components/auth/ProtectedRoute.tsx
 *   - src/app/dashboard/layout.tsx (implicitly, via route)
 *   - src/store/authStore.ts (for auth user UID)
 *   - src/lib/firebase.ts (for Firestore instance, Auth instance)
 *   - src/lib/models/user.model.ts
 *   - src/lib/models/socialAccount.model.ts
 *   - src/components/settings/* (Child components for each tab)
 *   - lucide-react (for icons)
 */
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from '@/store/authStore';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  limit,
  updateDoc
} from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { User as FirestoreUser } from '@/lib/models/user.model';
import type { SocialAccount, SocialPlatform } from '@/lib/models/socialAccount.model';
import { User as UserIcon, Link as LinkIcon, Bell, Eye, Lock } from 'lucide-react';

// Import the settings components
import ProfileSettingsForm from '@/components/settings/ProfileSettingsForm';
import ConnectedAccountsManager from '@/components/settings/ConnectedAccountsManager';
import SecuritySettingsForm from '@/components/settings/SecuritySettingsForm';

// Define tab type
type SettingsTabId = 'profile' | 'accounts' | 'notifications' | 'appearance' | 'security';

interface SettingsTab {
  id: SettingsTabId;
  label: string;
  icon: React.ElementType;
}

// Define the tabs configuration
const settingsTabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile & Account', icon: UserIcon },
  { id: 'accounts', label: 'Connected Accounts', icon: LinkIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Eye },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function SettingsPage() {
  const [activeTabId, setActiveTabId] = useState<SettingsTabId>('profile');
  const { user: authUser } = useAuthStore();
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<(SocialAccount & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<SocialPlatform | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Fetching --- //
  const fetchData = useCallback(async (forceUserFetch = false) => {
    if (!authUser) {
      // No need to set loading if already logged out and clearing state
      // setIsLoading(false); 
      return;
    }
    // Determine if we *need* to set loading: only on initial load or forced user refetch
    const shouldSetLoading = !firestoreUser || forceUserFetch;
    if (shouldSetLoading) {
        setIsLoading(true);
    }
    // Clear errors selectively based on fetch type
    if (!forceUserFetch && activeTabId === 'accounts') {
        setError(null); 
    } else if (forceUserFetch || !firestoreUser) {
        setError(null);
    }
    
    try {
      let currentUserData = firestoreUser;
      // Fetch user doc only if forced or not already loaded
      if (!currentUserData || forceUserFetch) {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
              currentUserData = userDocSnap.data() as FirestoreUser;
              // Only update state if data actually changed (prevents potential loops)
              if (JSON.stringify(currentUserData) !== JSON.stringify(firestoreUser)) {
                setFirestoreUser(currentUserData);
              }
          } else {
              console.warn('Firestore user document not found!');
              setError('Could not load user data.');
              setFirestoreUser(null);
              setConnectedAccounts([]);
              if (shouldSetLoading) setIsLoading(false);
              return;
          }
      }
      // Always fetch accounts after ensuring user data is available (or was already available)
      if (currentUserData) { // Ensure we have user data before fetching accounts
        const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
        const accountsSnapshot = await getDocs(accountsColRef);
        const accountsData = accountsSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as SocialAccount),
        }));
        // Only update state if accounts data actually changed
        if (JSON.stringify(accountsData) !== JSON.stringify(connectedAccounts)) {
            setConnectedAccounts(accountsData);
        }
      }
    } catch (fetchError: unknown) {
      console.error("Error fetching settings data:", fetchError);
      setError('Failed to load settings data. Please try refreshing.');
      setConnectedAccounts([]);
      if (forceUserFetch || !firestoreUser) setFirestoreUser(null);
    } finally {
      // Stop loading only if we started it
      if (shouldSetLoading) setIsLoading(false);
    }
  // Add connectedAccounts to dependencies as it's read in the function
  }, [authUser, firestoreUser, activeTabId, connectedAccounts]); 

  useEffect(() => {
    if (authUser) {
      fetchData(true); // Initial fetch on mount/auth change
    } else {
        // Clear state on logout
        setFirestoreUser(null);
        setConnectedAccounts([]);
        setIsLoading(true); // Set loading true for the next login
        setError(null);
        setActiveTabId('profile');
    }
  // IMPORTANT: Only depend on authUser here. fetchData is stable via useCallback
  // unless its own dependencies change, which shouldn't happen unnecessarily now.
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [authUser]);

  // --- Connection / Disconnection Logic --- //
  const handleConnect = async (platform: SocialPlatform) => {
    if (!authUser || !firestoreUser || isConnecting) return;
    setIsConnecting(platform);
    setError(null);
    let provider: GoogleAuthProvider | OAuthProvider;

    try {
      const googleScopes = ['https://www.googleapis.com/auth/youtube.readonly'];
      // Define other potential scopes (adjust based on actual API requirements)
      const facebookScopes = ['email', 'public_profile', 'instagram_basic', 'pages_show_list']; // Example scopes for FB/IG
      const linkedinScopes = ['r_liteprofile', 'r_emailaddress']; // Basic LinkedIn scopes
      // Twitter/X scopes are generally handled by permissions requested in the Twitter Dev App settings

      switch (platform) {
        case 'youtube':
          provider = new GoogleAuthProvider();
          googleScopes.forEach(scope => provider.addScope(scope));
          break;
        case 'instagram': // Uses Facebook Provider
          provider = new OAuthProvider('facebook.com');
          facebookScopes.forEach(scope => provider.addScope(scope));
          // Note: Instagram connection via FB often requires extra setup & permissions
          break;
        case 'linkedin':
          provider = new OAuthProvider('linkedin.com');
          linkedinScopes.forEach(scope => provider.addScope(scope));
          break;
        case 'twitter': // Twitter/X
          provider = new OAuthProvider('twitter.com');
          // No explicit client-side scopes usually needed for Twitter via Firebase; handled by app permissions
          break;
      default:
          setError(`Connecting ${platform} is not yet supported.`);
          setIsConnecting(null);
          return;
      }

      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);
      if (!credential || !credential.accessToken) throw new Error('No credential found.');
      
      const providerUserInfo = result.user; // This is the Google User for YouTube OAuth
      console.log(`${platform} OAuth successful with Google User:`, providerUserInfo.displayName);

      let finalPlatformUserId = providerUserInfo.providerData[0].uid;
      let finalUsername = providerUserInfo.displayName || `user_${finalPlatformUserId.substring(0, 5)}`;
      let finalProfilePictureUrl = providerUserInfo.photoURL;

      if (platform === 'youtube') {
        try {
          const accessToken = credential.accessToken;
          const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to fetch YouTube channel details.');
          }
          const youtubeData = await response.json();
          if (youtubeData.items && youtubeData.items.length > 0) {
            const channel = youtubeData.items[0];
            finalPlatformUserId = channel.id; // Use YouTube Channel ID
            finalUsername = channel.snippet.title; // Use YouTube Channel Title
            finalProfilePictureUrl = channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url || providerUserInfo.photoURL;
            console.log('Fetched YouTube Channel:', finalUsername, finalPlatformUserId);
          } else {
            console.warn('No YouTube channel found for this Google account. Falling back to Google profile.');
            // Keep Google User ID as platformUserId if no specific channel found, or handle as error
            // For now, we are already initialized with Google data, so this branch means we use that if channel specific fetch fails to find items
          }
        } catch (ytApiError: unknown) {
          console.error('Error fetching YouTube channel details:', ytApiError);
          // Decide if this is a fatal error for connection or if we proceed with Google details
          // For now, proceed with Google details as fallback, error will be shown by setError later if needed
          let ytErrorMessage = 'Could not fetch specific YouTube channel details.';
          if (ytApiError instanceof Error) ytErrorMessage += ` ${ytApiError.message}`;
          // Potentially set a non-fatal warning here, or let the main catch handle it
          // For now, we let it fallback to Google details if API call fails
        }
      }
      
      const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
      // Query by the finalPlatformUserId which is now the YouTube Channel ID if platform is youtube
      const q = query(accountsColRef, where("platform", "==", platform), where("platformUserId", "==", finalPlatformUserId), limit(1));
      const existingAccountSnap = await getDocs(q);

      if (!existingAccountSnap.empty) {
          setError(`${platform} account is already connected.`);
      } else {
          const docData = {
            platform: platform,
            platformUserId: finalPlatformUserId,
            username: finalUsername,
            profilePictureUrl: finalProfilePictureUrl,
            status: 'connected',
            connectedAt: serverTimestamp(),
          };
          const newDocRef = await addDoc(accountsColRef, docData);
          console.log('New social account added with ID:', newDocRef.id);

          // If YouTube, call the Cloud Function to fetch initial stats
          if (platform === 'youtube' && credential?.accessToken) {
            console.log('[SETTINGS_PAGE] Preparing to call fetchInitialYouTubeStats...');
            try {
              const functionsInstance = getFunctions(); 
              const fetchStats = httpsCallable(functionsInstance, 'fetchInitialYouTubeStats');
              console.log(`[SETTINGS_PAGE] Calling fetchInitialYouTubeStats with params: userId=${authUser.uid}, socialAccountId=${newDocRef.id}, youtubeChannelId=${finalPlatformUserId}, hasAccessToken=${!!credential.accessToken}`);
              
              const result = await fetchStats({
                userId: authUser.uid,
                socialAccountId: newDocRef.id,
                accessToken: credential.accessToken,
                youtubeChannelId: finalPlatformUserId, 
              });
              
              console.log('[SETTINGS_PAGE] fetchInitialYouTubeStats Cloud Function call completed. Result:', result);
              if (result && result.data) {
                console.log('[SETTINGS_PAGE] Cloud Function returned data:', result.data);
              }
            } catch (functionsError: unknown) {
              console.error("[SETTINGS_PAGE] Error calling or awaiting fetchInitialYouTubeStats Cloud Function:", functionsError);
              // If functionsError is an object with a message property, log that too
              if (typeof functionsError === 'object' && functionsError !== null && 'message' in functionsError) {
                console.error("[SETTINGS_PAGE] Error message:", (functionsError as {message: string}).message);
              }
              // setError('Failed to fetch initial YouTube stats, but account connected.');
            }
            console.log('[SETTINGS_PAGE] Finished YouTube specific post-connection logic.');
          }

          await fetchData(); 
      }
    } catch (connectError: unknown) {
      console.error(`Error connecting ${platform}:`, connectError);
      let friendlyMessage = `Failed to connect ${platform}.`;
      if (connectError instanceof FirebaseError) {
        if (connectError.code === 'auth/popup-closed-by-user' || connectError.code === 'auth/cancelled-popup-request') {
          friendlyMessage = `Connection cancelled.`;
        } else if (connectError.code === 'auth/account-exists-with-different-credential') {
          friendlyMessage = `This ${platform} account seems linked to another user.`;
        } else if (connectError.code === 'auth/popup-blocked') {
          friendlyMessage = `Popup blocked. Please allow popups.`;
        }
      } else if (connectError instanceof Error) {
         friendlyMessage = connectError.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!authUser || !window.confirm("Disconnect this account?")) return;
    setError(null);
    try {
      const accountDocRef = doc(db, 'users', authUser.uid, 'socialAccounts', accountId);
      await deleteDoc(accountDocRef);
      await fetchData();
    } catch (disconnectError: unknown) {
      console.error("Error disconnecting account:", disconnectError);
      setError(`Failed to disconnect account.`);
    }
  };

  // --- Form Save Handlers --- //
  const handleProfileSave = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (!authUser) return;
    setIsSaving(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const company = formData.get('company') as string; // Optional field
    const newDisplayName = `${firstName} ${lastName}`.trim();

    try {
      // Update Firebase Auth profile first
      if (auth.currentUser && auth.currentUser.displayName !== newDisplayName) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName });
        console.log('Auth profile display name updated.');
      }

      // Prepare Firestore update data
      const updateData: Partial<FirestoreUser> = {
        displayName: newDisplayName || null, // Store null if empty
        // Add company to preferences map
        preferences: { 
            ...(firestoreUser?.preferences || {}), // Keep existing preferences
            company: company || null // Add/update company, store null if empty
        }
      };
      
      // Update Firestore document
      const userDocRef = doc(db, 'users', authUser.uid);
      await updateDoc(userDocRef, updateData);
      console.log('Firestore profile updated.');
      
      // Refetch user data to reflect changes in UI
      await fetchData(true); 
      alert('Profile updated successfully!'); // Simple success feedback

    } catch (saveError: unknown) {
      console.error("Error saving profile:", saveError);
      setError(saveError instanceof Error ? saveError.message : 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAccountSave = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
     if (!authUser) return;
    setIsSaving(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const language = formData.get('language') as string;
    const timezone = formData.get('timezone') as string;

    try {
      // Prepare update for preferences map
      const currentPreferences = firestoreUser?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        language: language || null,
        timezone: timezone || null,
      };

      const userDocRef = doc(db, 'users', authUser.uid);
      await updateDoc(userDocRef, { preferences: updatedPreferences });
      console.log('Account settings updated.');
      
      // Refetch user data
      await fetchData(true);
      alert('Account settings saved!');

    } catch (saveError: unknown) {
      console.error("Error saving account settings:", saveError);
      setError(saveError instanceof Error ? saveError.message : 'Failed to save account settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySave = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    const form = e.currentTarget;
    if (!auth.currentUser) return;
    setIsSaving(true);
    setError(null);

    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Please fill in all password fields.');
        setIsSaving(false);
        return;
    }

    if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        setIsSaving(false);
        return;
    }

    try {
      // Reauthenticate the user - this is crucial before changing password
      if (!auth.currentUser.email) {
          throw new Error("User email not found, cannot reauthenticate.");
      }
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log('User reauthenticated successfully.');

      // Now update the password
      await updatePassword(auth.currentUser, newPassword);
      console.log('Password updated successfully.');
      alert('Password updated successfully!');
      form.reset(); // Clear password fields after successful update

    } catch (saveError: unknown) {
        console.error("Error updating password:", saveError);
        let friendlyMessage = 'Failed to update password.';
        if (saveError instanceof FirebaseError) {
            if (saveError.code === 'auth/wrong-password' || saveError.code === 'auth/invalid-credential') {
                friendlyMessage = 'Incorrect current password.';
            } else if (saveError.code === 'auth/weak-password') {
                friendlyMessage = 'New password is too weak (must be at least 6 characters).';
            } // Add other potential Firebase error codes here
        } else if (saveError instanceof Error) {
            friendlyMessage = saveError.message;
        }
        setError(friendlyMessage);
    } finally {
        setIsSaving(false);
    }
  };

  // --- Render Active Tab Content --- //
  const renderActiveTabContent = () => {
    if (isLoading) {
      return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading settings...</div>;
    }
    if (!firestoreUser) {
        return <div className="text-center py-10 text-red-600 dark:text-red-400">{error || 'Could not load user information.'}</div>;
    }
    const generalError = activeTabId !== 'accounts' ? error : null;

        return (
      <>
        {generalError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <span className="font-medium">Error:</span> {generalError}
          </div>
        )}
        {
          (() => {
             switch (activeTabId) {
              case 'profile': 
                return <ProfileSettingsForm 
                          firestoreUser={firestoreUser} 
                          onProfileSave={handleProfileSave} 
                          onAccountSave={handleAccountSave} 
                          isSaving={isSaving} 
                        />;
              case 'accounts': 
                return <ConnectedAccountsManager 
                          firestoreUser={firestoreUser} 
                          connectedAccounts={connectedAccounts} 
                          onConnect={handleConnect} 
                          onDisconnect={handleDisconnect} 
                          isConnecting={isConnecting} 
                          connectionError={activeTabId === 'accounts' ? error : null} 
                        />;
      case 'notifications':
                return <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6"><h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Notification Settings</h3><p className='text-gray-600 dark:text-gray-400'>Notification options coming soon...</p></div>;
      case 'appearance':
                return <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6"><h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Appearance Settings</h3><p className='text-gray-600 dark:text-gray-400'>Theme customization options coming soon...</p></div>;
      case 'security':
                return <SecuritySettingsForm 
                          onSecuritySave={handleSecuritySave} 
                          isSaving={isSaving}
                        />;
              default: return null;
            }
          })()
        }
      </>
    );
  };

  // --- Tab Button Component (for desktop sidebar) --- //
  const TabButton = ({ tab, isActive }: { tab: SettingsTab; isActive: boolean }) => (
    <button
      key={tab.id}
      onClick={() => {
        setError(null);
        setActiveTabId(tab.id);
      }}
      className={`w-full flex items-center text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
        ${isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      <tab.icon className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {tab.label}
    </button>
  );

  // --- MAIN RETURN --- //
  return (
    <ProtectedRoute>
      <div className="text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Mobile Tab Selector */}
        <div className="md:hidden mb-4">
          <label htmlFor="settings-tabs-mobile" className="sr-only">Select a tab</label>
          <select
            id="settings-tabs-mobile"
            name="settings-tabs-mobile"
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            value={activeTabId}
            onChange={(e) => {
              setError(null);
              setActiveTabId(e.target.value as SettingsTabId);
            }}
          >
            {settingsTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Nav (Hidden on Mobile) */}
          <div className="hidden md:block w-full md:w-1/4 lg:w-1/5 space-y-1">
            <nav className="flex flex-col sticky top-20"> 
              {settingsTabs.map((tab) => (
                <TabButton key={tab.id} tab={tab} isActive={activeTabId === tab.id} />
              ))}
              </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 