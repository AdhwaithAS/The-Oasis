export type UserRole = 'ADMIN' | 'STAFF' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Room {
  roomNumber: string;
  roomType: 'Standard' | 'Suite' | string;
  basePricePerNight: number;
  capacity: number;
  isAvailable: boolean;
  description: string;
  taxRate: number;
  luxuryServiceFee: number;
  amenities: string[];
}

export type ReservationStatus = 'BOOKED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface Reservation {
  reservationId: string;
  customer: Customer;
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  numberOfNights: number;
  totalAmount: number;
  createdAt: string;
  specialRequests: string;
}

export interface Bill {
  billId: string;
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  ratePerNight: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  generatedAt: string;
  formattedReceipt: string;
}

export interface HotelStats {
  hotelName: string;
  totalRooms: number;
  standardRoomsCount: number;
  suiteRoomsCount: number;
  occupiedRooms: number;
  availableRooms: number;
  bookedReservations: number;
  totalReservations: number;
  occupancyRate: number;
  totalRevenue: number;
  checkInsToday: number;
  checkOutsToday: number;
}

export interface BookingPayload {
  customerName: string;
  email: string;
  phone: string;
  roomType: string;
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
}

export interface UpdateReservationPayload {
  customerName: string;
  email: string;
  phone: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
}
