import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('playhub_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('playhub_token') || null);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('playhub_token', token);
    } else {
      localStorage.removeItem('playhub_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('playhub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('playhub_user');
    }
  }, [user]);

  // Fetch current user on initial mount if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            // Token invalid or expired
            setUser(null);
            setToken(null);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('playhub_token');
    localStorage.removeItem('playhub_user');
  };

  const updateProfile = async (profileData) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authModalOpen,
        authMode,
        setAuthMode,
        openAuth,
        closeAuth,
        login,
        register,
        logout,
        updateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
