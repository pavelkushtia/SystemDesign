import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const iconStyle = { width: '1rem', height: '1rem', maxWidth: '1rem', maxHeight: '1rem' };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (result.success) {
        // Give a small delay to ensure auth state is updated
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            // Use window.location.href as fallback to ensure navigation works
            window.location.href = '/dashboard';
          }
        }, 100);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = (provider: string) => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  // OAuth Provider Icons as SVG components (shared with LoginForm)
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
          Create Your Account
        </h2>
        <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
          Join ScaleSim to start building and simulating systems
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label htmlFor="firstName" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              placeholder="Doe"
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.15s ease-in-out'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            placeholder="john.doe@example.com"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              {showPassword ? 
                <EyeSlashIcon style={iconStyle} /> : 
                <EyeIcon style={iconStyle} />
              }
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              {showConfirmPassword ? 
                <EyeSlashIcon style={iconStyle} /> : 
                <EyeIcon style={iconStyle} />
              }
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease-in-out'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.backgroundColor = '#3b82f6';
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
        <div style={{ 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            position: 'absolute',
            width: '100%',
            height: '1px',
            backgroundColor: '#e5e7eb'
          }}></div>
          <span style={{ 
            backgroundColor: 'white',
            padding: '0 1rem',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            Or continue with
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => handleOAuthRegister('google')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            transition: 'all 0.15s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f9fafb';
            e.target.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#d1d5db';
          }}
        >
          <GoogleIcon />
        </button>
        <button
          onClick={() => handleOAuthRegister('github')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            transition: 'all 0.15s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f9fafb';
            e.target.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#d1d5db';
          }}
        >
          <GitHubIcon />
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 