'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Reservation, Room } from '../lib/types';
import { X, Calendar, User, Mail, Phone, BedDouble, AlertCircle, Save } from 'lucide-react';

interface EditReservationModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rooms: Room[];
}

export default function EditReservationModal({
  reservation,
  isOpen,
  onClose,
  onSuccess,
  rooms,
}: EditReservationModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (reservation && isOpen) {
      setCustomerName(reservation.customer?.name || '');
      setEmail(reservation.customer?.email || '');
      setPhone(reservation.customer?.phone || '');
      setRoomNumber(reservation.room?.roomNumber || '');
      setCheckInDate(reservation.checkInDate || '');
      setCheckOutDate(reservation.checkOutDate || '');
      setSpecialRequests(reservation.specialRequests || '');
      setErrorMsg('');
    }
  }, [reservation, isOpen]);

  if (!isOpen || !reservation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Customer name must be at least 2 characters.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (phone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setErrorMsg('Check-out date must be strictly after the check-in date.');
      return;
    }

    try {
      setSaving(true);
      await api.updateReservation(reservation.reservationId, {
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        roomNumber: roomNumber.trim(),
        checkInDate,
        checkOutDate,
        specialRequests: specialRequests.trim(),
      });
      setSaving(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setSaving(false);
      setErrorMsg(err.message || 'Failed to update reservation.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3.5vw, 28px)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 800, color: 'var(--text-title)' }}>
              Edit Reservation {reservation.reservationId}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Update guest details, room assignment, or stay dates
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-circle"
            style={{ width: '34px', height: '34px', border: 'none', background: 'var(--bg-input)', boxShadow: 'none', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
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

          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Check-in Date</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check-out Date</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Room</label>
            <select
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="form-select"
            >
              {rooms.map((r) => (
                <option key={r.roomNumber} value={r.roomNumber}>
                  Room {r.roomNumber} ({r.roomType} Room - ₹{r.basePricePerNight}/nt)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Special Requests</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="form-textarea"
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: '1 1 100px' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: '1 1 140px' }}>
              <Save size={16} />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
