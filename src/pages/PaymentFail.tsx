import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">결제 실패</h1>
          <p className="text-gray-600 mb-8">결제 처리 중 오류가 발생했습니다</p>
          {bookingId && <p className="text-sm text-gray-500 mb-6">예매 번호: {bookingId}</p>}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">문제가 지속되면 고객센터로 문의해주세요</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/bookings')} className="btn-primary w-full">예매 내역 확인</button>
            <button onClick={() => navigate('/events')} className="btn-secondary w-full">다른 이벤트 보기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
