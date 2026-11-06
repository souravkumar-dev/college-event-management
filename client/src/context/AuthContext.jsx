import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { getToken, setToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    authService.me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, remember = true) => {
    const { token, user: u } = await authService.login({ email, password });
    setToken(token, remember);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user: u } = await authService.register(data);
    setToken(token, true);
    setUser(u);
    return u;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const { token, user: u } = await authService.google(credential);
    setToken(token, true);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const homeFor = (user) => (user?.role === 'organizer' ? '/organizer/dashboard' : '/student/registrations');
