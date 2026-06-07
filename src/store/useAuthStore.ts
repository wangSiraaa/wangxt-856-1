import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authenticate, MOCK_USERS } from '../utils/mock';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const STORAGE_KEY = 'water_gauge_auth';

function loadStoredAuth(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load auth from storage', e);
  }
  return null;
}

function saveAuthToStorage(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth to storage', e);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: loadStoredAuth(),
  isAuthenticated: !!loadStoredAuth(),

  login: async (username: string, password: string): Promise<boolean> => {
    const user = authenticate(username, password);
    if (user) {
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as Partial<User>).password;
      set({ currentUser: userWithoutPassword, isAuthenticated: true });
      saveAuthToStorage(userWithoutPassword);
      return true;
    }
    return false;
  },

  logout: (): void => {
    set({ currentUser: null, isAuthenticated: false });
    saveAuthToStorage(null);
  },

  hasRole: (role: UserRole | UserRole[]): boolean => {
    const { currentUser } = get();
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  },
}));
