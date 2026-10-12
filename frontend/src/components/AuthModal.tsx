'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { User, UserRole } from '../lib/types';
import SafeIllustration from './SafeIllustration';
import { X, Mail, Lock, User as UserIcon, Phone, Check, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('ialirezamp@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isEmailValid = (e: string) => e.includes('@') && e.includes('.');

  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isEmailValid(loginEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email: loginEmail.trim(), password: loginPassword.trim() });
      setSuccessMsg('Signed in successfully!');
      setLoading(false);
      setTimeout(() => {
        onAuthSuccess(res.user, res.token);
        onClose();
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!isEmailValid(regEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: regEmail.trim(),
        phone: phone.trim() || '+1 555-019-2831',
        password: regPassword.trim(),
        role,
      });
      setSuccessMsg('Account registered successfully!');
      setLoading(false);
      setTimeout(() => {
        onAuthSuccess(res.user, res.token);
        onClose();
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        padding: '16px',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          borderRadius: '24px',
          padding: 0,
          background: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* LEFT COLUMN: Clean Form Area */}
        <div
          style={{
            padding: 'clamp(24px, 4vw, 40px) clamp(18px, 4vw, 44px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#ffffff',
            minHeight: 'auto',
          }}
        >
          <div>
            {/* Top Brand Header matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                <path d="M12.5 2L3 21H9.8L16.2 7.8L19.2 13.8L23.2 6.2L15 2H12.5Z" fill="#111827" />
                <path d="M17.5 15.2L14.5 21H21.5L25 15.2H17.5Z" fill="#111827" />
              </svg>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.32rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                  SmartSave
                </span>
                <span style={{ fontSize: '0.74rem', color: '#9CA3AF', fontWeight: 600 }}>• Grand Palm</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#8B95A5', marginTop: '6px', margin: 0, fontWeight: 500 }}>
                {mode === 'login'
                  ? 'Welcome Back , Please enter Your details'
                  : 'Join us today, please fill in your details'}
              </p>
            </div>

            {/* Segmented Pill Toggle (Sign In / Signup) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: '#F1F3F6',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: mode === 'login' ? '#ffffff' : 'transparent',
                  color: mode === 'login' ? '#111827' : '#6B7280',
                  fontWeight: mode === 'login' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: mode === 'register' ? '#ffffff' : 'transparent',
                  color: mode === 'register' ? '#111827' : '#6B7280',
                  fontWeight: mode === 'register' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Signup
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#DC2626',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ECFDF5',
                  border: '1px solid #D1FAE5',
                  color: '#059669',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '14px',
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Mode: Sign In */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                {/* Styled Input Card: Email Address (Exact Screenshot design) */}
                <div
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '9px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    marginBottom: '14px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Left rounded envelope box */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4B5563',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={16} strokeWidth={2} />
                  </div>

                  {/* Middle: Stacked Label & Input */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label
                      htmlFor="signin-email"
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        marginBottom: '2px',
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ialirezamp@gmail.com"
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#111827',
                        width: '100%',
                        padding: 0,
                        background: 'transparent',
                      }}
                    />
                  </div>

                  {/* Right: Green Validation Checkmark */}
                  {isEmailValid(loginEmail) && (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '9999px',
                        background: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Styled Input Card: Password */}
                <div
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '9px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    marginBottom: '18px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Left rounded lock box */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4B5563',
                      flexShrink: 0,
                    }}
                  >
                    <Lock size={16} strokeWidth={2} />
                  </div>

                  {/* Middle: Stacked Label & Input */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label
                      htmlFor="signin-password"
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        marginBottom: '2px',
                      }}
                    >
                      Password
                    </label>
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#111827',
                        width: '100%',
                        padding: 0,
                        background: 'transparent',
                      }}
                    />
                  </div>

                  {/* Right: Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Big Blue Continue Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#166FFF',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(22, 111, 255, 0.35)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {loading ? 'Continuing...' : 'Continue'}
                </button>
              </form>
            ) : (
              /* Form Mode: Signup */
              <form onSubmit={handleRegisterSubmit}>
                {/* Full Name */}
                <div
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4B5563',
                      flexShrink: 0,
                    }}
                  >
                    <UserIcon size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kristin Watson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#111827',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4B5563',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kristin@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#111827',
                        width: '100%',
                      }}
                    />
                  </div>
                  {isEmailValid(regEmail) && (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '9999px',
                        background: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Password & Phone Grid */}
                <div className="form-grid-2" style={{ gap: '8px', marginBottom: '10px' }}>
                  <div
                    style={{
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '14px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, width: '100%' }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '14px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selector Pill Card */}
                <div
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    Select Account Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    {(['GUEST', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '8px',
                          border: role === r ? '1.5px solid #166FFF' : '1px solid #E5E7EB',
                          background: role === r ? '#EFF6FF' : '#ffffff',
                          color: role === r ? '#166FFF' : '#4B5563',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {r === 'GUEST' ? 'Guest' : r === 'STAFF' ? 'Staff' : 'Admin'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Continue / Signup button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#166FFF',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(22, 111, 255, 0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </form>
            )}

            {/* Divider: Or Continue With */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '18px 0 16px',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>Or Continue With</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Social / Auth Circles matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('guest@hotel.com', 'guest123')}
                title="Sign in with Google (Quick Guest Login)"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '1.5px solid #E5E7EB',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('staff@hotel.com', 'staff123')}
                title="Sign in with Apple (Quick Staff Login)"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.49 2.68-1.24z" />
                </svg>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hotel.com', 'admin123')}
                title="Sign in with Facebook / Role (Quick Admin Login)"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#1877F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
                  transition: 'transform 0.15s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>

            {/* Quick 1-click preset badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hotel.com', 'admin123')}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Admin (Adhwaith)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff@hotel.com', 'staff123')}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Staff (Arjun)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('guest@hotel.com', 'guest123')}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Guest (Kristin)
              </button>
            </div>
          </div>

          {/* Bottom Disclaimer Text (Exact match from screenshot) */}
          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <p
              style={{
                fontSize: '0.72rem',
                color: '#9CA3AF',
                lineHeight: 1.5,
                margin: 0,
                textAlign: 'left',
              }}
            >
              Join the millions of smart investors and guests who trust us to manage their reservations. Log in to
              access your personalized dashboard, track your room bookings, and make informed hospitality decisions.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Isometric Safe / Vault on Sky Blue Gradient */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'stretch' }}>
          <SafeIllustration />
        </div>
      </div>
    </div>
  );
}
