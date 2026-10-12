'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  RefreshCw,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  UserPlus,
  Activity,
  Layers,
  BedDouble,
  CalendarDays,
  LayoutDashboard
} from 'lucide-react';
import { User } from '../lib/types';

interface NavbarProps {
  activeTab: 'dashboard' | 'reservations' | 'rooms' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'reservations' | 'rooms' | 'logs') => void;
  onOpenBooking: () => void;
  isBackendConnected: boolean;
  onRefresh: () => void;
  loading: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenBooking,
  isBackendConnected,
  onRefresh,
  loading,
  currentUser,
  onLogout,
}: NavbarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'ADMIN':
        return (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
          }}>
            Admin
          </span>
        );
      case 'STAFF':
        return (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
          }}>
            Staff
          </span>
        );
      case 'GUEST':
        return (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: '#faf5ff',
            color: '#7e22ce',
            border: '1px solid #e9d5ff',
          }}>
            Guest
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#ffffff',
        borderBottom: '1px solid #eef2f6',
        position: 'relative',
        zIndex: 50,
      }}>
        {/* LEFT: Hotel Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}>
            <Building2 size={17} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                margin: 0,
              }}>
                The Oasis
              </h1>
              {getRoleBadge()}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              color: '#64748b',
              marginTop: '1px',
            }}>
              <span className="hide-on-mobile">Operations Console</span>
              <span className="hide-on-mobile">•</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isBackendConnected ? '#16a34a' : '#ea580c',
                fontWeight: 600,
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isBackendConnected ? '#16a34a' : '#ea580c',
                }} />
                {isBackendConnected ? 'Supabase Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Navigation Tabs (Pill Style) - Hidden on Mobile, handled by Bottom Nav */}
        <nav
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f3f7',
            padding: '4px',
            borderRadius: '9999px',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'dashboard' ? '#111827' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'reservations' ? '#111827' : 'transparent',
              color: activeTab === 'reservations' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <CalendarDays size={15} />
            <span>{currentUser?.role === 'GUEST' ? 'My Bookings' : 'Reservations'}</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'rooms' ? '#111827' : 'transparent',
              color: activeTab === 'rooms' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <BedDouble size={15} />
            <span>Rooms</span>
          </button>

          {/* Audit Logs tab only visible to ADMIN */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'logs' ? '#111827' : 'transparent',
                color: activeTab === 'logs' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={15} />
              <span>Audit Logs</span>
            </button>
          )}
        </nav>

        {/* RIGHT: Quick Action Buttons & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="btn-circle"
            title="Refresh Data"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
          </button>

          {/* Book Room CTA */}
          <button
            onClick={onOpenBooking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={15} />
            <span className="hide-on-mobile">New Booking</span>
            <span className="show-on-mobile">Book</span>
          </button>

          {/* User Account / Auth Dropdown */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px 5px 5px',
                  borderRadius: '9999px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '220px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px -5px rgba(0,0,0,0.12)',
                    padding: '12px',
                    zIndex: 100,
                  }}
                >
                  <div style={{ paddingBottom: '10px', marginBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', wordBreak: 'break-all' }}>
                      {currentUser.email}
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      {getRoleBadge()}
                    </div>
                  </div>

                  <Link
                    href="/login"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      color: '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <LogIn size={14} style={{ color: '#2563eb' }} />
                    <span>Switch Account</span>
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      color: '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <UserPlus size={14} style={{ color: '#16a34a' }} />
                    <span>Register User</span>
                  </Link>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#fff1f2',
                      color: '#e11d48',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>

              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for quick thumb access on phones) */}
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`bottom-nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
        >
          <CalendarDays size={18} />
          <span>{currentUser?.role === 'GUEST' ? 'Bookings' : 'Reservations'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`bottom-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
        >
          <BedDouble size={18} />
          <span>Rooms</span>
        </button>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('logs')}
            className={`bottom-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            <span>Audit Logs</span>
          </button>
        )}
      </nav>
    </>
  );
}
