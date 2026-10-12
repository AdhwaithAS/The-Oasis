'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { Reservation } from '../lib/types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({
  reservation,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !reservation) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setErrorMsg('');
      await api.deleteReservation(reservation.reservationId);
      setDeleting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setDeleting(false);
      setErrorMsg(err.message || 'Failed to delete reservation.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#ffe4e6',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <AlertTriangle size={22} />
          </div>

          <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 800, color: 'var(--text-title)', marginBottom: '8px' }}>
            Confirm Reservation Deletion
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '16px' }}>
            Are you sure you want to permanently delete reservation{' '}
            <strong style={{ color: 'var(--blue-primary)' }}>{reservation.reservationId}</strong> for{' '}
            <strong style={{ color: 'var(--text-title)' }}>{reservation.customer?.name}</strong>?
            This will permanently remove the record from the database.
          </p>

          {errorMsg && (
            <div style={{
              background: '#fff1f2',
              color: '#e11d48',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.84rem',
            }}>
              {errorMsg}
            </div>
          )}

          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
          }}>
            <div>• Room {reservation.room?.roomNumber} ({reservation.room?.roomType})</div>
            <div>• {reservation.checkInDate} to {reservation.checkOutDate}</div>
            <div>• Status: <strong style={{ textTransform: 'capitalize' }}>{reservation.status}</strong></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} disabled={deleting} className="btn btn-secondary" style={{ flex: '1 1 100px' }}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-sm"
              style={{ background: '#e11d48', color: '#ffffff', padding: '10px 20px', fontWeight: 700, flex: '1 1 140px', justifyContent: 'center' }}
            >
              <Trash2 size={16} />
              <span>{deleting ? 'Deleting...' : 'Yes, Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
