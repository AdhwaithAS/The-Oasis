'use client';

import React, { useState } from 'react';
import { User, Room } from '../lib/types';
import {
  Calendar,
  BedDouble,
  Users,
  Search,
  Star,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface HeroSectionProps {
  currentUser: User | null;
  onOpenBooking: (preselectedType?: string) => void;
  onOpenAuth: () => void;
  onNavigateTab: (tab: 'dashboard' | 'reservations' | 'rooms' | 'oop') => void;
}

export default function HeroSection({
  currentUser,
  onOpenBooking,
  onOpenAuth,
  onNavigateTab,
}: HeroSectionProps) {
  const [selectedType, setSelectedType] = useState('Standard');
  const [guestCount, setGuestCount] = useState('2');

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(nextWeek);

  const handleSearchAndBook = () => {
    onOpenBooking(selectedType);
  };

  return (
    <div style={{
      marginBottom: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* Main Luxury Banner */}
      <div className="white-card" style={{
        padding: '36px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}>
        {/* Decorative soft gradient blobs */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(223, 216, 247, 0.45) 0%, rgba(255, 218, 207, 0.3) 60%, transparent 80%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          {/* Top Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--blue-soft)',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--blue-primary)',
            marginBottom: '16px',
          }}>
            <Star size={12} fill="var(--blue-primary)" stroke="var(--blue-primary)" />
            <span>Grand Royal Palm Hotel • Java 21 OOP Engine</span>
          </div>

          <h2 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--text-title)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '12px',
          }}>
            Timeless Luxury, Effortless Hospitality.
          </h2>

          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}>
            Welcome to the premier Java-engineered reservation system. Experience real-time room availability, polymorphic rate calculations, instant itemized billing, and reliable CSV persistence.
          </p>
        </div>

        {/* Quick Booking Search Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-light)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
          gap: '14px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Check-in */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Check-In Date
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={15} style={{ color: 'var(--blue-primary)' }} />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-title)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Check-out */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Check-Out Date
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={15} style={{ color: 'var(--blue-primary)' }} />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-title)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Room Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Room Category
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BedDouble size={15} style={{ color: 'var(--blue-primary)' }} />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-title)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Standard">Standard (₹110/nt)</option>
                <option value="Suite">Executive Suite (₹240/nt)</option>
              </select>
            </div>
          </div>

          {/* Guests */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Guests
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={15} style={{ color: 'var(--blue-primary)' }} />
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-title)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>
          </div>

          {/* Search & Book CTA Button */}
          <button
            onClick={handleSearchAndBook}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.9rem', height: '46px' }}
          >
            <Search size={16} />
            <span>Search & Book</span>
          </button>
        </div>
      </div>

      {/* 4 Feature Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="white-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--blue-soft)',
            color: 'var(--blue-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-title)' }}>
              Itemized Billing
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Automatic rate & tax calc
            </div>
          </div>
        </div>

        <div className="white-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-title)' }}>
              Role-Based Access
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Admin, Staff & Guest roles
            </div>
          </div>
        </div>

        <div className="white-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#fff7ed',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-title)' }}>
              CSV Persistence
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Retains records between runs
            </div>
          </div>
        </div>

        <div className="white-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#f5f3ff',
            color: '#7e22ce',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-title)' }}>
              Luxury Suites
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Jacuzzi, Butler & City view
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
