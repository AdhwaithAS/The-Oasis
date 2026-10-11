'use client';

import React from 'react';
import { Room } from '../lib/types';
import { Users, Check, Plus, BedDouble, Sparkles } from 'lucide-react';

interface RoomInventoryProps {
  rooms: Room[];
  onBookRoom: (room: Room) => void;
}

export default function RoomInventory({ rooms, onBookRoom }: RoomInventoryProps) {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em' }}>
          Curated Stays & Private Sanctuaries
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Each space is thoughtfully designed to spark connection and unforgettable moments.
        </p>
      </div>

      {/* Grid of rooms */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: '20px',
      }}>
        {rooms.map((room) => {
          const isSuite = room.roomType === 'Suite';
          return (
            <div
              key={room.roomNumber}
              className="white-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isSuite ? '1px solid #e9d5ff' : '1px solid var(--border-light)',
                background: isSuite ? 'linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)' : '#ffffff',
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)' }}>
                        Room {room.roomNumber}
                      </span>
                      <span className={`badge ${isSuite ? 'badge-suite' : 'badge-standard'}`}>
                        {room.roomType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      <Users size={13} />
                      <span>Capacity: up to {room.capacity} guests</span>
                    </div>
                  </div>

                  {/* Vacancy indicator */}
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: room.isAvailable ? '#ecfdf5' : '#fff1f2',
                      color: room.isAvailable ? '#059669' : '#e11d48',
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: room.isAvailable ? '#10b981' : '#f43f5e',
                      }} />
                      {room.isAvailable ? 'Vacant' : 'Occupied'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  {room.description}
                </p>

                {/* Price block */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-title)' }}>
                      ₹{room.basePricePerNight}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}> / night</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <div>Tax: {(room.taxRate * 100).toFixed(0)}%</div>
                    {isSuite && <div style={{ color: '#7e22ce', fontWeight: 600 }}>+ ₹25 luxury fee</div>}
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Amenities Included
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {room.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-full)',
                          padding: '3px 10px',
                          fontSize: '0.74rem',
                          color: 'var(--text-main)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={11} style={{ color: '#10b981' }} />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => onBookRoom(room)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                <Plus size={16} />
                <span>Reserve Room {room.roomNumber}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
