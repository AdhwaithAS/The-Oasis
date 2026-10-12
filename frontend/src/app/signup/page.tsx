'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../../lib/api';
import { UserRole } from '../../lib/types';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  ShieldCheck
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<UserRole>('GUEST'); // Public registration is exclusively for Guests
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const isEmailValid = (e: string) => e.includes('@') && e.includes('.');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!isEmailValid(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+1 555-019-2831',
        password: password.trim(),
        role,
      });

      setSuccessMsg(`Welcome to The Oasis, ${res.user?.name || name}! Redirecting...`);
      try {
        localStorage.setItem('hotel_user', JSON.stringify(res.user));
        localStorage.setItem('hotel_token', res.token);
      } catch {}
      setLoading(false);
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleSocialClick = (provider: string) => {
    setErrorMsg(`OAuth provider (${provider}) is currently configured for direct enterprise SSO.`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
      color: '#111827',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* =========================================================================
          TOP NAVIGATION (Matches Reference Image)
          ========================================================================= */}
      <header style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(16px, 3vw, 28px) clamp(16px, 3vw, 32px) 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Left: Back Link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#1f2937',
            fontSize: '0.92rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>

        {/* Center: Brand Logo & Title */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: '#0f172a',
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '2px solid #0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #0f172a',
            }} />
          </div>
          <span style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}>
            The Oasis
          </span>
        </Link>

        {/* Right: Contact Support Link */}
        <button
          onClick={() => setSupportModalOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#4b5563',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.15s ease',
          }}
        >
          Contact support
        </button>
      </header>

      {/* =========================================================================
          MAIN CONTAINER WITH FLOATING CARD
          ========================================================================= */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px clamp(12px, 3vw, 20px) 80px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Floating Centered Registration Card */}
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(24px, 4vw, 36px) clamp(18px, 4vw, 32px) clamp(20px, 4vw, 30px)',
          boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Card Header */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 500,
              color: '#111827',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
              fontFamily: 'Georgia, Cambria, serif',
            }}>
              Join The Oasis
            </h1>
            <p style={{
              fontSize: '0.86rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: 400,
            }}>
              Create your account to save stays and manage reservations
            </p>
          </div>

          {/* Social Login 3-Button Row (Matches Reference: X, Apple, Google) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '18px',
          }}>
            {/* X (Twitter) */}
            <button
              type="button"
              onClick={() => handleSocialClick('X')}
              title="Continue with X"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#111827',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialClick('Apple')}
              title="Continue with Apple"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#111827',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.97.99-3.14-1 .04-2.22.67-2.91 1.49-.61.71-1.15 1.88-.99 3.01 1.12.09 2.26-.57 2.91-1.36z"/>
              </svg>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              title="Continue with Google"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '18px 0 20px',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{
              padding: '0 12px',
              fontSize: '0.8rem',
              color: '#9ca3af',
              fontWeight: 500,
            }}>
              or
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 500,
              marginBottom: '16px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegisterSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '5px',
              }}>
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kristin Watson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '5px',
              }}>
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="guest@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '5px',
              }}>
                Phone number
              </label>
              <input
                type="tel"
                placeholder="+1 555-019-2831"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '5px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#111827',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Account Type Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.76rem',
              color: '#6b7280',
            }}>
              <ShieldCheck size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span>Standard Guest Account • Staff/Admin accounts are assigned by Administrator</span>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#1f1f1f',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s, transform 0.1s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0a0a0a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1f1f1f')}
            >
              {loading ? 'Creating account...' : 'Continue with Email'}
            </button>
          </form>

          {/* Bottom Link: "Already have an account? Log in" */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '0.86rem',
            color: '#6b7280',
          }}>
            Already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: '#111827',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* =========================================================================
          BOTANICAL LANDSCAPE WATERCOLOR ILLUSTRATION (Bottom Section from Image)
          ========================================================================= */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '46vh',
        minHeight: '280px',
        maxHeight: '480px',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {/* Soft top gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 2,
        }} />

        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}>
          <Image
            src="/images/auth_landscape_illustration.jpg"
            alt="The Oasis Sanctuary Illustration"
            fill
            sizes="100vw"
            priority
            style={{
              objectFit: 'cover',
              objectPosition: 'center bottom',
              opacity: 0.96,
            }}
          />
        </div>
      </div>

      {/* Support Modal */}
      {supportModalOpen && (
        <div
          onClick={() => setSupportModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px 30px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} style={{ color: '#111827' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                  The Oasis Concierge
                </h3>
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px' }}>
              Need assistance with your registration or booking? Our concierge team is ready to help 24/7.
            </p>
            <div style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              color: '#111827',
              marginBottom: '20px',
            }}>
              <div><strong>Email:</strong> concierge@theoasis-hotel.com</div>
              <div style={{ marginTop: '4px' }}><strong>Phone:</strong> +1 (800) 420-STAY</div>
            </div>
            <button
              onClick={() => setSupportModalOpen(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: '#111827',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
