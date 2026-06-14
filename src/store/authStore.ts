import { create } from "zustand";
import type { AppUser } from "@/types";

interface AuthState {
  user: AppUser | null;
  isPremium: boolean;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setPremium: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isPremium: false,
  loading: true,
  setUser: (user) => set({ user }),
  setPremium: (isPremium) => set({ isPremium }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, isPremium: false, loading: false }),
}));
