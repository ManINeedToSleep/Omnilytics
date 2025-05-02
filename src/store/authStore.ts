import { create } from 'zustand';
import { User } from 'firebase/auth'; // Import Firebase User type

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,            // Initially, no user is logged in
  isLoading: true,       // Initially, loading until auth state is checked
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
})); 