'use client';

import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signOut(auth);
      console.log('Logout successful');
      // Zustand store will be updated by the AuthProvider listener
      // Redirect happens because ProtectedRoute will no longer see a user
      // Or you can explicitly redirect:
      // router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show the button if the user is logged in
  if (!user) {
    return null;
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
} 