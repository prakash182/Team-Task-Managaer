import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckSquare, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <CheckSquare size={32} className="brand-icon" />
          <span>TaskFlow</span>
        </div>
        <div className="auth-tagline">
          <h1>Manage tasks.<br />Ship faster.</h1>
          <p>Organize projects, assign work to your team, and track progress — all in one clean workspace.</p>
        </div>
        <div className="auth-features">
          {['Role-based access control', 'Real-time task tracking', 'Team collaboration', 'Priority & due dates'].map(f => (
            <div key={f} className="auth-feature-item">
              <div className="feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-tabs">
            <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Sign In</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text" name="name" placeholder="John Doe"
                    value={form.name} onChange={handleChange} required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password" name="password" placeholder="••••••••"
                  value={form.password} onChange={handleChange} required minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}<button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;