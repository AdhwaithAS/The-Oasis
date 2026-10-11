'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Room } from '../lib/types';
import { X, Calendar, User, Mail, Phone, BedDouble, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedRoom?: Room | null;
}

export default function BookingModal({ isOpen, onClose, onSuccess, preselectedRoom }: BookingModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roomType, setRoomType] = useState<'Standard' | 'Suite'>('Standard');
  const [specificRoomNumber, setSpecificRoomNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const inStr = today.toISOString().split('T')[0];
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 3);
      const outStr = nextDay.toISOString().split('T')[0];

      setCheckInDate(inStr);
      setCheckOutDate(outStr);
      setErrorMsg('');
      setSuccessInfo(null);

      if (preselectedRoom) {
        setRoomType(preselectedRoom.roomType as 'Standard' | 'Suite');
        setSpecificRoomNumber(preselectedRoom.roomNumber);
      } else {
        setSpecificRoomNumber('');
      }
    }
  }, [isOpen, preselectedRoom]);

  useEffect(() => {
    if (!isOpen || !checkInDate || !checkOutDate) return;
    if (checkOutDate <= checkInDate) return;

    let isMounted = true;
    setLoadingRooms(true);
    api.getAvailableRooms(checkInDate, checkOutDate, roomType)
      .then((rooms) => {
        if (isMounted) {
          setAvailableRooms(rooms);
          setLoadingRooms(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingRooms(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, checkInDate, checkOutDate, roomType]);

  if (!isOpen) return null;

  const calculateEstimate = () => {
    if (!checkInDate || !checkOutDate) return null;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)));
    if (isNaN(nights) || nights <= 0) return null;

    const baseRate = roomType === 'Suite' ? 240.0 : 110.0;
    const luxuryFee = roomType === 'Suite' ? 25.0 * nights : 0.0;
    const subtotal = (baseRate * nights) + luxuryFee;
    const taxRate = roomType === 'Suite' ? 0.14 : 0.10;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { nights, baseRate, luxuryFee, subtotal, taxRate, tax, total };
  };

  const estimate = calculateEstimate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Please enter a valid guest name (min 2 characters).');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (phone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number (minimum 7 digits).');
      return;
    }
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setErrorMsg('Check-out date must be strictly after the check-in date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createBooking({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        roomType,
        roomNumber: specificRoomNumber || undefined,
        checkInDate,
        checkOutDate,
        specialRequests: specialRequests.trim(),
      });

      setSuccessInfo(`Booking confirmed! Reservation ID: ${res.reservationId} assigned to Room ${res.room?.roomNumber}.`);
      setSubmitting(false);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Failed to complete booking. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--blue-soft)',
              color: 'var(--blue-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BedDouble size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)' }}>
                New Room Booking
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Assigns unique Reservation ID and saves directly to database via API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-circle"
            style={{ width: '34px', height: '34px', border: 'none', background: 'var(--bg-input)', boxShadow: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
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

          {successInfo && (
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
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Guest Info */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-title)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Guest Profile
            </h4>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kristin Watson"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="guest@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98471 23456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Room Selection */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-title)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Stay & Room Selection
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Check-in Date *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                  <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Check-out Date *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                  <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Room Type Toggle Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div
                onClick={() => { setRoomType('Standard'); setSpecificRoomNumber(''); }}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${roomType === 'Standard' ? 'var(--blue-primary)' : 'var(--border-light)'}`,
                  background: roomType === 'Standard' ? 'var(--blue-soft)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: roomType === 'Standard' ? 'var(--blue-primary)' : 'var(--text-title)' }}>Standard Room</span>
                  <span className="badge badge-standard">₹110/nt</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Queen Bed, Fast Wi-Fi, 4K TV (Cap: 2)</p>
              </div>

              <div
                onClick={() => { setRoomType('Suite'); setSpecificRoomNumber(''); }}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${roomType === 'Suite' ? '#8b5cf6' : 'var(--border-light)'}`,
                  background: roomType === 'Suite' ? '#f5f3ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: roomType === 'Suite' ? '#7e22ce' : 'var(--text-title)' }}>Executive Suite</span>
                  <span className="badge badge-suite">₹240/nt</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>King Bed + Jacuzzi, Lounge, Butler (Cap: 4)</p>
              </div>
            </div>

            {/* Specific Room dropdown */}
            <div className="form-group">
              <label className="form-label">
                Assigned Room {loadingRooms && <span style={{ color: 'var(--blue-primary)', fontSize: '0.75rem' }}>(Checking dates...)</span>}
              </label>
              <select
                value={specificRoomNumber}
                onChange={(e) => setSpecificRoomNumber(e.target.value)}
                className="form-select"
              >
                <option value="">Auto-assign best available {roomType} Room</option>
                {availableRooms.map((room) => (
                  <option key={room.roomNumber} value={room.roomNumber}>
                    Room {room.roomNumber} ({room.roomType} - ₹{room.basePricePerNight}/nt)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests (Optional)</label>
              <textarea
                placeholder="e.g. Ocean view, early check-in, late departure"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="form-textarea"
                rows={2}
              />
            </div>
          </div>

          {/* Estimate Breakdown */}
          {estimate && (
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', fontWeight: 800, fontSize: '0.84rem', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>OOP Rate Engine Estimate</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>{roomType} Room ({estimate.nights} night{estimate.nights > 1 ? 's' : ''} @ ₹{estimate.baseRate}/nt)</span>
                <span style={{ color: 'var(--text-title)', fontWeight: 600 }}>₹{(estimate.baseRate * estimate.nights).toFixed(2)}</span>
              </div>
              {estimate.luxuryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#7e22ce', marginBottom: '4px' }}>
                  <span>Suite Luxury Surcharge (₹25/nt)</span>
                  <span style={{ fontWeight: 600 }}>+₹{estimate.luxuryFee.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Hospitality Tax ({(estimate.taxRate * 100).toFixed(0)}%)</span>
                <span style={{ color: 'var(--text-title)', fontWeight: 600 }}>₹{estimate.tax.toFixed(2)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-title)' }}>
                <span>Total Payable:</span>
                <span style={{ color: 'var(--blue-primary)' }}>₹{estimate.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (availableRooms.length === 0 && !loadingRooms)}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {submitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
