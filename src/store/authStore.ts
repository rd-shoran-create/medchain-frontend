import { create } from 'zustand';

export type Role = 'guest' | 'hospital' | 'dealer' | 'store' | 'regulator';

interface AuthState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'guest',
  setRole: (role) => set({ role }),
}));
