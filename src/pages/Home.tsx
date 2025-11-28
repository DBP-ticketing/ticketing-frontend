import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return '/events';
    if (user.role === 'ROLE_ADMIN') return '/admin';
    if (user.role === 'ROLE_HOST') return '/host';
    return '/events';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="MOL" className="w-32 h-32 rounded-3xl shadow-2xl" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            최고의 티켓팅 경험
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            공정한 대기열 시스템으로 모든 사용자에게 동등한 기회를 제공합니다
          </p>

          <div className="flex justify-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="btn-primary text-lg px-8 py-4">
                  {user?.role === 'ROLE_ADMIN' && '관리자 대시보드'}
                  {user?.role === 'ROLE_HOST' && '호스트 대시보드'}
                  {user?.role === 'ROLE_USER' && '이벤트 둘러보기'}
                </Link>
                {user?.role === 'ROLE_USER' && (
                  <Link to="/bookings" className="btn-secondary text-lg px-8 py-4">
                    예매 내역
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/events" className="btn-primary text-lg px-8 py-4">
                  이벤트 둘러보기
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">실시간 대기열</h3>
            <p className="text-gray-600">
              공정한 대기열 시스템으로 순서대로 입장
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">빠른 결제</h3>
            <p className="text-gray-600">
              카카오페이 간편 결제 지원
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">간편 예매</h3>
            <p className="text-gray-600">
              직관적인 UI로 쉽고 빠른 예매
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
