'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { UserRole } from '../lib/types';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Crown,
  ConciergeBell,
  ShieldCheck
} from 'lucide-react';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Please enter a valid full name.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98470 00000',
        password: password.trim(),
        role: role as UserRole,
      });

      setSuccessMsg(`New ${role} account created successfully for ${name}!`);
      setLoading(false);
      setTimeout(() => {
        onSuccess();
        onClose();
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to create staff account. Administrator privileges required.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3.5vw, 28px)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
                Add Staff or Administrator
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Admin privilege required. Provision new operations accounts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-circle"
            style={{ width: '34px', height: '34px', border: 'none', background: 'var(--bg-input)', boxShadow: 'none', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 'clamp(16px, 3.5vw, 28px)' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fff1f2',
              color: '#e11d48',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ecfdf5',
              color: '#059669',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.86rem',
              fontWeight: 700,
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Choice */}
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label">Role Permission *</label>
            <div className="form-grid-2" style={{ gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRole('STAFF')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: role === 'STAFF' ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
                  background: role === 'STAFF' ? '#f0fdf4' : '#ffffff',
                  color: role === 'STAFF' ? '#16a34a' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                <ConciergeBell size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div>Hotel Staff</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Check-in & Check-out</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: role === 'ADMIN' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                  background: role === 'ADMIN' ? '#eff6ff' : '#ffffff',
                  color: role === 'ADMIN' ? '#2563eb' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                <Crown size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div>Administrator</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Full system control</div>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. Arjun B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Corporate Email Address *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="staff@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Phone Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="+91 98472 34567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Temporary Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                  color: '#64748b',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary" style={{ flex: '1 1 100px' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: '1 1 160px' }}
            >
              {loading ? 'Creating...' : `Create ${role === 'STAFF' ? 'Staff' : 'Admin'} User`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
