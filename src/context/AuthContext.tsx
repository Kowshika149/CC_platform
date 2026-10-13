import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/creators';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (data: Partial<User> & { password: string }) => User;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'cc_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found as User);
      return true;
    }
    const storedUsers = JSON.parse(localStorage.getItem('cc_users') || '[]') as User[];
    const registered = storedUsers.find((u) => u.email === email && u.password === password);
    if (registered) {
      setUser(registered);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((data: Partial<User> & { password: string }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: data.fullName || '',
      email: data.email || '',
      mobile: data.mobile || '',
      password: data.password,
      role: data.role || 'seeker',
      city: data.city,
      professionalName: data.professionalName,
      yearsExperience: data.yearsExperience,
      categories: data.categories,
      services: data.services,
      rates: data.rates,
      paymentPreferences: data.paymentPreferences,
      bio: data.bio,
      onboardingComplete: false,
      creatorStatus: data.creatorStatus || (data.role === 'creator' ? 'draft' : undefined),
    };
    const storedUsers = JSON.parse(localStorage.getItem('cc_users') || '[]') as User[];
    storedUsers.push(newUser);
    localStorage.setItem('cc_users', JSON.stringify(storedUsers));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      const storedUsers = JSON.parse(localStorage.getItem('cc_users') || '[]') as User[];
      const idx = storedUsers.findIndex((u) => u.id === prev.id);
      if (idx >= 0) {
        storedUsers[idx] = updated;
        localStorage.setItem('cc_users', JSON.stringify(storedUsers));
      }
      return updated;
    });
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        role,
        ...(role === 'creator' && !prev.creatorStatus ? { creatorStatus: 'approved' as const } : {}),
        ...(role === 'creator' && !prev.professionalName ? { professionalName: 'Arjun Creative Studio' } : {}),
      };
      const storedUsers = JSON.parse(localStorage.getItem('cc_users') || '[]') as User[];
      const idx = storedUsers.findIndex((u) => u.id === prev.id);
      if (idx >= 0) {
        storedUsers[idx] = updated;
        localStorage.setItem('cc_users', JSON.stringify(storedUsers));
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
