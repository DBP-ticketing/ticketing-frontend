export interface Event {
  eventId: number;
  eventName: string;
  hostName: string;
  placeName: string;
  date: string;
  ticketingStartAt: string;
  category: string;
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';
  seatForm: 'ASSIGNED' | 'FREE' | 'STANDING';
}

export interface EventDetail extends Event {
  address: string;
}

export interface Seat {
  seatId: number;
  section: string;
  row: number;
  col: number;
  seatLevel: string;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNAVAILABLE';
}

export interface QueueStatus {
  rank: number | null;
  active: boolean;
}

export interface Booking {
  bookingId: number;
  eventName: string;
  section: string;
  seatRow?: number;
  seatCol?: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface PaymentResponse {
  bookingId: number;
  tid: string;
  paymentUrl: string;
  status: string;
  amount: number;
  approvedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface Host {
  hostId: number;
  email: string;
  name: string;
  phoneNumber: string;
  companyName: string;
  businessNumber: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
}

export interface Place {
  placeId: number;
  placeName: string;
  address: string;
  sections: PlaceSection[];
}

export interface PlaceSection {
  sectionName: string;
  rowCount: number;
  colCount: number;
}
