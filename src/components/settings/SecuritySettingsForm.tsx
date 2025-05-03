/**
 * @fileoverview Component for displaying and handling security settings, like password change.
 * Receives save handler as props from the main settings page.
 * Connects to:
 *   - src/app/dashboard/settings/page.tsx (Parent)
 */
import React, { FormEvent } from 'react';

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

interface SecuritySettingsFormProps {
  onSecuritySave: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean; // To disable button during save
}

export default function SecuritySettingsForm({ 
  onSecuritySave, 
  isSaving 
}: SecuritySettingsFormProps) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Security</h3>
      {/* I'll pass the handler down */}
      <form onSubmit={onSecuritySave} className="space-y-6">
        <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Password</label>
           <InputField className="mb-3" type="password" placeholder="Current Password" autoComplete="current-password" required />
           <InputField className="mb-3" type="password" placeholder="New Password" autoComplete="new-password" required />
           <InputField type="password" placeholder="Confirm New Password" autoComplete="new-password" required />
         </div>
         {/* Placeholder sections for 2FA and Sessions */}
         <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Advanced Security</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Two-Factor Authentication (TODO)</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Active Sessions (TODO)</p>
         </div>
         <SaveButton disabled={isSaving}>{isSaving ? 'Saving...' : 'Update Security Settings'}</SaveButton>
      </form>
    </div>
  );
} 