import { Bill, BookingPayload, HotelStats, Reservation, Room, UpdateReservationPayload } from './types';

// Points to relative /api which next.config.js proxies to Java backend on http://localhost:8080/api
// Or falls back to direct URL if executed outside browser
const BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:8080';

function getAuthHeaders(includeContentType = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hotel_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server returned ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData && errorData.message) {
        errorMsg = errorData.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; supabase?: { configured: boolean; url: string }; storageMode?: string }> {
    const res = await fetch(`${BASE_URL}/api/health`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getStats(): Promise<HotelStats> {
    const res = await fetch(`${BASE_URL}/api/stats`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${BASE_URL}/api/rooms`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getAvailableRooms(checkIn?: string, checkOut?: string, roomType?: string): Promise<Room[]> {
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (roomType) params.append('type', roomType);
    const res = await fetch(`${BASE_URL}/api/rooms/available?${params.toString()}`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getReservations(query = '', status = '', roomType = ''): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status) params.append('status', status);
    if (roomType) params.append('roomType', roomType);
    const res = await fetch(`${BASE_URL}/api/reservations?${params.toString()}`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getReservationById(id: string): Promise<Reservation> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async createBooking(payload: BookingPayload): Promise<Reservation> {
    const res = await fetch(`${BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateReservation(id: string, payload: UpdateReservationPayload): Promise<Reservation> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteReservation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async checkInGuest(id: string): Promise<Reservation> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async checkOutGuest(id: string): Promise<Reservation> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async cancelReservation(id: string): Promise<Reservation> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getBill(id: string): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}/bill`, {
      cache: 'no-store',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async login(payload: { email: string; password: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async register(payload: { name: string; email: string; phone: string; password: string; role: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },
};
