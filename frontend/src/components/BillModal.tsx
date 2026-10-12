'use client';

import React, { useState } from 'react';
import { Bill } from '../lib/types';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';

interface BillModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BillModal({ bill, isOpen, onClose }: BillModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'invoice' | 'raw'>('invoice');

  if (!isOpen || !bill) return null;

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(bill.formattedReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3.5vw, 28px)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
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
              flexShrink: 0,
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 800, color: 'var(--text-title)' }}>
                Stay Bill & Receipt
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Invoice #{bill.billId} • Reservation {bill.reservationId}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-full)',
              padding: '3px',
            }}>
              <button
                onClick={() => setActiveView('invoice')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: activeView === 'invoice' ? '#ffffff' : 'transparent',
                  color: activeView === 'invoice' ? 'var(--blue-primary)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeView === 'invoice' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Invoice
              </button>
              <button
                onClick={() => setActiveView('raw')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: activeView === 'raw' ? '#ffffff' : 'transparent',
                  color: activeView === 'raw' ? 'var(--blue-primary)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeView === 'raw' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                ASCII Text
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn-circle"
              style={{ width: '34px', height: '34px', border: 'none', background: 'var(--bg-input)', boxShadow: 'none' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(16px, 3.5vw, 28px)' }}>
          {activeView === 'invoice' ? (
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(14px, 2.5vw, 24px)',
            }}>
              {/* Hotel Brand Head */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em' }}>
                    The Oasis
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    The Oasis Luxury Hotel & Resort • Official Statement
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${bill.paymentStatus === 'PAID' ? 'badge-in' : 'badge-booked'}`}>
                    {bill.paymentStatus === 'PAID' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} strokeWidth={2.8} />
                        <span>PAID IN FULL</span>
                      </span>
                    ) : (
                      'PAYMENT DUE'
                    )}
                  </span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Date: {bill.generatedAt.split('T')[0]}
                  </div>
                </div>
              </div>

              {/* Guest & Room Details Grid */}
              <div className="form-grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                    Billed To
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-title)', fontSize: '0.98rem' }}>{bill.customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{bill.customerEmail}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bill.customerPhone}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                    Stay Summary
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--blue-primary)', fontSize: '0.96rem' }}>
                    Room {bill.roomNumber} ({bill.roomType})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {bill.checkInDate} to {bill.checkOutDate}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {bill.numberOfNights} Night(s) Stay
                  </div>
                </div>
              </div>

              {/* Charges */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  <span>Room Charges ({bill.numberOfNights} nights @ ₹{bill.ratePerNight.toFixed(2)}/nt)</span>
                  <span style={{ fontWeight: 600 }}>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>Hospitality Tax & Maintenance ({(bill.taxRate * 100).toFixed(0)}%)</span>
                  <span>+₹{bill.taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--blue-primary)' }}>₹{bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bill-receipt scroll-touch">
              {bill.formattedReceipt}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={handleCopyReceipt}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied ASCII' : 'Copy ASCII Text'}</span>
            </button>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handlePrint} className="btn btn-secondary">
                <Printer size={16} />
                <span>Print Bill</span>
              </button>
              <button onClick={onClose} className="btn btn-primary" style={{ minWidth: '80px' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
