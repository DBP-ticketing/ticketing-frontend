import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignUpHost from './pages/SignUpHost';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Queue from './pages/Queue';
import Booking from './pages/Booking';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import PaymentFail from './pages/PaymentFail';
import AdminDashboard from './pages/AdminDashboard';
import HostDashboard from './pages/HostDashboard';


function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/host" element={<SignUpHost />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          
          {/* User routes */}
          <Route path="/queue/:eventId" element={<PrivateRoute><Queue /></PrivateRoute>} />
          <Route path="/booking/:eventId" element={<PrivateRoute><Booking /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
          <Route path="/bookings/:bookingId" element={<PrivateRoute><BookingDetail /></PrivateRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<PrivateRoute allowedRoles={['ROLE_ADMIN']}><AdminDashboard /></PrivateRoute>} />
          
          {/* Host routes */}
          <Route path="/host" element={<PrivateRoute allowedRoles={['ROLE_HOST']}><HostDashboard /></PrivateRoute>} />
          
          {/* Payment callbacks */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
        </Routes>
        
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;