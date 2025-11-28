import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success('로그아웃되었습니다');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/events';
    if (user.role === 'ROLE_ADMIN') return '/admin';
    if (user.role === 'ROLE_HOST') return '/host';
    return '/events';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="MOL" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">Ticket</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {user?.role === 'ROLE_USER' && (
                  <>
                    <Link 
                      to="/events" 
                      className="text-gray-700 hover:text-primary font-medium transition"
                    >
                      이벤트
                    </Link>
                    <Link 
                      to="/bookings" 
                      className="text-gray-700 hover:text-primary font-medium transition"
                    >
                      예매 내역
                    </Link>
                  </>
                )}
                
                {user?.role === 'ROLE_HOST' && (
                  <Link 
                    to="/host" 
                    className="text-gray-700 hover:text-primary font-medium transition"
                  >
                    호스트 대시보드
                  </Link>
                )}
                
                {user?.role === 'ROLE_ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-primary font-medium transition"
                  >
                    관리자 대시보드
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">{user?.name}님</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary font-medium transition"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/events" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  이벤트
                </Link>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  로그인
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
