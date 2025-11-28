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
  SignUpHostRequest,
  Host,
  Place,
} from '../types/api';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터
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

// Response 인터셉터 - 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // JWT 만료 또는 인증 실패
      console.log('인증 만료: 로그아웃 처리');
      
      // localStorage 클리어
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('Queue-Token');
      localStorage.removeItem('Event-Id');
      
      // 로그인 페이지로 리다이렉트 (로그인/회원가입 페이지가 아닐 때만)
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/signup' &&
          window.location.pathname !== '/signup/host') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  
  signUpUser: (data: SignUpRequest) =>
    api.post<ApiResponse<void>>('/auth/signup/user', data),
  
  signUpHost: (data: SignUpHostRequest) =>
    api.post<ApiResponse<void>>('/auth/signup/host', data),
  
  logout: () => api.post('/auth/logout'),
};

export const eventApi = {
  getEvents: (status?: string) => {
    const params: any = {};
    if (status) params.status = status;
    return api.get<Event[]>('/events', { params });
  },
  
  getEventDetail: (eventId: number) =>
    api.get<EventDetail>(`/events/${eventId}`),
  
  createEvent: (data: any) =>
    api.post<number>('/events', data),
  
  getMyHostEvents: () =>
    api.get<Event[]>('/events/my'),
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
  
  getMyBookings: (status?: string) => {
    const params: any = {};
    if (status) params.status = status;
    return api.get<Booking[]>('/bookings/my', { params });
  },
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
    api.get<Place[]>('/place'),
  
  createPlace: (data: any) =>
    api.post<number>('/place/create', data),
  
  getPlace: (placeId: number) =>
    api.get<Place>(`/place/${placeId}`),
  
  deletePlace: (placeId: number) =>
    api.delete(`/place/${placeId}`),
};

export default api;
