'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'institution_admin' | 'admin' | 'institution';
  avatarUrl: string,
  refreshToken?: string; // Optional for storing refresh token
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const refreshUserSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await authService.refreshToken(refreshToken);
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        if (response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      setUser(null);
    }
    return false;
  };
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      // If we have a token, check if it's expired
      if (token) {
        if (!isTokenExpired(token)) {
          // Token is valid, restore user from localStorage
          if (userData && userData !== 'undefined') {
            try {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
            } catch (error) {
              console.error('Error parsing stored user data:', error);
              localStorage.removeItem('userData');
            }
          }
        } else {
          // Token expired, try to refresh
          console.log('Token expired, attempting refresh...');
          const refreshed = await refreshUserSession();
          if (!refreshed) {
            // If refresh fails, clear everything
            console.log('Token refresh failed, clearing session');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            setUser(null);
          }
        }
      } else if (userData && userData !== 'undefined') {
        // If no token but we have user data, try to restore (but user will need to login again for API calls)
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('userData');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const setupTokenRefresh = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        
        // If token expires in less than 5 minutes, refresh it now
        if (timeUntilExpiry < 5 * 60 * 1000) {
          refreshUserSession().then(refreshed => {
            if (!refreshed) {
              logout();
            }
          });
        } else {
          // Set up refresh 5 minutes before expiry
          const refreshTime = timeUntilExpiry - 5 * 60 * 1000;
          setTimeout(() => {
            refreshUserSession().then(refreshed => {
              if (!refreshed) {
                logout();
              }
            });
          }, refreshTime);
        }
      } catch (error) {
        console.error('Error setting up token refresh:', error);
      }
    };

    setupTokenRefresh();
    
    // Also check every 5 minutes as a fallback
    const interval = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      if (token && isTokenExpired(token)) {
        refreshUserSession().then(refreshed => {
          if (!refreshed) {
            logout();
          }
        });
      }
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);
  const login = async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    if (data.user && data.accessToken) {
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Redirect based on user role using Next.js router
      const redirectPath = data.user.role === 'admin' 
        ? '/dashboard/admin' 
        : data.user.role === 'institution' 
        ? '/dashboard/institution' 
        : '/dashboard/user';
      router.push(redirectPath);
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; role?: string }) => {
    const response = await authService.register(data);
    if (response.user && response.accessToken) {
      setUser(response.user);
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.setItem('userData', JSON.stringify(response.user));
    }
  };

  const logout = useCallback(() => {
    authService.logout().catch(console.error);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}