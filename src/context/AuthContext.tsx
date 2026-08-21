import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { MOCK_USERS, type User, type UserRole } from '../types/user';
import { readStorage, writeStorage } from '../utils/storage';

const AUTH_STORAGE_KEY = 'app_current_user';
const USERS_CUSTOM_KEY = 'app_users_custom';
const USER_OVERRIDES_KEY = 'app_user_overrides';

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
  refreshUsers: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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

function loadCustomUsers(): User[] {
  const data = readStorage<unknown>(USERS_CUSTOM_KEY, []);
  return Array.isArray(data) ? (data as User[]) : [];
}

function loadUserOverrides(): Record<string, Partial<User>> {
  const data = readStorage<unknown>(USER_OVERRIDES_KEY, {});
  return typeof data === 'object' && data !== null ? (data as Record<string, Partial<User>>) : {};
}

function getAllUsers(): User[] {
  const customUsers = loadCustomUsers();
  const overrides = loadUserOverrides();
  return [
    ...MOCK_USERS.map((u) => {
      const override = overrides[u.id];
      return override ? { ...u, ...override } : u;
    }),
    ...customUsers,
  ];
}

function findUserById(userId: string): User | null {
  return getAllUsers().find((u) => u.id === userId) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Counter untuk trigger refresh allUsers
  const [usersVersion, setUsersVersion] = useState(0);

  // Initialize auth dari localStorage (sekali saat mount)
  useEffect(() => {
    try {
      const storedId = readStorage<string>(AUTH_STORAGE_KEY, '');
      if (storedId) {
        const found = findUserById(storedId);
        if (found) {
          setUser(found);
        }
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  // Refresh user dari allUsers saat storage berubah (misal Admin edit user di tab lain)
  useEffect(() => {
    if (!isLoading && user) {
      const refreshed = findUserById(user.id);
      if (refreshed && JSON.stringify(refreshed) !== JSON.stringify(user)) {
        setUser(refreshed);
      }
    }
  });

  const login = useCallback((userId: string) => {
    const found = findUserById(userId);
    if (found) {
      setUser(found);
      writeStorage(AUTH_STORAGE_KEY, found.id);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStorage(AUTH_STORAGE_KEY, '');
  }, []);

  const refreshUsers = useCallback(() => {
    setUsersVersion((v) => v + 1);
    if (user) {
      const refreshed = findUserById(user.id);
      if (refreshed) {
        setUser(refreshed);
      }
    }
  }, [user]);

  const role: UserRole | null = user?.role ?? null;

  const allUsers = useMemo(() => getAllUsers(), [user, usersVersion]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    users: allUsers,
    login,
    logout,
    refreshUsers,
    isAuthenticated: user !== null,
    isLoading,
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
  }), [user, allUsers, login, logout, refreshUsers, role, isLoading]);

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