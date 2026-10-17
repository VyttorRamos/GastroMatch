import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from './api';

type AuthContextValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    authService.me().then(setUser).catch(() => authService.logout()).finally(() => setLoading(false));
  }, []);
  const value: AuthContextValue = {
    user, loading,
    async login(email, password) { const data = await authService.login(email, password); setUser(data.user); },
    async logout() { await authService.logout(); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return value;
}
