import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    localStorage.removeItem('Queue-Token');
    localStorage.removeItem('Event-Id');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">결제 완료!</h1>
          <p className="text-gray-600 mb-8">예매가 성공적으로 완료되었습니다</p>
          {bookingId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">예매 번호</p>
              <p className="text-2xl font-bold text-primary">{bookingId}</p>
            </div>
          )}
          <div className="space-y-3">
            <button onClick={() => navigate('/bookings')} className="btn-primary w-full">예매 내역 확인</button>
            <button onClick={() => navigate('/events')} className="btn-secondary w-full">다른 이벤트 보기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
