import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset fetch mock
    mockFetch.mockClear();
    
    // Mock successful responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          emailVerified: true
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      }),
      text: async () => JSON.stringify({
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          emailVerified: true
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      })
    } as Response);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it('should check auth status on mount if token exists', async () => {
      localStorage.setItem('accessToken', 'existing-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer existing-token'
        }
      });
    });

    it('should not make API call if no token exists', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
      expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({
          success: false,
          error: 'Invalid credentials'
        })
      } as Response);

      const { result } = renderHook(() => useAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too many requests'
      } as Response);

      const { result } = renderHook(() => useAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Too many requests');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Login failed');
    });
  });

  describe('Register', () => {
    it('should register successfully with valid data', async () => {
      const { result } = renderHook(() => useAuth());

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      let registerResult: any;
      await act(async () => {
        registerResult = await result.current.register(userData);
      });

      expect(registerResult.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
      expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });

    it('should handle registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({
          success: false,
          error: 'Email already exists'
        })
      } as Response);

      const { result } = renderHook(() => useAuth());

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      let registerResult: any;
      await act(async () => {
        registerResult = await result.current.register(userData);
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe('Email already exists');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should transform firstName/lastName to first_name/last_name', async () => {
      const { result } = renderHook(() => useAuth());

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await act(async () => {
        await result.current.register(userData);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
          terms_accepted: true
        })
      });
    });
  });

  describe('Logout', () => {
    it('should logout and clear tokens', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh tokens successfully', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      const { result } = renderHook(() => useAuth());

      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: 'valid-refresh-token' })
      });
    });

    it('should handle refresh failure', async () => {
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response);

      const { result } = renderHook(() => useAuth());

      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return false if no refresh token exists', async () => {
      const { result } = renderHook(() => useAuth());

      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Auth Status Check', () => {
    it('should check auth status and set user data', async () => {
      localStorage.setItem('accessToken', 'valid-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
    });

    it('should handle 401 and attempt token refresh', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      // First call returns 401, second call (after refresh) returns success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token'
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              id: 'user-123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User'
            }
          })
        } as Response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(3); // auth check, refresh, retry auth check
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });

    it('should handle rate limiting gracefully', async () => {
      localStorage.setItem('accessToken', 'valid-token');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      } as Response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not logout on rate limit
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('accessToken')).toBe('valid-token');
    });
  });

  describe('Authenticated Fetch', () => {
    it('should add authorization header to requests', async () => {
      localStorage.setItem('accessToken', 'test-token');

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.authenticatedFetch('/api/test');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    it('should handle 401 and refresh token automatically', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      // Mock 401 response, then successful refresh, then successful retry
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token'
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const { result } = renderHook(() => useAuth());

      // Set authenticated state
      act(() => {
        result.current.login('test@example.com', 'password');
      });

      await act(async () => {
        await result.current.authenticatedFetch('/api/test');
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });

    it('should work without access token', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.authenticatedFetch('/api/test');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        headers: {}
      });
    });
  });

  describe('Auth Headers', () => {
    it('should return authorization header when token exists', () => {
      localStorage.setItem('accessToken', 'test-token');

      const { result } = renderHook(() => useAuth());

      const headers = result.current.getAuthHeaders();

      expect(headers).toEqual({
        'Authorization': 'Bearer test-token'
      });
    });

    it('should return empty object when no token exists', () => {
      const { result } = renderHook(() => useAuth());

      const headers = result.current.getAuthHeaders();

      expect(headers).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid JSON response'
      } as Response);

      const { result } = renderHook(() => useAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid JSON response');
    });

    it('should handle empty response text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => ''
      } as Response);

      const { result } = renderHook(() => useAuth());

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Login failed');
    });

    it('should prevent multiple simultaneous auth checks', async () => {
      localStorage.setItem('accessToken', 'test-token');

      const { result } = renderHook(() => useAuth());

      // Call checkAuthStatus multiple times rapidly
      await act(async () => {
        await Promise.all([
          result.current.checkAuthStatus(),
          result.current.checkAuthStatus(),
          result.current.checkAuthStatus()
        ]);
      });

      // Should only make one API call due to the ref guard
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});