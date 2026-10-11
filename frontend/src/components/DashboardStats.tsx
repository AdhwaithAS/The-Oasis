'use client';

import React from 'react';
import { HotelStats } from '../lib/types';
import {
  BedDouble,
  IndianRupee,
  CalendarCheck,
  LogIn,
  LogOut,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

interface DashboardStatsProps {
  stats: HotelStats | null;
  onNavigateTab: (tab: 'reservations' | 'rooms') => void;
  onOpenBooking: () => void;
}

export default function DashboardStats({ stats, onNavigateTab, onOpenBooking }: DashboardStatsProps) {
  const occupancyRate = stats ? Math.round(stats.occupancyRate * 10) / 10 : 0;
  const totalRevenue = stats ? Math.round(stats.totalRevenue).toLocaleString() : '0';
  const totalRooms = stats?.totalRooms ?? 0;
  const occupiedRooms = stats?.occupiedRooms ?? 0;
  const availableRooms = stats?.availableRooms ?? Math.max(0, totalRooms - occupiedRooms);
  const bookedCount = stats?.bookedReservations ?? 0;
  const totalReservations = stats?.totalReservations ?? 0;
  const checkInsToday = stats?.checkInsToday ?? 0;
  const checkOutsToday = stats?.checkOutsToday ?? 0;
  const standardCount = stats?.standardRoomsCount ?? 0;
  const suiteCount = stats?.suiteRoomsCount ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
      {/* 4 Primary Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
      }}>
        {/* CARD 1: OCCUPANCY RATE */}
        <div
          className="white-card"
          onClick={() => onNavigateTab('rooms')}
          style={{
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            minHeight: '150px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Occupancy Rate
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {occupancyRate}%
              </span>
              <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                {occupiedRooms} / {totalRooms} rooms
              </span>
            </div>
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: '#f1f5f9',
              borderRadius: '9999px',
              marginTop: '12px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, occupancyRate))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #111827 0%, #374151 100%)',
                borderRadius: '9999px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL REVENUE */}
        <div
          className="white-card"
          onClick={() => onNavigateTab('reservations')}
          style={{
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            minHeight: '150px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Revenue
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IndianRupee size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
              ₹{totalRevenue}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>
              From {totalReservations} booked stays & invoices
            </div>
          </div>
        </div>

        {/* CARD 3: AVAILABLE VACANT ROOMS */}
        <div
          className="white-card"
          onClick={() => onNavigateTab('rooms')}
          style={{
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            minHeight: '150px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Available Rooms
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BedDouble size={16} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {availableRooms}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                vacant right now
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>
              {standardCount} Standards • {suiteCount} Luxury Suites
            </div>
          </div>
        </div>

        {/* CARD 4: TODAY'S OPERATIONS */}
        <div
          className="white-card"
          onClick={() => onNavigateTab('reservations')}
          style={{
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            minHeight: '150px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Front Desk Today
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CalendarCheck size={16} />
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogIn size={15} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {checkInsToday}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    Check-ins
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={15} style={{ color: '#dc2626' }} />
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {checkOutsToday}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    Check-outs
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '10px', fontWeight: 600 }}>
              {bookedCount} upcoming bookings in system
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
