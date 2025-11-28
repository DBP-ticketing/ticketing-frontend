import axios from 'axios';
import type {
  Event,
  EventDetail,
  Seat,
  QueueStatus,
  Booking,
  PaymentResponse,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  Host,
  Place,
} from '../types/api';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const queueToken = localStorage.getItem('Queue-Token');
  const eventId = localStorage.getItem('Event-Id');
  if (queueToken && eventId) {
    config.headers['Queue-Token'] = queueToken;
    config.headers['Event-Id'] = eventId;
  }

  return config;
});

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  
  signUpUser: (data: SignUpRequest) =>
    api.post<ApiResponse<void>>('/auth/signup/user', data),
  
  logout: () => api.post('/auth/logout'),
};

export const eventApi = {
  getEvents: (status?: string) =>
    api.get<Event[]>('/events', { params: { status } }),
  
  getEventDetail: (eventId: number) =>
    api.get<EventDetail>(`/events/${eventId}`),
  
  createEvent: (data: any) =>
    api.post<number>('/events', data),
};

export const seatApi = {
  getSeats: (eventId: number) =>
    api.get<Seat[]>(`/seat/${eventId}`),
};

export const queueApi = {
  joinQueue: (eventId: number) =>
    api.post<string>(`/queue/${eventId}`),
  
  getRank: (eventId: number) =>
    api.get<QueueStatus>(`/queue/rank/${eventId}`),
};

export const bookingApi = {
  createBooking: (data: { eventId?: number; seatId?: number }) =>
    api.post<Booking>('/bookings', data),
  
  cancelBooking: (bookingId: number) =>
    api.delete<Booking>(`/bookings/${bookingId}`),
  
  getMyBookings: (status?: string) =>
    api.get<Booking[]>('/bookings/my', { params: { status } }),
};

export const paymentApi = {
  ready: (bookingId: number) =>
    api.post<PaymentResponse>(`/payment/ready/${bookingId}`),
};

export const adminApi = {
  getPendingHosts: () =>
    api.get<ApiResponse<Host[]>>('/admin/host/pending'),
  
  getAllHosts: () =>
    api.get<ApiResponse<Host[]>>('/admin/host'),
  
  approveHost: (hostId: number) =>
    api.post<ApiResponse<void>>(`/admin/${hostId}/approve`),
  
  rejectHost: (hostId: number) =>
    api.post<ApiResponse<void>>(`/admin/${hostId}/reject`),
  
  suspendHost: (hostId: number) =>
    api.post<ApiResponse<void>>(`/admin/${hostId}/suspend`),
  
  activateHost: (hostId: number) =>
    api.post<ApiResponse<void>>(`/admin/${hostId}/activate`),
};

export const placeApi = {
  getAllPlaces: () =>
    api.get<ApiResponse<Place[]>>('/place'),
  
  createPlace: (data: any) =>
    api.post<number>('/place/create', data),
  
  getPlace: (placeId: number) =>
    api.get<Place>(`/place/${placeId}`),
  
  deletePlace: (placeId: number) =>
    api.delete(`/place/${placeId}`),
};

export default api;
