'use client';

import React from 'react';
import { Calendar, ArrowUpRight, ArrowDownCircle, ArrowUpCircle, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Reservation, Room } from '../lib/types';

interface RightSidebarProps {
  reservations: Reservation[];
  rooms: Room[];
  onViewBill: (id: string) => void;
  onOpenBooking: () => void;
}

export default function RightSidebar({
  reservations,
  rooms,
  onViewBill,
  onOpenBooking,
}: RightSidebarProps) {
  // Take top 4 recent/active movements
  const movements = reservations.slice(0, 4);

  const categories = [
    { name: 'Standard Rooms', pct: 71, trend: 'down', trendVal: '-4%' },
    { name: 'Executive Suites', pct: 92, trend: 'up', trendVal: '+12%' },
    { name: 'Presidential Suites', pct: 33, trend: 'down', trendVal: '-8%' },
    { name: 'Family Suites', pct: 56, trend: 'up', trendVal: '+6%' },
    { name: 'Deluxe Rooms', pct: 79, trend: 'up', trendVal: '+15%' },
  ];

  return (
    <aside style={{
      width: '100%',
      maxWidth: '360px',
      padding: '22px 18px',
      borderLeft: '1px solid var(--border-sidebar)',
      background: 'var(--bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      flexShrink: 0,
    }}>
      {/* SECTION 1: TODAY'S MOVEMENTS / MEETINGS */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)', letterSpacing: '-0.01em' }}>
            Today's movements
          </h3>
          <button
            onClick={onOpenBooking}
            className="btn-circle"
            title="Calendar / Schedule Booking"
            style={{ width: '38px', height: '38px' }}
          >
            <Calendar size={18} style={{ color: 'var(--text-main)' }} />
          </button>
        </div>

        {/* Movements List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {movements.map((res, index) => {
            const isLast = index === movements.length - 1;
            return (
              <div
                key={res.reservationId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => onViewBill(res.reservationId)}
              >
                {/* Left: Date & Time */}
                <div style={{ width: '90px', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-title)' }}>
                    {res.checkInDate ? res.checkInDate.substring(5) : 'Today'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {res.status === 'CHECKED_IN' ? 'Active Stay' : res.status === 'CHECKED_OUT' ? 'Departed' : '02:00 pm'}
                  </div>
                </div>

                {/* Middle: Title & Tag */}
                <div style={{ flex: 1, padding: '0 12px' }}>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-title)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '160px',
                  }}>
                    {res.customer?.name || 'Guest'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: res.room?.roomType === 'Suite' ? '#8b5cf6' : '#2f65f6',
                    }} />
                    <span>Room {res.room?.roomNumber} ({res.room?.roomType})</span>
                  </div>
                </div>

                {/* Right: Arrow Button */}
                <button
                  className="btn-circle"
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'transparent',
                    boxShadow: 'none',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ArrowUpRight size={17} />
                </button>
              </div>
            );
          })}
        </div>

        {/* See all link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={onOpenBooking}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>See all reservations</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* SECTION 2: DEVELOPED AREAS / ROOM CATEGORIES */}
      <div>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)', letterSpacing: '-0.01em' }}>
            Developed areas
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Most common categories of hotel occupancy
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {categories.map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {/* Category Name */}
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-title)',
                width: '115px',
                flexShrink: 0,
              }}>
                {cat.name}
              </div>

              {/* Progress Bar */}
              <div style={{
                flex: 1,
                height: '7px',
                background: '#e9eef5',
                borderRadius: '9999px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  width: `${cat.pct}%`,
                  height: '100%',
                  background: 'var(--blue-primary)',
                  borderRadius: '9999px',
                }} />
              </div>

              {/* Percentage & Trend Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '60px',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {cat.pct}%
                </span>
                {cat.trend === 'up' ? (
                  <ArrowUpCircle size={15} style={{ color: '#2f65f6' }} />
                ) : (
                  <ArrowDownCircle size={15} style={{ color: '#f97316' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
