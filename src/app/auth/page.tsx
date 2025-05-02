'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useShallow } from 'zustand/react/shallow';
import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore(useShallow((state) => ({
    user: state.user,
    isLoading: state.isLoading,
  })));

  useEffect(() => {
    // If auth state is checked and user exists, redirect to dashboard
    if (!isLoading && user) {
      router.push('/dashboard'); // Redirect to /dashboard
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth status
  if (isLoading) {
    return <div>Loading...</div>; // Or a proper skeleton/spinner
  }

  // If not loading and user is logged in, render null while redirect happens
  if (user) {
      return null;
  }

  // If not loading and no user, render the form
  return (
    <AuthForm />
  );
} 