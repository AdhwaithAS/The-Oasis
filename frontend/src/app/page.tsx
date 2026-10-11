'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import DashboardStats from '../components/DashboardStats';
import ReservationsTable from '../components/ReservationsTable';
import RoomInventory from '../components/RoomInventory';
import AuditLogsTable from '../components/AuditLogsTable';
import BookingModal from '../components/BookingModal';
import BillModal from '../components/BillModal';
import EditReservationModal from '../components/EditReservationModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AddStaffModal from '../components/AddStaffModal';
import GuestLandingPage from '../components/GuestLandingPage';
import { api } from '../lib/api';
import { Bill, HotelStats, Reservation, Room, User } from '../lib/types';
import { CheckCircle, AlertCircle, Plus, BedDouble, CalendarDays, ShieldCheck, UserPlus } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reservations' | 'rooms' | 'logs'>('dashboard');

  // RBAC User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [stats, setStats] = useState<HotelStats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<Room | null>(null);

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);

  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('hotel_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('hotel_user');
      localStorage.removeItem('hotel_token');
    } catch {}
    showToast('Signed out successfully.', 'info');
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, roomsData, resData] = await Promise.all([
        api.getStats(),
        api.getRooms(),
        api.getReservations(),
      ]);
      setStats(statsData);
      setRooms(roomsData);
      setReservations(resData);
      setIsBackendConnected(true);
    } catch (err: any) {
      console.error('Error fetching data from Java backend:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Role-based filtered reservations for guest view
  const visibleReservations = (currentUser?.role === 'GUEST' && currentUser?.email)
    ? reservations.filter((r) => r.customer?.email?.toLowerCase() === currentUser.email.toLowerCase())
    : reservations;

  // RBAC operations
  const handleCheckIn = async (reservationId: string) => {
    if (currentUser?.role === 'GUEST') {
      showToast('Guest accounts cannot perform check-in. Front desk staff only.', 'error');
      return;
    }
    try {
      const res = await api.checkInGuest(reservationId);
      showToast(`Guest ${res.customer?.name} checked in to Room ${res.room?.roomNumber}!`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed.', 'error');
    }
  };

  const handleCheckOut = async (reservationId: string) => {
    if (currentUser?.role === 'GUEST') {
      showToast('Guest accounts cannot perform check-out. Front desk staff only.', 'error');
      return;
    }
    try {
      const res = await api.checkOutGuest(reservationId);
      showToast(`Guest ${res.customer?.name} checked out from Room ${res.room?.roomNumber}. Generating bill...`);
      loadData();
      handleViewBill(reservationId);
    } catch (err: any) {
      showToast(err.message || 'Check-out failed.', 'error');
    }
  };

  const handleCancel = async (reservationId: string) => {
    try {
      await api.cancelReservation(reservationId);
      showToast(`Reservation ${reservationId} cancelled.`, 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed.', 'error');
    }
  };

  const handleViewBill = async (reservationId: string) => {
    try {
      const bill = await api.getBill(reservationId);
      setCurrentBill(bill);
      setBillModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate bill.', 'error');
    }
  };

  const handleOpenBookingWithRoom = (room?: Room | null) => {
    setPreselectedRoom(room || null);
    setBookingModalOpen(true);
  };

  const handleDeleteTrigger = (res: Reservation) => {
    if (currentUser?.role !== 'ADMIN') {
      showToast('Administrator privilege required to permanently delete records.', 'error');
      return;
    }
    setDeletingReservation(res);
    setDeleteModalOpen(true);
  };

  const handleEditTrigger = (res: Reservation) => {
    if (currentUser?.role === 'GUEST' && res.customer?.email?.toLowerCase() !== currentUser.email.toLowerCase()) {
      showToast('You can only modify your own reservation.', 'error');
      return;
    }
    setEditingReservation(res);
    setEditModalOpen(true);
  };

  // =========================================================================
  // PUBLIC / UNLOGGED GUEST VIEW: Hotel Showcase & Instant Booking Landing Page
  // =========================================================================
  if (!currentUser) {
    return (
      <>
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2000,
            background: '#ffffff',
            border: `1.5px solid ${toast.type === 'error' ? '#fecaca' : toast.type === 'info' ? '#bae6fd' : '#bbf7d0'}`,
            borderRadius: '14px',
            padding: '14px 20px',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 15px 35px -5px rgba(0,0,0,0.15)',
            fontSize: '0.88rem',
            fontWeight: 700,
          }}>
            {toast.type === 'error' ? (
              <AlertCircle size={18} style={{ color: '#dc2626' }} />
            ) : (
              <CheckCircle size={18} style={{ color: '#16a34a' }} />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <GuestLandingPage
          rooms={rooms}
          reservations={reservations}
          onOpenBooking={handleOpenBookingWithRoom}
          onViewBill={handleViewBill}
        />

        {/* Operational Modals for Guest Booking & Billing */}
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => {
            showToast('Room booked successfully! Instant reservation confirmed.');
            loadData();
          }}
          preselectedRoom={preselectedRoom}
        />

        <BillModal
          bill={currentBill}
          isOpen={billModalOpen}
          onClose={() => setBillModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2000,
          background: '#ffffff',
          border: `1.5px solid ${toast.type === 'error' ? '#fecaca' : toast.type === 'info' ? '#bae6fd' : '#bbf7d0'}`,
          borderRadius: '14px',
          padding: '14px 20px',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 15px 35px -5px rgba(0,0,0,0.15)',
          fontSize: '0.88rem',
          fontWeight: 700,
        }}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} style={{ color: '#dc2626' }} />
          ) : (
            <CheckCircle size={18} style={{ color: '#16a34a' }} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => {
          setPreselectedRoom(null);
          setBookingModalOpen(true);
        }}
        isBackendConnected={isBackendConnected}
        onRefresh={loadData}
        loading={loading}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '28px 24px 60px',
      }}>
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Executive Welcome Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #111827 0%, #030712 100%)',
              borderRadius: '24px',
              padding: '28px 32px',
              marginBottom: '24px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <span>The Oasis Luxury Stays</span>
                  <span>•</span>
                  <span>{currentUser ? currentUser.role : 'Guest'} Console</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Welcome, {currentUser ? currentUser.name : 'Guest'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '6px', margin: '6px 0 0' }}>
                  Live hotel operations & guest reservation directory.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('rooms')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <BedDouble size={16} />
                  <span>View All Rooms</span>
                </button>

                {currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => setAddStaffModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 20px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <UserPlus size={16} />
                    <span>Add Staff / Admin</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setPreselectedRoom(null);
                    setBookingModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#ffffff',
                    color: '#111827',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Plus size={16} />
                  <span>Book a Room</span>
                </button>
              </div>
            </div>

            {/* Real Hotel KPI Cards */}
            <DashboardStats
              stats={stats}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenBooking={() => {
                setPreselectedRoom(null);
                setBookingModalOpen(true);
              }}
            />

            {/* Active Reservations Section */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                    {currentUser?.role === 'GUEST' ? 'Your Active Bookings' : 'Active Guest Reservations'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                    Manage check-ins, check-outs, itemized invoices, and customer stay details.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('reservations')}
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#111827',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View full table →
                </button>
              </div>

              <ReservationsTable
                reservations={visibleReservations}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
                onViewBill={handleViewBill}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                loading={loading}
              />
            </div>

            {/* Room Inventory Preview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                    Room Inventory & Suites
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                    Current occupancy status across Standard Rooms and Executive Luxury Suites.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('rooms')}
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#111827',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all rooms →
                </button>
              </div>

              <RoomInventory
                rooms={rooms}
                onBookRoom={handleOpenBookingWithRoom}
              />
            </div>
          </div>
        )}

        {/* TAB 2: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {currentUser?.role === 'GUEST' ? 'My Reservations' : 'Guest Reservations Management'}
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0' }}>
                Real-time booking directory with check-in, check-out, billing, and search filters.
              </p>
            </div>

            <ReservationsTable
              reservations={visibleReservations}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCancel={handleCancel}
              onViewBill={handleViewBill}
              onEdit={handleEditTrigger}
              onDelete={handleDeleteTrigger}
              loading={loading}
            />
          </div>
        )}

        {/* TAB 3: ROOMS */}
        {activeTab === 'rooms' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Room Inventory Directory
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0' }}>
                Browse Standard Rooms and Luxury Suites with rates, amenities, and instant booking.
              </p>
            </div>

            <RoomInventory
              rooms={rooms}
              onBookRoom={handleOpenBookingWithRoom}
            />
          </div>
        )}

        {/* TAB 4: AUDIT LOGS (ADMIN ONLY) */}
        {activeTab === 'logs' && currentUser?.role === 'ADMIN' && (
          <div>
            <AuditLogsTable />
          </div>
        )}
      </main>

      {/* Operational Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => {
          showToast('Room booked successfully!');
          loadData();
        }}
        preselectedRoom={preselectedRoom}
      />

      <BillModal
        bill={currentBill}
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
      />

      <EditReservationModal
        isOpen={editModalOpen}
        reservation={editingReservation}
        rooms={rooms}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          showToast('Reservation updated successfully!');
          loadData();
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        reservation={deletingReservation}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => {
          showToast('Reservation deleted permanently.', 'info');
          loadData();
        }}
      />

      <AddStaffModal
        isOpen={addStaffModalOpen}
        onClose={() => setAddStaffModalOpen(false)}
        onSuccess={() => {
          showToast('New staff / admin account provisioned successfully!');
        }}
      />
    </div>
  );
}
