'use client';

import React, { useState } from 'react';
import { Reservation, ReservationStatus } from '../lib/types';
import {
  Search,
  CheckCircle2,
  LogOut,
  FileText,
  Edit2,
  Trash2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface ReservationsTableProps {
  reservations: Reservation[];
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
  onCancel: (id: string) => void;
  onViewBill: (id: string) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  loading: boolean;
  externalSearch?: string;
}

export default function ReservationsTable({
  reservations,
  onCheckIn,
  onCheckOut,
  onCancel,
  onViewBill,
  onEdit,
  onDelete,
  loading,
  externalSearch = '',
}: ReservationsTableProps) {
  const [internalSearch, setInternalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomTypeFilter, setRoomTypeFilter] = useState('ALL');

  const effectiveSearch = externalSearch || internalSearch;

  const filtered = reservations.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (roomTypeFilter !== 'ALL' && r.room?.roomType !== roomTypeFilter) return false;
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      const matchId = r.reservationId.toLowerCase().includes(q);
      const matchName = r.customer?.name.toLowerCase().includes(q);
      const matchEmail = r.customer?.email.toLowerCase().includes(q);
      const matchPhone = r.customer?.phone.toLowerCase().includes(q);
      const matchRoom = r.room?.roomNumber.toLowerCase().includes(q);
      return matchId || matchName || matchEmail || matchPhone || matchRoom;
    }
    return true;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'BOOKED':
        return (
          <span className="badge badge-booked">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
            <span>Booked</span>
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="badge badge-in">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }} />
            <span>Checked In</span>
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="badge badge-out">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <span>Checked Out</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-cancelled">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e11d48' }} />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="white-card" style={{ padding: '20px 18px', overflow: 'hidden' }}>
      {/* Header and Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em' }}>
            Reservations Management
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Showing {filtered.length} of {reservations.length} live records
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Internal search if no external search is given */}
          {!externalSearch && (
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                placeholder="Search stays..."
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-input)',
                  border: '1px solid transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid transparent',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Room Type Filter */}
          <select
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid transparent',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">All Room Types</option>
            <option value="Standard">Standard</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              <th style={{ padding: '12px 14px' }}>Reservation ID</th>
              <th style={{ padding: '12px 14px' }}>Guest Details</th>
              <th style={{ padding: '12px 14px' }}>Room</th>
              <th style={{ padding: '12px 14px' }}>Dates & Nights</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px' }}>Total Amount</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <div>No matching reservations found.</div>
                </td>
              </tr>
            ) : (
              filtered.map((res) => (
                <tr
                  key={res.reservationId}
                  style={{
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Reservation ID */}
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--blue-primary)',
                      fontSize: '0.84rem',
                      background: 'var(--blue-soft)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {res.reservationId}
                    </span>
                  </td>

                  {/* Guest Info */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-title)', fontSize: '0.9rem' }}>
                      {res.customer?.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{res.customer?.email}</span>
                      <span>•</span>
                      <span>{res.customer?.phone}</span>
                    </div>
                  </td>

                  {/* Room */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-title)' }}>
                        Room {res.room?.roomNumber}
                      </span>
                      <span className={`badge ${res.room?.roomType === 'Suite' ? 'badge-suite' : 'badge-standard'}`}>
                        {res.room?.roomType}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      ₹{res.room?.basePricePerNight}/nt
                    </div>
                  </td>

                  {/* Dates */}
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <span>{res.checkInDate}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{res.checkOutDate}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {res.numberOfNights} night{res.numberOfNights > 1 ? 's' : ''}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    {getStatusBadge(res.status)}
                  </td>

                  {/* Total */}
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-title)', fontSize: '0.94rem' }}>
                      ₹{res.totalAmount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Tax & fees incl.
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Check-in */}
                      {res.status === 'BOOKED' && (
                        <button
                          onClick={() => onCheckIn(res.reservationId)}
                          className="btn btn-sm"
                          style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}
                          title="Check In Guest"
                        >
                          <CheckCircle2 size={13} />
                          <span>Check In</span>
                        </button>
                      )}

                      {/* Check-out */}
                      {res.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => onCheckOut(res.reservationId)}
                          className="btn btn-sm"
                          style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
                          title="Check Out Guest"
                        >
                          <LogOut size={13} />
                          <span>Check Out</span>
                        </button>
                      )}

                      {/* View Bill */}
                      <button
                        onClick={() => onViewBill(res.reservationId)}
                        className="btn-circle"
                        style={{ width: '30px', height: '30px', boxShadow: 'none', background: 'var(--bg-input)' }}
                        title="View & Print Bill"
                      >
                        <FileText size={14} style={{ color: 'var(--blue-primary)' }} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(res)}
                        className="btn-circle"
                        style={{ width: '30px', height: '30px', boxShadow: 'none', background: 'var(--bg-input)' }}
                        title="Edit Details"
                      >
                        <Edit2 size={14} style={{ color: 'var(--text-main)' }} />
                      </button>

                      {/* Cancel */}
                      {res.status !== 'CANCELLED' && res.status !== 'CHECKED_OUT' && (
                        <button
                          onClick={() => onCancel(res.reservationId)}
                          className="btn-circle"
                          style={{ width: '30px', height: '30px', boxShadow: 'none', background: '#fff0f3' }}
                          title="Cancel Reservation"
                        >
                          <XCircle size={14} style={{ color: '#ff6584' }} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(res)}
                        className="btn-circle"
                        style={{ width: '30px', height: '30px', boxShadow: 'none', background: '#ffe4e6' }}
                        title="Delete (Confirmation required)"
                      >
                        <Trash2 size={14} style={{ color: '#e11d48' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
