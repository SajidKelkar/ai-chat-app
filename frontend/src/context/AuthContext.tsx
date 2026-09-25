import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { getProfile, normalizeProfile, type UserProfile } from '@/api/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: UserProfile | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
  setUser: (user: UserProfile | null) => void;
  logoutFrontend: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const checkAuth = useCallback(async () => {
    try {
      const data = await getProfile();
      const profile = normalizeProfile(data);
      if (profile && (profile._id || profile.id || profile.email)) {
        setUser(profile);
        setStatus('authenticated');
        return true;
      }
      setUser(null);
      setStatus('unauthenticated');
      return false;
    } catch {
      setUser(null);
      setStatus('unauthenticated');
      return false;
    }
  }, []);

  const logoutFrontend = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, isAuthenticated: status === 'authenticated', checkAuth, setUser, logoutFrontend }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
