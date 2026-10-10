import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ecotrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ecotrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('ecotrack_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('ecotrack_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ecotrack_theme', 'light');
    }
  }, [darkMode]);

  // Verify token and sync user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          setUser(res.data);
          localStorage.setItem('ecotrack_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Session check failed:', err);
        localStorage.removeItem('ecotrack_token');
        localStorage.removeItem('ecotrack_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const saveAuthSession = (authData) => {
    const jwt = authData.token;
    const userObj = authData.user;
    localStorage.setItem('ecotrack_token', jwt);
    localStorage.setItem('ecotrack_user', JSON.stringify(userObj));
    setToken(jwt);
    setUser(userObj);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveAuthSession(res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    saveAuthSession(res.data);
    return res.data;
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo-login');
    saveAuthSession(res.data);
    return res.data;
  };

  const seedDemoData = async () => {
    const res = await api.post('/demo/seed');
    const me = await api.get('/auth/me');
    if (me.data) {
      setUser(me.data);
      localStorage.setItem('ecotrack_user', JSON.stringify(me.data));
    }
    return res.data;
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('ecotrack_user', JSON.stringify(res.data));
      }
    } catch {
      // ignore
    }
  }, []);

  const updatePreferences = async (updates) => {
    const res = await api.put('/auth/preferences', updates);
    if (res.data) {
      setUser(res.data);
      localStorage.setItem('ecotrack_user', JSON.stringify(res.data));
    }
    return res.data;
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        register,
        demoLogin,
        seedDemoData,
        refreshUser,
        updatePreferences,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
