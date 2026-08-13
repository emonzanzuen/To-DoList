import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { MOCK_USERS, type User, type UserRole } from '../types/user';
import { readStorage, writeStorage } from '../utils/storage';

const AUTH_STORAGE_KEY = 'app_current_user';

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  canApprove: boolean;
  canManageTeam: boolean;
  canDeleteProject: boolean;
  canDeleteTask: boolean;
  canEditTask: (assigneeId: string | null) => boolean;
  canSeeAllTasks: boolean;
  canClearCompleted: boolean;
  canManageClients: boolean;
  canDeleteAllData: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): User | null {
  const stored = readStorage<string>(AUTH_STORAGE_KEY, '');
  if (!stored) return null;
  return MOCK_USERS.find((u) => u.id === stored) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const login = useCallback((userId: string) => {
    const found = MOCK_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      writeStorage(AUTH_STORAGE_KEY, found.id);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStorage(AUTH_STORAGE_KEY, '');
  }, []);

  const role: UserRole | null = user?.role ?? null;

  const value = useMemo<AuthContextValue>(() => ({
    user,
    users: MOCK_USERS,
    login,
    logout,
    isAuthenticated: user !== null,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isMember: role === 'member',
    canApprove: role === 'admin' || role === 'manager',
    canManageTeam: role === 'admin',
    canDeleteProject: role === 'admin' || role === 'manager',
    canDeleteTask: role === 'admin' || role === 'manager',
    canClearCompleted: role === 'admin' || role === 'manager',
    canManageClients: role === 'admin' || role === 'manager',
    canDeleteAllData: role === 'admin',
    canSeeAllTasks: role === 'admin' || role === 'manager',
    canEditTask: (assigneeId: string | null) => {
      if (!user) return false;
      if (role === 'admin' || role === 'manager') return true;
      return assigneeId === user.id;
    },
  }), [user, login, logout, role]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}