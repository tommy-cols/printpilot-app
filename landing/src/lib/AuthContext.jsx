import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLicense(data.license);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser(data.user);
        await fetchUser(data.access_token);
        return { success: true };
      } else {
        setError(data.detail || 'Login failed');
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (email, password, fullName) => {
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      if (fullName) formData.append('full_name', fullName);
      
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.detail || 'Signup failed');
        return { success: false, error: data.detail || 'Signup failed' };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setLicense(null);
    }
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    
    try {
      const formData = new FormData();
      formData.append('refresh_token', refresh);
      
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
    }
    
    // Refresh failed, logout
    await logout();
    return false;
  };

  const value = {
    user,
    license,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshToken,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
