/**
 * @fileoverview Component for displaying and potentially editing user profile and basic account settings.
 * Receives user data and save handlers as props from the main settings page.
 * Connects to:
 *   - src/app/dashboard/settings/page.tsx (Parent)
 *   - src/lib/models/user.model.ts (Uses User type)
 */
import React, { FormEvent } from 'react';
import type { User as FirestoreUser } from '@/lib/models/user.model';

// Reusable Input Component (Could be moved to a shared UI folder later)
const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${props.disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''} ${props.className}`}
  />
);

// Reusable Save Button (Could be moved to a shared UI folder later)
const SaveButton = ({ children, disabled }: { children: React.ReactNode, disabled?: boolean }) => (
    <button 
      type="submit" 
      disabled={disabled}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50"
    >
        {children}
    </button>
);

interface ProfileSettingsFormProps {
  firestoreUser: FirestoreUser | null;
  onProfileSave: (e: FormEvent<HTMLFormElement>) => void;
  onAccountSave: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean; // To disable buttons during save
}

export default function ProfileSettingsForm({ 
  firestoreUser, 
  onProfileSave, 
  onAccountSave,
  isSaving
}: ProfileSettingsFormProps) {
  
  // Loading/Error state is handled by the parent page component
  if (!firestoreUser) {
    // This shouldn't typically be reached if parent handles loading/error, but good safety check
    return <div className="text-gray-500 dark:text-gray-400">User data not available.</div>; 
  }

  return (
    <div className="space-y-8">
      {/* Profile Form Card */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Profile Information</h3>
        {/* I'll pass the handler down */}
        <form onSubmit={onProfileSave} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
               {/* Added id and name attributes */}
               <InputField id="firstName" name="firstName" type="text" placeholder="Your first name" defaultValue={firestoreUser.displayName?.split(' ')[0] || ''} />
             </div>
             <div>
               <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
               <InputField id="lastName" name="lastName" type="text" placeholder="Your last name" defaultValue={firestoreUser.displayName?.split(' ').slice(1).join(' ') || ''} />
             </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <InputField id="email" name="email" type="email" placeholder="Email" disabled value={firestoreUser.email || ''} />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company (Optional)</label>
            <InputField id="company" name="company" type="text" placeholder="Your company name" />
          </div>
          <SaveButton disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Profile'}</SaveButton>
        </form>
      </div>

      {/* Account Settings Form Card */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Account Settings</h3>
        {/* I'll pass the handler down */}
        <form onSubmit={onAccountSave} className="space-y-6">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <InputField id="language" name="language" type="text" placeholder="English (US)" />
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
            <InputField id="timezone" name="timezone" type="text" placeholder="UTC-5 (Eastern Time)" />
          </div>
          <SaveButton disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Account Settings'}</SaveButton>
        </form>
      </div>
    </div>
  );
} 