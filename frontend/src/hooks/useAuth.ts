import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const checkAuthStatus = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        // Token might be expired, try to refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    if (!refreshTokenValue) {
      logout();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        
        // Check auth status again with new token
        await checkAuthStatus();
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });

    // Optionally notify the server about logout
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    }).catch(console.error);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, [checkAuthStatus]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }, [checkAuthStatus]);

  // Set up automatic token refresh
  useEffect(() => {
    checkAuthStatus();

    const interval = setInterval(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && authState.isAuthenticated) {
        // Try to refresh token every 50 minutes (tokens typically expire after 1 hour)
        refreshToken();
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuthStatus, refreshToken, authState.isAuthenticated]);

  // Helper function to get auth headers for API calls
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
  }, []);

  // Helper function to make authenticated API calls
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const accessToken = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If we get a 401, try to refresh the token once
    if (response.status === 401 && authState.isAuthenticated) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry the request with the new token
        const newAccessToken = localStorage.getItem('accessToken');
        const newHeaders: Record<string, string> = {
          ...(options.headers as Record<string, string> || {}),
          ...(newAccessToken ? { 'Authorization': `Bearer ${newAccessToken}` } : {})
        };
        return fetch(url, {
          ...options,
          headers: newHeaders
        });
      }
    }

    return response;
  }, [refreshToken, authState.isAuthenticated]);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    checkAuthStatus,
    getAuthHeaders,
    authenticatedFetch
  };
}; 