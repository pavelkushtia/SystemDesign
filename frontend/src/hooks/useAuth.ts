import { useState, useEffect, useCallback, useRef } from 'react';

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

  // Use ref to prevent multiple simultaneous auth checks
  const isCheckingAuthRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Simple logout function with no dependencies
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  // Token refresh function - stable with no external dependencies
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    if (!refreshTokenValue) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        
        return true;
      } else {
        // Clear tokens on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;
    }
  }, []);

  // Check auth status - simplified and more reliable
  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuthRef.current) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }
    isCheckingAuthRef.current = true;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data || data;
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } else if (response.status === 401) {
        // Token expired - try refresh ONCE
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry with new token (only once)
          const newAccessToken = localStorage.getItem('accessToken');
          if (newAccessToken) {
            const retryResponse = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${newAccessToken}`
              }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              const userData = retryData.data || retryData;
              setAuthState({
                user: userData,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              logout();
            }
          }
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Don't logout on network errors, just set loading to false
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    } finally {
      isCheckingAuthRef.current = false;
    }
  }, [refreshToken, logout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // Read response body only once
      const responseText = await response.text();
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: responseText || 'Too many requests. Please try again later.' 
        };
      }

      // Parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        return { 
          success: false, 
          error: responseText || 'Login failed due to server error' 
        };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      // Update auth state synchronously
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, []);

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
        body: JSON.stringify({
          ...userData,
          first_name: userData.firstName,
          last_name: userData.lastName,
          terms_accepted: true
        })
      });

      // Read response body only once
      const responseText = await response.text();
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: responseText || 'Too many requests. Please try again later.' 
        };
      }

      // Parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        return { 
          success: false, 
          error: responseText || 'Registration failed due to server error' 
        };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      // Update auth state synchronously
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }, []);

  // Initialize auth state ONCE on mount with timeout fallback
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }));
      }, 5000); // 5 second timeout
      
      checkAuthStatus().finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }, [checkAuthStatus]);

  // Helper functions
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
  }, []);

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

    // Handle 401 with token refresh
    if (response.status === 401 && authState.isAuthenticated) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
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
  }, [authState.isAuthenticated, refreshToken]);

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