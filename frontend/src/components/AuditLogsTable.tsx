'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AuditLogsTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="white-card" style={{ padding: '24px 20px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#faf5ff',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              System & Security Audit Trail
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
              Tracks authentication events, reservation modifications, and RBAC policy evaluations.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '12px',
          color: '#dc2626',
          fontSize: '0.84rem',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 14px' }}>Timestamp</th>
              <th style={{ padding: '12px 14px' }}>Action</th>
              <th style={{ padding: '12px 14px' }}>Actor</th>
              <th style={{ padding: '12px 14px' }}>Role</th>
              <th style={{ padding: '12px 14px' }}>Target Resource</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#64748b' }}>
                  {loading ? 'Loading audit events...' : 'No audit log entries recorded yet.'}
                </td>
              </tr>
            ) : (
              logs.map((log: any, idx: number) => {
                const isSuccess = log.status === 'SUCCESS';
                return (
                  <tr
                    key={log.id || idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '12px 14px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {log.actor_email || 'System'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: log.actor_role === 'ADMIN' ? '#eff6ff' : log.actor_role === 'STAFF' ? '#f0fdf4' : '#f8fafc',
                        color: log.actor_role === 'ADMIN' ? '#2563eb' : log.actor_role === 'STAFF' ? '#16a34a' : '#64748b',
                      }}>
                        {log.actor_role || 'ANON'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'monospace' }}>
                      {log.target_resource || '-'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: isSuccess ? '#16a34a' : '#dc2626',
                      }}>
                        {isSuccess ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                        {log.status || 'OK'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
