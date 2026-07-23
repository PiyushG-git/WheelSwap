import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, register, error, resetError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    resetError();
    setLocalError('');
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setLocalError('Email and Password are required');
      return;
    }

    try {
      if (activeTab === 'login') {
        await login({ email: formData.email, password: formData.password });
        navigate('/');
      } else {
        if (!formData.name) {
          setLocalError('Full Name is required for registration');
          return;
        }
        await register(formData);
        setSuccessMsg('Registration successful! Please check your email for a verification link.');
        setActiveTab('login');
      }
    } catch (err: any) {
      // Handled by Redux, error state populated
    }
  };

  return (
    <div className="auth-page card">
      <div className="auth-tabs">
        <button
          onClick={() => setActiveTab('login')}
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
        >
          Register
        </button>
      </div>

      {(error || localError) && (
        <div className="alert alert-danger">
          {localError || error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {activeTab === 'register' && (
          <>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          {activeTab === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
