'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useShallow } from 'zustand/react/shallow';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore(useShallow((state) => ({
    user: state.user,
    isLoading: state.isLoading,
  })));

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isLoading && !user) {
      router.push('/auth'); // Redirect to your authentication page
    }
  }, [user, isLoading, router]);

  // While loading or if there's no user (before redirect kicks in),
  // show loading or nothing to prevent flash of protected content.
  if (isLoading || !user) {
    return <div>Loading...</div>; // Or a proper skeleton/spinner
  }

  // If loading is finished and user exists, render the protected content
  return <>{children}</>;
} 